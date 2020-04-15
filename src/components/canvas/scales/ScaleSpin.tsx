import * as React from 'react';
import * as NumericInput from 'react-numeric-input';
interface Props {
  min: number;
  max: number;
  value: number;
  onScaleChange: (scale: number) => void;
}
interface State {}

export default class ScaleSpin extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { value: 1.0 };
  }

  render() {
    return (
      <React.Fragment>
        Scale:
        <NumericInput
          precision={1}
          value={this.props.value}
          min={this.props.min}
          max={this.props.max}
          step={0.1}
          onChange={(value: number | null) =>
            value !== null ? this.props.onScaleChange(value) : null
          }
          style={{
            wrap: {
              width: '60px',
              margin: '0px 5px 5px 10px',
              padding: '2px 2px 2px 2px',
              borderRadius: '6px 3px 3px 6px',
              fontSize: 16,
            },
            input: {
              width: '40px',
              borderRadius: '4px 2px 2px 4px',
              padding: '0.1ex 1ex',
              border: '1px solid #ccc',
              marginRight: 4,
              display: 'block',
            },
          }}
        />
      </React.Fragment>
    );
  }
}
