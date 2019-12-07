import * as React from 'react';
import '../css/footer.css';
interface Props {
  fromYear?: number;
}

interface State {}

export default class Footer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  getGithub() {
    return <a href="https://github.com/RYOSKATE/PLIVET">&nbsp;GitHub&nbsp;</a>;
  }

  getYear() {
    const { fromYear } = this.props;
    const thisYear = new Date().getFullYear();
    if (fromYear !== undefined) {
      if (fromYear === thisYear) {
        return `${fromYear}`;
      } else {
        return `${fromYear} - ${new Date().getFullYear()}`;
      }
    } else {
      return new Date().getFullYear();
    }
  }

  renderCopyRight() {
    return (
      <span>
        PLIVET&nbsp;v{require('../../package.json').version}&nbsp;&copy;&nbsp;
        {this.getYear()}&nbsp; @RYOSKATE
      </span>
    );
  }

  renderLicense() {
    return <a href="./licenses.html">&nbsp;LICENSES</a>;
  }

  render() {
    return (
      <div className="footer">
        {this.renderCopyRight()}
        <br />
        {this.getGithub()}
        {this.renderLicense()}
      </div>
    );
  }
}
