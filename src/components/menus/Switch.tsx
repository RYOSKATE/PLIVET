import * as React from 'react';
// tslint:disable-next-line:import-name
import Select from 'react-select';
import { ValueType } from 'react-select/lib/types';
import { signal, event } from '../emitter';

type OptionImple = { value: string; label: string };
type Options = OptionImple[];
type Option = ValueType<OptionImple>;

interface Props {
  options: Options;
  signal: event;
  isDisabled?: boolean;
}

interface State {
  selectedOption: Option;
}

export default class Switch extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { selectedOption: this.props.options[0] };
  }
  handleChange = (option: Option) => {
    this.setState({ selectedOption: option });
    if (option) {
      if ('value' in option) {
        const lang = option.value;
        signal(this.props.signal, lang);
      }
    }
  };
  render() {
    return (
      <Select
        value={this.state.selectedOption}
        onChange={this.handleChange}
        options={this.props.options}
        isDisabled={this.props.isDisabled}
      />
    );
  }
}
