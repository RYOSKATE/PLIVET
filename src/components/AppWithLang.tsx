import * as React from 'react';
import App from './App';
import { slot } from './emitter';
import { Lang, ProgLang, Theme } from './Props';

interface Props {}

interface State {
  lang: Lang;
  progLang: ProgLang;
  theme: Theme;
}

export default class AppWithLang extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { lang: 'ja', progLang: 'c_cpp', theme: 'light' };
    slot('changeLang', (lang: Lang) => {
      this.setState({ lang });
    });
    slot('changeProgLang', (progLang: ProgLang) => {
      this.setState({ progLang });
    });
    slot('changeTheme', async (theme: Theme) => {
      this.setState({ theme });
    });
  }
  render() {
    const { lang, progLang, theme } = this.state;
    return <App lang={lang} progLang={progLang} theme={theme} />;
  }
}
