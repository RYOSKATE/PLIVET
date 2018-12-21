import * as React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import ScaleSpin from './ScaleSpin';
import ScaleSlider from './ScaleSlider';
interface Props {
  min: number;
  max: number;
  scale: number;
  onScaleChange: (scale: number) => void;
}

interface State {}

export default class ScaleMenu extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { scale: 1.0 };
  }

  render() {
    const { min, max, scale, onScaleChange } = this.props;
    return (
      <Row>
        <Col lg={3} md={4} sm={5} xs={6}>
          <ScaleSpin
            min={min}
            max={max}
            value={scale}
            onScaleChange={onScaleChange}
          />
        </Col>
        <Col lg={6} md={6} sm={7} xs={6}>
          <ScaleSlider
            min={min}
            max={max}
            value={scale}
            onScaleChange={onScaleChange}
          />
        </Col>
      </Row>
    );
  }
}
