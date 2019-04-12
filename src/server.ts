import { SyntaxErrorData } from 'unicoen.ts/dist/interpreter/mapper/SyntaxErrorData';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { signal } from './components/emitter';
import { Interpreter } from 'unicoen.ts/dist/interpreter/Interpreter';

export type CONTROL_EVENT =
  | 'Exec'
  | 'Start'
  | 'Stop'
  | 'BackAll'
  | 'StepBack'
  | 'Step'
  | 'StepAll'
  | 'SyntaxCheck';
export type DEBUG_STATE =
  | 'First'
  | 'Debugging'
  | 'stdin'
  | 'EOF'
  | 'Stop'
  | 'Executing';
export class Request {
  constructor(
    public controlEvent: CONTROL_EVENT,
    public sourcecode: string,
    public stdinText?: string,
    public lineNumOfBreakpoint?: number[],
    public progLang?: string
  ) {}
}

export class Response {
  constructor(
    public output: string,
    public sourcecode: string,
    public debugState: DEBUG_STATE,
    public step: number,
    public errors: SyntaxErrorData[],
    public files: Map<string, ArrayBuffer>,
    public execState?: ExecState
  ) {}
}

class Server {
  private timer: NodeJS.Timeout | null = null;
  private isExecuting: boolean = false;
  private files: Map<string, ArrayBuffer> = new Map();
  private count: number = 0;
  private interpreter: Interpreter | null = null;
  private stateHistory: ExecState[] = [];
  private outputsHistory: string[] = [];

  private async dynamicLoadInterpreter(progLang?: string) {
    if (typeof progLang === 'undefined') {
      throw new Error('Selected programming language is invalid.');
    } else if (progLang === 'c_cpp') {
      // prettier-ignore
      const module = await import(/* webpackChunkName: "CPP14" */ 'unicoen.ts/dist/interpreter/CPP14/CPP14Interpreter');
      this.interpreter = new module.CPP14Interpreter();
    } else if (progLang === 'java') {
      // prettier-ignore
      const module = await import(/* webpackChunkName: "Java8" */ 'unicoen.ts/dist/interpreter/Java8/Java8Interpreter');
      this.interpreter = new module.Java8Interpreter();
    } else if (progLang === 'python') {
      // prettier-ignore
      const module = await import(/* webpackChunkName: "Python3" */ 'unicoen.ts/dist/interpreter/Python3/Python3Interpreter');
      this.interpreter = new module.Python3Interpreter();
    }
  }
  private async reset(progLang?: string) {
    this.count = 0;
    await this.dynamicLoadInterpreter(progLang);
    if (this.interpreter === null) {
      throw new Error('Interpreter is not found');
    }
    this.interpreter.setFileList(this.files);
    this.stateHistory = [];
    this.outputsHistory = [];
  }

