import * as React from 'react';
import Alert from 'react-bootstrap/lib/Alert';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Checkbox from 'react-bootstrap/lib/Checkbox';
// tslint:disable-next-line:import-name
import AceEditor from 'react-ace';

import 'brace/mode/c_cpp';
import 'brace/snippets/c_cpp';
import 'brace/mode/java';
import 'brace/snippets/java';
import 'brace/mode/python';
import 'brace/snippets/python';
import 'brace/theme/textmate';
import 'brace/theme/monokai';
import 'brace/ext/language_tools';

import '../css/editor.css';
import { signal, slot } from './emitter';
import {
  Request,
  CONTROL_EVENT,
  server,
  Response,
  DEBUG_STATE
} from '../server';
import translate from '../locales/translate';
import { ExecState } from 'unicoen.ts/dist/interpreter/Engine/ExecState';
import { LangProps, ProgLangProps, Theme } from './Props';
import { SyntaxErrorData } from 'unicoen.ts/dist/interpreter/mapper/SyntaxErrorData';

type Props = LangProps & ProgLangProps;
interface State {
  fontSize: number;
  showAlert: boolean;
  theme: Theme;
}

interface TextRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface GutterMousedownEventTarget
  extends React.BaseHTMLAttributes<HTMLElement> {
  getBoundingClientRect: () => TextRectangle;
}
interface GutterMousedownEvent extends React.MouseEvent {
  domEvent: React.MouseEvent<GutterMousedownEventTarget>;
  editor: AceAjax.Editor;
  getDocumentPosition: () => AceAjax.Position;
  stop: () => void;
}

export default class Editor extends React.Component<Props, State> {
  private sentSourcecode: string;
  private preventedCommand: CONTROL_EVENT = 'Stop';
  private sourcecode: string;
  private ace: any = null;
  private editorRef = React.createRef<any>();
  private lineNumOfBreakpoint: number[] = [];
  private isDebugging = false;
  private checkbox: HTMLInputElement | null = null;
  private noAlert: boolean = false;
  private highlightIds: number[] = [];
  constructor(props: Props) {
    super(props);

    this.state = { fontSize: 14, showAlert: false, theme: 'light' };
    const { lang, progLang } = props;
    this.sourcecode = translate(lang, this.sourceCodeKey(progLang));
    this.sentSourcecode = '';

    this.hideAlert = this.hideAlert.bind(this);

    slot('debug', (controlEvent: CONTROL_EVENT, stdinText?: string) => {
      this.send(controlEvent, stdinText);
    });
    slot('EOF', (response: Response) => {
      this.recieve(response);
    });
    slot('stdin', (response: Response) => {
      this.recieve(response);
    });
    slot('Breakpoint', (response: Response) => {
      this.recieve(response);
    });
    slot('zoom', (command: string) => {
      if (command === 'In') {
        this.setState({ fontSize: this.state.fontSize + 1 });
      } else if (command === 'Out') {
        this.setState({ fontSize: Math.max(this.state.fontSize - 1, 10) });
      } else if (command === 'Reset') {
        this.setState({ fontSize: 14 });
      }
    });
    slot('changeTheme', async (theme: Theme) => {
      this.setState({ theme });
    });
  }

  componentDidMount() {
    // Enable breakpoint
    const editor: AceAjax.Editor = this.editorRef.current.editor;
    editor.on('keydown', (e: any) => {
      console.log(e);
    });
    editor.on('guttermousedown', (e: GutterMousedownEvent) => {
      const target: GutterMousedownEventTarget = e.domEvent.currentTarget;
      if (
        typeof target.className !== 'undefined' &&
        target.className.indexOf('ace_gutter') === -1
      ) {
        return;
      }
      if (!editor.isFocused()) {
        return;
      }
      if (e.clientX > 25 + target.getBoundingClientRect().left) return;

      const row: number = e.getDocumentPosition().row;

      const session: AceAjax.IEditSession = e.editor.getSession();
      if (this.lineNumOfBreakpoint.includes(row)) {
        session.clearBreakpoint(row);
        this.lineNumOfBreakpoint = this.lineNumOfBreakpoint.filter(
          n => n !== row
        );
      } else {
        session.setBreakpoint(row, 'ace_breakpoint');
        this.lineNumOfBreakpoint.push(row);
      }
      e.stop();
    });
  }

  sourceCodeKey = (prog: string) =>
    'sourceCode' +
    prog.replace(/_/g, '').replace(/^[a-z]/g, char => char.toUpperCase());

  componentWillReceiveProps(nextProps: Props) {
    const { lang, progLang } = this.props;
    const nextLang = nextProps.lang;
    const nextProgLang = nextProps.progLang;

    if (nextLang !== lang) {
      if (this.sourcecode === translate(lang, this.sourceCodeKey(progLang))) {
        this.sourcecode = translate(nextLang, this.sourceCodeKey(nextProgLang));
      }
    } else if (nextProgLang !== progLang) {
      this.sourcecode = translate(nextLang, this.sourceCodeKey(nextProgLang));
    }
  }

