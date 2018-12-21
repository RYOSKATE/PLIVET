import * as React from 'react';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';

import CtrlButton from './CtrlButton';
import { LangProps } from '../../Props';
import { DEBUG_STATE } from '../../../server';
import '../../../css/ctrlbuttons.css';

type Props = {
  debugState: DEBUG_STATE;
} & LangProps;

interface State {
  Start: boolean;
  Stop: boolean;
  BackAll: boolean;
  StepBack: boolean;
  Step: boolean;
  StepAll: boolean;
}

export default class CtrlButtons extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      Start: false,
      Stop: false,
      BackAll: false,
      StepBack: false,
      Step: true,
      StepAll: true
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    switch (nextProps.debugState) {
      case 'Stop':
        this.setState({
          Start: false,
          Stop: false,
          BackAll: false,
          StepBack: false,
          Step: true,
          StepAll: true
        });
        break;
      case 'First':
        this.setState({
          Start: true,
          Stop: true,
          BackAll: false,
          StepBack: false,
          Step: true,
          StepAll: true
        });
        break;
      case 'stdin':
        this.setState({
          BackAll: false,
          StepBack: false,
          Step: true,
          StepAll: true
        });
        break;
      case 'Debugging':
        this.setState({
          BackAll: true,
          StepBack: true,
          Step: true,
          StepAll: true
        });
        break;
      case 'Executing':
        this.setState({
          BackAll: false,
          StepBack: false,
          Step: false,
          StepAll: false
        });
        break;
      case 'EOF':
        this.setState({
          Start: true,
          Stop: true,
          BackAll: true,
          StepBack: true,
          Step: false,
          StepAll: false
        });
        break;
      default:
        break;
    }
  }

  render() {
    const lang = this.props.lang;
    return (
      <ButtonToolbar style={{ marginTop: '1vh', marginBottom: '1vh' }}>
        <ButtonGroup>
          <CtrlButton
            lang={lang}
            signal="debug"
            command="Start"
            icon="repeat"
            enable={this.state.Start}
            iconClass={this.state.Start ? 'icon-green' : undefined}
          />
          <CtrlButton
            lang={lang}
            signal="debug"
            command="Stop"
            icon="stop"
            enable={this.state.Stop}
            iconClass={this.state.Stop ? 'icon-red' : undefined}
          />
          <CtrlButton
            lang={lang}
            signal="debug"
            command="BackAll"
            icon="backward"
            enable={this.state.BackAll}
            iconClass={this.state.BackAll ? 'icon-blue' : undefined}
          />
          <CtrlButton
            lang={lang}
            signal="debug"
            command="StepBack"
            icon="arrow-left"
            enable={this.state.StepBack}
            iconClass={this.state.StepBack ? 'icon-blue' : undefined}
          />
          <CtrlButton
            lang={lang}
            signal="debug"
            command={this.state.Stop ? 'Step' : 'Start'}
            icon="arrow-right"
            enable={this.state.Step}
            iconClass={this.state.Step ? 'icon-blue' : undefined}
          />
          <CtrlButton
            lang={lang}
            signal="debug"
            command={this.state.Stop ? 'StepAll' : 'Exec'}
            icon="forward"
            enable={this.state.StepAll}
            iconClass={this.state.StepAll ? 'icon-blue' : undefined}
          />
        </ButtonGroup>
        <ButtonGroup>
          <CtrlButton
            lang={lang}
            signal="zoom"
            command="Out"
            icon="zoom-out"
            enable={true}
          />
          <CtrlButton
            lang={lang}
            signal="zoom"
            command="Reset"
            icon="search"
            enable={true}
          />
          <CtrlButton
            lang={lang}
            signal="zoom"
            command="In"
            icon="zoom-in"
            enable={true}
          />
        </ButtonGroup>
      </ButtonToolbar>
    );
  }
}
