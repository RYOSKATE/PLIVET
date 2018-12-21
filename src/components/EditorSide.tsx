import * as React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Menu from './menus/Menu';
import { LangProps, ProgLangProps } from './Props';
import Editor from './Editor';
import Console from './Console';
import FileForm from './FileForm';

type Props = LangProps & ProgLangProps;

interface State {}

export default class EditorSide extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return (
      <Row>
        <Col lg={12} md={12} sm={12} xs={12}>
          <Menu lang={this.props.lang} />
        </Col>
        <Col lg={12} md={12} sm={12} xs={12}>
          <Editor lang={this.props.lang} progLang={this.props.progLang} />
        </Col>
        <Col lg={12} md={12} sm={12} xs={12}>
          <Console lang={this.props.lang} />
        </Col>
        <Col lg={12} md={12} sm={12} xs={12}>
          <FileForm lang={this.props.lang} />
        </Col>
      </Row>
    );
  }
}
