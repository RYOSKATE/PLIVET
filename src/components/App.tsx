import * as React from 'react';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import EditorSide from './EditorSide';
import CanvasSide from './CanvasSide';
import { LangProps, ProgLangProps, ThemeProps } from './Props';
import '../css/theme.css';
type Props = LangProps & ProgLangProps & ThemeProps;

interface State {}

export default class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    const { lang, progLang, theme } = this.props;
    return (
      <Grid fluid={true} style={{ margin: '5px' }}>
        <Row>
          <Col
            lg={4}
            md={5}
            sm={6}
            xs={12}
            className={theme === 'light' ? 'theme-light' : 'theme-gray'}
          >
            <EditorSide lang={lang} progLang={progLang} />
          </Col>
          <Col
            lg={8}
            md={7}
            sm={6}
            xs={12}
            className={theme === 'light' ? 'theme-light' : 'theme-gray'}
          >
            <CanvasSide lang={lang} />
          </Col>
        </Row>
      </Grid>
    );
  }
}
