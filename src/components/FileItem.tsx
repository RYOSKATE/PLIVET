import * as React from 'react';
import DownloadLink from 'react-download-link';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

interface Props {
  filename: string;
  arrayBuffer: ArrayBuffer;
  onFileDelete: (name: string) => void;
}
interface State {}

export default class FileItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.deleteFile = this.deleteFile.bind(this);
  }

  deleteFile() {
    this.props.onFileDelete(this.props.filename);
  }

  render() {
    const { filename, arrayBuffer } = this.props;
    return (
      <ListGroupItem>
        <DownloadLink
          filename={filename}
          label={
            <Button title={'download'}>
              <Glyphicon glyph="save" />
            </Button>
          }
          style={{ marginLeft: 10, marginRight: 10 }}
          exportFile={() =>
            new Blob([arrayBuffer], { type: 'application/octet-binary' })
          }
        />
        <Button
          title={'remove'}
          onClick={this.deleteFile}
          style={{ marginRight: '10px' }}
        >
          <Glyphicon glyph="trash" />
        </Button>
        {filename}
      </ListGroupItem>
    );
  }
}
