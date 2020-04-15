import * as React from 'react';
import { Layer, Arrow } from 'react-konva';
import StackRect from './StackRect';
import { CanvasDrawer, CanvasStack, CanvasArrow } from './CanvasDrawer';
import { slot } from '../emitter';
import hexToRgba from '../Color';
interface Props {
  canvasDrawer: CanvasDrawer;
}

interface State {
  canvasStacks: CanvasStack[];
  canvasArrows: CanvasArrow[];
}

export default class CanvasContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { canvasStacks: [], canvasArrows: [] };
    slot('redraw', () => {
      this.updatePos();
    });
  }

  makeStacks(canvasStacks: CanvasStack[]) {
    const list = canvasStacks.map((canvasStack) => (
      <StackRect key={canvasStack.key} canvasStack={canvasStack} />
    ));
    return list;
  }

  makeArrows(canvasArrows: CanvasArrow[]) {
    const list = canvasArrows.map((canvasArrow) => {
      const { from, mid, to, key, color } = canvasArrow;
      const rgbaColor = hexToRgba(color);
      return (
        <Arrow
          key={key}
          points={[from.x, from.y, mid.x, mid.y, to.x, to.y]}
          tension={0.25} // 0だと折れ線
          stroke={rgbaColor}
          // stroke={colors[index % colors.length]} // |(storoke)部分
          // strokeWidth={4}
          fill={rgbaColor} // △(pointer)部分
          pointerLength={10}
          pointerWidth={10}
          opacity={1.0}
        />
      );
    });
    return list;
  }

  updatePos() {
    this.props.canvasDrawer.updatePos();
    this.forceUpdate();
  }

  render() {
    const canvasStacks = this.props.canvasDrawer.getCanvasStacks();
    const canvasArrows = this.props.canvasDrawer.getCanvasArrows();
    const stack = this.makeStacks(canvasStacks);
    const arrow = this.makeArrows(canvasArrows);
    return (
      <React.Fragment>
        <Layer>{stack}</Layer>
        <Layer>{arrow}</Layer>
      </React.Fragment>
    );
  }
}
