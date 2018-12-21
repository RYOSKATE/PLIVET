import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';

import { LangProps } from '../Props';
import translate from '../../locales/translate';
interface PropsImple {
  handleHideModal: any;
}
type Props = PropsImple & LangProps;

interface State {
  isShow: boolean;
}

export default class HowToUseWindows extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isShow: false };
  }
  renderModalHeader() {
    return (
      <Modal.Header closeButton>
        <Modal.Title>{translate(this.props.lang, 'howToUse')}</Modal.Title>
      </Modal.Header>
    );
  }
  renderModalBody() {
    const howToText: string[] = translate(this.props.lang, 'howToText');
    return (
      <Modal.Body>
        {howToText.map((m: string, i: number) => (
          <p key={i}>{m.trim()}</p>
        ))}
      </Modal.Body>
    );
  }
  renderModalFooter() {
    return (
      <Modal.Footer>
        <Button onClick={this.props.handleHideModal}>
          {translate(this.props.lang, 'close')}
        </Button>
      </Modal.Footer>
    );
  }
  render() {
    return (
      <div>
        <Modal
          className="modal-container"
          show={true}
          aria-labelledby="ModalHeader"
          onHide={this.props.handleHideModal}
          animation={true}
          tabIndex={-1}
          role="dialog"
        >
          {this.renderModalHeader()}
          {this.renderModalBody()}
          {this.renderModalFooter()}
        </Modal>
      </div>
    );
  }
}