  send(controlEvent: CONTROL_EVENT, stdinText?: string) {
    const sourcecode = this.sourcecode;
    const lineNumOfBreakpoint = this.lineNumOfBreakpoint;
    const progLang = this.props.progLang;
    const request: Request = {
      sourcecode,
      controlEvent,
      stdinText,
      lineNumOfBreakpoint,
      progLang
    };
    if (controlEvent === 'SyntaxCheck') {
      server
        .send(request)
        .then((response: Response) => {
          const { errors } = response;
          this.setSyntaxError(errors);
        })
        .catch(e => {
          console.log(e);
          alert(e);
        });
    } else if (
      !this.noAlert &&
      this.isDebugging &&
      (controlEvent === 'BackAll' ||
        controlEvent === 'StepBack' ||
        controlEvent === 'Step' ||
        controlEvent === 'StepAll') &&
      sourcecode !== this.sentSourcecode
    ) {
      this.preventedCommand = controlEvent;
      this.setState({ showAlert: true });
    } else {
      this.setState({ showAlert: false });
      server
        .send(request)
        .then((response: Response) => {
          this.recieve(response);
        })
        .catch(e => {
          console.log(e);
          alert(e);
        });
    }
  }

  recieve(response: Response) {
    try {
      const {
        debugState,
        execState,
        output,
        step,
        sourcecode,
        files
      } = response;
      this.isDebugging = debugState !== 'Stop';
      this.sentSourcecode = sourcecode;
      if (debugState === 'Executing') {
        return;
      }
      signal('changeState', debugState, step);
      signal('changeOutput', output);
      signal('draw', execState);
      signal('files', files);
      this.setHighlightOnCode(debugState, execState);
    } catch (e) {
      console.log(e);
      alert(e);
    }
  }

  setHighlightOnCode(debugState: DEBUG_STATE, execState?: ExecState) {
    if (debugState === 'Stop') {
      return;
    }
    if (typeof execState === 'undefined') {
      return;
    }
    let codeRange = execState.getNextExpr().codeRange;
    const AceRange = this.ace.acequire('ace/range').Range;
    const editor: AceAjax.Editor = this.editorRef.current.editor;
    if (codeRange) {
      const range: AceAjax.Range = new AceRange(
        codeRange.begin.y - 1,
        codeRange.begin.x,
        codeRange.end.y - 1,
        codeRange.end.x + 1
      );
      editor.resize(true);
      // tslint:disable-next-line:no-empty
      editor.scrollToLine(codeRange.begin.y, true, true, () => {});
      if (debugState === 'EOF') {
        editor.getSelection().setSelectionRange(new AceRange(-1, 0, -1, 1));
      } else {
        editor.getSelection().setSelectionRange(range);
      }
    }
  }

  setSyntaxError(errors: SyntaxErrorData[]) {
    const editor: AceAjax.Editor = this.editorRef.current.editor;
    const annotations = errors.map((error: SyntaxErrorData) => {
      return {
        row: error.line - 1,
        column: error.charPositionInLine - 1,
        text: error.getMsg(),
        type: 'error'
      };
    });
    const session: AceAjax.IEditSession = editor.getSession();
    session.setAnnotations(annotations);
    for (const highlightId of this.highlightIds) {
      session.removeMarker(highlightId);
    }
    this.highlightIds = [];
    for (const annotation of annotations) {
      const range = (session as any).highlightLines(
        annotation.row,
        annotation.row,
        'error_line'
      );
      this.highlightIds.push(range.id);
    }
  }

  render() {
    return (
      <React.Fragment>
        {this.state.showAlert ? this.renderAlert() : null} {this.renderEditor()}
      </React.Fragment>
    );
  }

  renderEditor() {
    const mode = this.props.progLang;
    const { fontSize, theme } = this.state;
    return (
      <AceEditor
        ref={this.editorRef}
        mode={mode}
        theme={theme === 'light' ? 'textmate' : 'monokai'}
        value={this.sourcecode}
        name="sourcecode"
        fontSize={fontSize}
        tabSize={2}
        editorProps={{
          $blockScrolling: Infinity
        }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          showLineNumbers: true,
          readOnly: false
        }}
        style={{ height: '62vh', width: 'auto' }}
        className="editorMain"
        onChange={(text: string) => {
          this.sourcecode = text;
          const delaySyntaxCheck = (code: string) => {
            if (code === this.sourcecode) {
              signal('debug', 'SyntaxCheck');
            }
          };
          setTimeout(() => delaySyntaxCheck(text), 1000);
        }}
        onBeforeLoad={ace => (this.ace = ace)}
      />
    );
  }

  hideAlert() {
    this.setState({ showAlert: false });
  }

  renderAlert() {
    const { lang } = this.props;
    const warning = translate(lang, 'warning');
    const editInDebug = translate(lang, 'editInDebug');
    const continueDebug = translate(lang, 'continueDebug');
    const restart = translate(lang, 'restart');
    const rememberCommand = translate(lang, 'rememberCommand');
    return (
      <Modal.Dialog
        className="modal-container"
        aria-labelledby="ModalHeader"
        // animation={true}
        tabIndex={-1}
        role="dialog"
      >
        <Modal.Header closeButton>
          <Modal.Title>{warning}</Modal.Title>
        </Modal.Header>
        <Alert bsStyle="danger">
          <p>{editInDebug}</p>
        </Alert>
        <Modal.Footer>
          <Button
            bsStyle="danger"
            onClick={() => {
              this.isDebugging = false;
              if (this.checkbox !== null) {
                this.noAlert = this.checkbox.checked;
              }
              signal('debug', this.preventedCommand);
            }}
          >
            {continueDebug}
          </Button>
          <Button
            onClick={() => {
              this.isDebugging = false;
              if (this.checkbox !== null) {
                this.noAlert = this.checkbox.checked;
              }
              signal('debug', 'Start');
            }}
          >
            {restart}
          </Button>
          <Checkbox
            validationState="warning"
            inputRef={ref => (this.checkbox = ref)}
          >
            {rememberCommand}
          </Checkbox>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}
