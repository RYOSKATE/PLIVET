import { Engine } from 'unicoen.ts/dist/interpreter/Engine';
import { CPP14Engine } from 'unicoen.ts/dist/interpreter/CPP14/CPP14Engine';
import { Java8Engine } from 'unicoen.ts/dist/interpreter/Java8/Java8Engine';
import { ExecState } from 'unicoen.ts/dist/interpreter/ExecState';
import { signal } from './components/emitter';
export type CONTROL_EVENT =
  | 'Exec'
  | 'Start'
  | 'Stop'
  | 'BackAll'
  | 'StepBack'
  | 'Step'
  | 'StepAll';
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
    public execState?: ExecState
  ) {}
}

class Server {
  private timer: NodeJS.Timeout | null = null;
  private isExecuting: boolean = false;
  private files: Map<string, ArrayBuffer> = new Map();
  private count: number = 0;
  private engine: Engine | null = null;
  private mapper: any; // CPP14Mapper | Java8Mapper;
  private stateHistory: ExecState[] = [];
  private outputsHistory: string[] = [];

  private async dynamicLoadMapper(progLang?: string) {
    if (typeof progLang === 'undefined') {
      throw new Error('Problem selected programming language');
    } else if (progLang === 'c_cpp') {
      const module = await import(/* webpackChunkName: "CPP14Mapper" */ 'unicoen.ts/dist/mapper/CPP14/CPP14Mapper');
      this.mapper = new module.CPP14Mapper();
    } else if (progLang === 'java') {
      const module = await import(/* webpackChunkName: "Java8Mapper" */ 'unicoen.ts/dist/mapper/Java8/Java8Mapper');
      this.mapper = new module.Java8Mapper();
    }
  }
  private async reset(progLang?: string) {
    this.count = 0;
    if (typeof progLang === 'undefined') {
      this.engine = new Engine();
    } else if (progLang === 'c_cpp') {
      this.engine = new CPP14Engine();
    } else if (progLang === 'java') {
      this.engine = new Java8Engine();
    }
    if (this.engine === null) {
      throw new Error('Problem initializing engine');
    }
    await this.dynamicLoadMapper(progLang);
    this.engine.setFileList(this.files);
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

      reader.onload = function(this: Server) {
        if (reader.result instanceof ArrayBuffer) {
          this.files.set(file.name, reader.result);
          resolve(reader.result);
        } else {
          reject(new DOMException('Problem loading input file.'));
        }
      }.bind(this);

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

  public async send(request: Request) {
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
        await this.Start(sourcecode, progLang);
        return this.StepAll(sourcecode, lineNumOfBreakpoint);
      }
    }
  }

  private async Start(sourcecode: string, progLang?: string) {
    await this.reset(progLang);
    if (this.engine === null) {
      throw new Error('engine is not found');
    }
    const node = this.rawDataToUniTree(sourcecode); // UniProgram
    const state = this.engine.startStepExecution(node);
    const execState = this.recordExecState(state);
    const stdout = this.engine.getStdout();
    const output = this.recordOutputText(stdout);
    this.isExecuting = true;
    const res: Response = {
      execState,
      output,
      sourcecode,
      debugState: 'First',
      step: this.count
    };
    return res;
  }

  private Stop(sourcecode: string) {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.engine = null;
    const ret: Response = {
      sourcecode,
      execState: undefined,
      debugState: 'Stop',
      output: '',
      step: this.count
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
      step: this.count
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
      step: this.count
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
        step: this.count
      };
      return ret;
    }
    if (this.isExecuting) {
      if (this.engine === null) {
        throw new Error('engine is not found');
      }
      if (this.engine.getIsWaitingForStdin()) {
        if (stdinText !== undefined) {
          this.engine.stdin(stdinText);
        }
        //  console.log(`stdin:${stdinText}`);
      }
      let state = this.engine.stepExecute();
      // let maxSkip = 10;
      // while (state.getCurrentExpr().codeRange == null && 0 < --maxSkip) {
      //   state = this.engine.stepExecute();
      // }
      const execState = this.recordExecState(state);
      const stdout = this.engine.getStdout();
      //  console.log(`stdout:${stdout}`);
      const output = this.recordOutputText(stdout);
      //  console.log(`output:${output}`);
      // let stateText = `Step:${this.count} | Value:${execState.getCurrentValue()}`;
      let debugState: DEBUG_STATE = 'Debugging';
      if (this.engine.getIsWaitingForStdin()) {
        debugState = 'stdin';
      } else if (!this.engine.isStepExecutionRunning()) {
        debugState = 'EOF';
        this.isExecuting = false;
      }
      const ret: Response = {
        execState,
        output,
        sourcecode,
        debugState,
        step: this.count
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
      step: this.count
    };
    return ret;
  }

  private StepAll(sourcecode: string, lineNumOfBreakpoint?: number[]) {
    const currentCount = this.count;
    const loop = () => {
      const ret: Response = this.Step(sourcecode);
      if (ret.debugState === 'EOF') {
        signal('EOF', ret);
      } else if (ret.debugState === 'stdin') {
        signal('stdin', ret);
      } else if (typeof ret.execState !== 'undefined') {
        const codeRange = ret.execState.getNextExpr().codeRange;
        if (
          typeof lineNumOfBreakpoint !== 'undefined' &&
          lineNumOfBreakpoint.includes(codeRange.begin.y - 1)
        ) {
          signal('Breakpoint', ret);
        } else {
          this.timer = setTimeout(loop.bind(this), 1);
        }
      }
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
      step: currentCount
    };
  }

  private rawDataToUniTree(str: string) {
    let text = str;
    if (this.engine instanceof CPP14Engine) {
      text = CPP14Engine.replaceDefine(str);
    }
    return this.mapper.parse(text);
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
