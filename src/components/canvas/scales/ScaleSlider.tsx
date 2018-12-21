import * as React from 'react';
import Slider, { createSliderWithTooltip, Marks } from 'rc-slider';
const SliderWithTooltip = createSliderWithTooltip(Slider);
import 'rc-slider/assets/index.css';
interface Props {
  min: number;
  max: number;
  value: number;
  onScaleChange: (scale: number) => void;
}
interface State {}

export default class ScaleSlider extends React.Component<Props, State> {
  private marks: Marks;
  constructor(props: Props) {
    super(props);
    this.marks = {
      0.1: '0.1',
      1.0: '1.0',
      2.0: '2.0'
    };
  }
  render() {
    return (
      <SliderWithTooltip
        style={{ margin: '0px 0px 20px 0px' }}
        value={this.props.value}
        min={this.props.min}
        max={this.props.max}
        step={0.1}
        marks={this.marks}
        included={false}
        onChange={this.props.onScaleChange}
      />
    );
  }
}
