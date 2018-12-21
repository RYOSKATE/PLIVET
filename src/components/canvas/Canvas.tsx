import * as React from 'react';
import { Stage } from 'react-konva';
import { slot } from '../emitter';
import { ExecState } from 'unicoen.ts/dist/interpreter/ExecState';
import CanvasContent from './CanvasContent';
import '../../css/canvas.css';
import { CanvasDrawer } from './CanvasDrawer';
interface Props {
  width: number;
  height: number;
  scale: number;
}
interface State {
  execState?: ExecState;
}

export default class Canvas extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { execState: undefined };
    slot('draw', (execState: ExecState) => this.setState({ execState }));
  }

  render() {
    return (
      <div id="display">
        <Stage
          width={0.95 * this.props.width}
          height={0.95 * this.props.height}
          scale={{ x: this.props.scale, y: this.props.scale }}
        >
          <CanvasContent
            canvasDrawer={new CanvasDrawer(this.state.execState)}
          />
        </Stage>
      </div>
    );
  }
}