  private addFile(file: File) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException('Problem parsing input file.'));
      };

      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          this.files.set(file.name, reader.result);
          resolve(reader.result);
        } else {
          reject(new DOMException('Problem loading input file.'));
        }
      };

      reader.readAsArrayBuffer(file);
    });
  }

  public async upload(files: FileList) {
    await Promise.all(Array.from(files).map(file => this.addFile(file)));
    return this.files;
  }

  public delete(filename: string) {
    this.files.delete(filename);
    return this.files;
  }

  public async send(request: Request): Promise<Response> {
    const {
      controlEvent,
      sourcecode,
      stdinText,
      lineNumOfBreakpoint,
      progLang
    } = request;

    switch (controlEvent) {
      case 'Start': {
        return this.Start(sourcecode, progLang);
      }
      case 'Stop': {
        return this.Stop(sourcecode);
      }
      case 'BackAll': {
        return this.BackAll(sourcecode);
      }
      case 'StepBack': {
        return this.StepBack(sourcecode);
      }
      case 'Step': {
        return this.Step(sourcecode, stdinText);
      }
      case 'StepAll': {
        return this.StepAll(sourcecode, lineNumOfBreakpoint);
      }
      case 'Exec': {
        return this.Exec(sourcecode, progLang, lineNumOfBreakpoint);
      }
      case 'SyntaxCheck': {
        return this.SyntaxCheck(sourcecode, progLang);
      }
    }
  }

  private async Start(sourcecode: string, progLang?: string) {
    await this.reset(progLang);
    if (this.interpreter === null) {
      throw new Error('interpreter is not found');
    }
    const state = this.interpreter.startStepExecution(sourcecode);
    const execState = this.recordExecState(state);
    const stdout = this.interpreter.getStdout();
    const output = this.recordOutputText(stdout);
    this.isExecuting = true;
    const res: Response = {
      execState,
      output,
      sourcecode,
      debugState: 'First',
      step: this.count,
      errors: [],
      files: this.files
    };
    return res;
  }

  private Stop(sourcecode: string) {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.interpreter = null;
    const ret: Response = {
      sourcecode,
      execState: undefined,
      debugState: 'Stop',
      output: '',
      step: this.count,
      errors: [],
      files: this.files
    };
    return ret;
  }

  private BackAll(sourcecode: string) {
    this.count = 0;
    const execState = this.stateHistory[this.count];
    const output = this.outputsHistory[this.count];
    const ret: Response = {
      execState,
      output,
      sourcecode,
      debugState: 'First',
      step: this.count,
      errors: [],
      files: this.files
    };
    return ret;
  }

  private StepBack(sourcecode: string) {
    if (1 <= this.count) {
      this.count -= 1;
    }
    const execState = this.stateHistory[this.count];
    const output = this.outputsHistory[this.count];
    const ret: Response = {
      execState,
      output,
      sourcecode,
      debugState: 'Debugging',
      step: this.count,
      errors: [],
      files: this.files
    };
    return ret;
  }

  private Step(sourcecode: string, stdinText?: string) {
    ++this.count;
    if (this.count < this.stateHistory.length) {
      const execState = this.stateHistory[this.count];
      const output = this.outputsHistory[this.count];
      const ret: Response = {
        execState,
        output,
        sourcecode,
        debugState: 'Debugging',
        step: this.count,
        errors: [],
        files: this.files
      };
      return ret;
    }
    if (this.isExecuting) {
      if (this.interpreter === null) {
        throw new Error('engine is not found');
      }
      if (this.interpreter.getIsWaitingForStdin()) {
        if (stdinText !== undefined) {
          this.interpreter.stdin(stdinText);
        }
        //  console.log(`stdin:${stdinText}`);
      }
      let state = this.interpreter.stepExecute();
      // let maxSkip = 10;
      // while (state.getCurrentExpr().codeRange == null && 0 < --maxSkip) {
      //   state = this.engine.stepExecute();
      // }
      const execState = this.recordExecState(state);
      const stdout = this.interpreter.getStdout();
      //  console.log(`stdout:${stdout}`);
      const output = this.recordOutputText(stdout);
      //  console.log(`output:${output}`);
      // let stateText = `Step:${this.count} | Value:${execState.getCurrentValue()}`;
      let debugState: DEBUG_STATE = 'Debugging';
      if (this.interpreter.getIsWaitingForStdin()) {
        debugState = 'stdin';
      } else if (!this.interpreter.isStepExecutionRunning()) {
        debugState = 'EOF';
        this.isExecuting = false;
      }
      const ret: Response = {
        execState,
        output,
        sourcecode,
        debugState,
        step: this.count,
        errors: [],
        files: this.files
      };
      return ret;
    }
    this.count = this.stateHistory.length - 1;
    const output = this.outputsHistory[this.count];
    const ret: Response = {
      output,
      sourcecode,
      execState: this.getLastHistory(),
      debugState: 'EOF',
      step: this.count,
      errors: [],
      files: this.files
    };
    return ret;
  }

  private StepAll(sourcecode: string, lineNumOfBreakpoint?: number[]) {
    const currentCount = this.count;
    const loop = () => {
      const ret: Response = this.Step(sourcecode);
      if (ret.debugState === 'EOF') {
        signal('EOF', ret);
        return;
      } else if (ret.debugState === 'stdin') {
        signal('stdin', ret);
        return;
      } else if (typeof lineNumOfBreakpoint !== 'undefined') {
        if (typeof ret.execState !== 'undefined') {
          const nextExpr = ret.execState.getNextExpr();
          const { codeRange } = nextExpr;
          if (codeRange) {
            if (lineNumOfBreakpoint.includes(codeRange.begin.y - 1)) {
              signal('Breakpoint', ret);
              return;
            }
          }
        }
      }
      this.timer = setTimeout(loop.bind(this), 1);
    };
    loop();
    const execState = this.stateHistory[currentCount];
    const output = this.outputsHistory[currentCount];
    const debugState: DEBUG_STATE = 'Executing';
    return {
      execState,
      output,
      sourcecode,
      debugState,
      step: currentCount,
      errors: [],
      files: this.files
    };
  }

  private async Exec(
    sourcecode: string,
    progLang?: string,
    lineNumOfBreakpoint?: number[]
  ) {
    await this.Start(sourcecode, progLang);
    return this.StepAll(sourcecode, lineNumOfBreakpoint);
  }

  private async SyntaxCheck(code: string, progLang?: string) {
    await this.dynamicLoadInterpreter(progLang);
    if (this.interpreter === null) {
      throw new Error('Interpreter is not found');
    }
    const errors: SyntaxErrorData[] = this.interpreter.checkSyntaxError(code);
    const ret: Response = {
      errors,
      sourcecode: code,
      execState: undefined,
      debugState: 'Stop',
      output: '',
      step: this.count,
      files: this.files
    };
    return ret;
  }

  private recordOutputText(output: string) {
    this.outputsHistory.push(output);
    return output;
  }

  private recordExecState(execState: ExecState) {
    this.stateHistory.push(execState);
    return execState;
  }

  private getLastHistory() {
    return this.stateHistory[this.stateHistory.length - 1];
  }
}

export const server = new Server();
