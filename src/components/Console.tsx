import * as React from 'react';
// tslint:disable-next-line:import-name
import AceEditor from 'react-ace';

import 'brace/mode/text';
import 'brace/theme/textmate';
import 'brace/theme/monokai';

import '../css/console.css';
import { slot } from './emitter';
import { LangProps, Theme } from './Props';
type Props = LangProps;

interface State {
  output: string;
  theme: Theme;
}

export default class Console extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { output: '', theme: 'light' };
    slot('changeOutput', (output: string) => {
      this.setState({ output });
    });
    slot('changeTheme', async (theme: Theme) => {
      this.setState({ theme });
    });
  }
  render() {
    const { theme } = this.state;
    return (
      <AceEditor
        mode="text"
        theme={theme === 'light' ? 'textmate' : 'monokai'}
        value={this.state.output}
        // onChange={onChange}
        name="IO"
        fontSize={14}
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          showLineNumbers: false,
          readOnly: true,
          showGutter: false
        }}
        style={{ height: '18vh', width: 'auto' }}
        className="console"
      />
    );
  }
}
