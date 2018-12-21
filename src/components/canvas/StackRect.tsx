import * as React from 'react';
import VariableRect from './VariableRect';
import { Group } from 'react-konva';
import { CanvasStack } from './CanvasDrawer';
import TextWithRect from './TextWithRect';

interface Props {
  canvasStack: CanvasStack;
}

interface State {}

export default class StackRect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  renderHeader() {
    const { canvasStack } = this.props;
    const x = canvasStack.x();
    const y = canvasStack.y();
    return (
      <TextWithRect
        x={x}
        y={y}
        text={canvasStack.name()}
        width={canvasStack.width()}
        fontStyle="bold"
        align="center"
        isVisible={true}
      />
    );
  }
  renderBody() {
    const canvasStack = this.props.canvasStack;
    const list: JSX.Element[] = [];
    const canvasTable = canvasStack.getCanvasTable();
    for (const canvasRow of canvasTable) {
      if (!canvasRow[0].isVisible) {
        continue;
      }
      const key = canvasRow.reduce((sum, cell) => sum.concat(cell.key), '');
      list.push(<VariableRect key={key} canvasRow={canvasRow} />);
    }
    return list;
  }
  render() {
    const header = this.renderHeader();
    const body = this.renderBody();
    return (
      <Group>
        {header}
        {body}
      </Group>
    );
  }
}
