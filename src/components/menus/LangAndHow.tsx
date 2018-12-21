import * as React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import HowToUseButton from './HowToUseButton';
import { LangProps } from '../Props';
import Switch from './Switch';
import { slot } from '../emitter';
import { CONTROL_EVENT } from '../../server';

type Props = LangProps;

interface State {
  isDebugging: boolean;
}

export default class LangAndHow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isDebugging: false };

    slot('debug', (controlEvent: CONTROL_EVENT) => {
      if (controlEvent === 'Stop') {
        this.setState({ isDebugging: false });
      } else if (controlEvent === 'Start' || controlEvent === 'Exec') {
        this.setState({ isDebugging: true });
      }
    });
  }
  render() {
    return (
      <Row>
        <Col lg={4} md={4} sm={4} xs={4}>
          <Switch
            signal="changeLang"
            options={[
              { value: 'ja', label: '日本語' },
              { value: 'en', label: 'English' }
            ]}
          />
        </Col>
        <Col lg={4} md={4} sm={4} xs={4}>
          <Switch
            signal="changeProgLang"
            options={[
              { value: 'c_cpp', label: 'C' },
              { value: 'java', label: 'Java(WIP)' }
            ]}
            isDisabled={this.state.isDebugging}
          />
        </Col>
        <Col lg={4} md={4} sm={4} xs={4}>
          <HowToUseButton lang={this.props.lang} />
        </Col>
      </Row>
    );
  }
}
