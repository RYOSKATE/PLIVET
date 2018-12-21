import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import HowToUseWindows from './HowToUseWindows';
import { LangProps } from '../Props';
import translate from '../../locales/translate';

type Props = LangProps;

interface State {
  showModal: boolean;
}

export default class HowToUseButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleHideModal = this.handleHideModal.bind(this);
    this.handleShowModal = this.handleShowModal.bind(this);
    this.state = { showModal: false };
  }
  handleHideModal() {
    this.setState({ showModal: false });
  }
  handleShowModal() {
    this.setState({ showModal: true });
  }
  render() {
    return (
      <a href="#popup1" className="popup_btn">
        <Button
          className="btn btn-default btn-block"
          onClick={this.handleShowModal}
        >
          {translate(this.props.lang, 'howToUse')}
        </Button>
        {this.state.showModal ? (
          <HowToUseWindows
            handleHideModal={this.handleHideModal}
            lang={this.props.lang}
          />
        ) : null}
      </a>
    );
  }
}
