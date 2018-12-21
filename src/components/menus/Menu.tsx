import * as React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import LangAndHow from './LangAndHow';
import CtrlButtons from './controle_buttons/CtrlButtons';
import { LangProps } from '../Props';
import { slot } from '../emitter';
import { DEBUG_STATE } from '../../server';

type Props = LangProps;

interface State {
  debugStatus: string;
  debugState: DEBUG_STATE;
}

export default class Menu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { debugStatus: '', debugState: 'Stop' };
    slot('changeState', (debugState: DEBUG_STATE, step: number) => {
      let debugStatus = '';
      if (debugState === 'Debugging') {
        debugStatus = `Step ${step}`;
      } else {
        debugStatus = debugState;
      }
      this.setState({ debugStatus, debugState });
    });
  }
  render() {
    return (
      <Row>
        <Col lg={12} md={12} sm={12} xs={12} style={{ zIndex: 1000 }}>
          <LangAndHow lang={this.props.lang} />
        </Col>
        <Col lg={12} md={12} sm={12} xs={12}>
          <CtrlButtons
            lang={this.props.lang}
            debugState={this.state.debugState}
          />
        </Col>
        <Col lg={12} md={12} sm={12} xs={12}>
          DebugStatus: {this.state.debugStatus}
        </Col>
      </Row>
    );
  }
}
