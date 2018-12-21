import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import translate from '../../../locales/translate';
import { signal, event } from '../../emitter';

interface Props {
  lang: string;
  signal: event;
  command: string;
  icon: string;
  onClick?: () => void;
  enable: boolean;
  iconClass?: string;
}

interface State {}

export default class CtrlButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }
  render() {
    return (
      <Button
        title={translate(
          this.props.lang,
          `${this.props.signal}${this.props.command}`
        )}
        onClick={() => {
          if (typeof this.props.onClick !== 'undefined') {
            this.props.onClick();
          }
          signal(this.props.signal, this.props.command);
        }}
        className="btn-outline-dark"
        disabled={!this.props.enable}
      >
        <Glyphicon glyph={this.props.icon} className={this.props.iconClass} />
      </Button>
    );
  }
}
