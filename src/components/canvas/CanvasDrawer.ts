import { Variable } from 'unicoen.ts/dist/interpreter/Variable';
import { ExecState } from 'unicoen.ts/dist/interpreter/ExecState';
import { Stack } from 'unicoen.ts/dist/interpreter/Stack';
import { Vector } from 'vector2d';
import { signal } from '../emitter';
import Hashids from 'hashids';
import stringHash from 'string-hash';

export type CanvasRow = CanvasCell[];
export type CanvasTable = CanvasRow[];

const hashids = new Hashids('', 6, '1234567890abcdef'); // all lowercase
class Connection {
  public readonly color: string;
  public isDrawn: boolean = false;
  constructor(public readonly fromKey: string, public readonly toKey: string) {
    const hashFrom = stringHash(fromKey);
    const hashTo = stringHash(toKey);
    const hashNumber = hashids.encode(hashFrom, hashTo);
    this.color = `#${hashNumber.substr(0, 6)}`;
  }
}

export class CanvasArrow {
  public readonly key: string;
  public readonly from: Vector;
  public readonly to: Vector;
  public readonly mid: Vector;
  constructor(from: Vector, to: Vector, public readonly color: string) {
    const halfHeight = CanvasCell.HEIGHT / 2;
    this.from = this.clone(from).add(new Vector(-5, halfHeight));
    this.to = this.clone(to).add(new Vector(5, halfHeight));
    this.mid = this.calcMidPos(this.clone(from), this.clone(to));
    this.key = [this.from, this.to, this.mid].toString();
  }

  private calcMidPos(from: Vector, to: Vector): Vector {
    const isDownArrow = from.y < to.y;
    const mid = from.add(to).divS(2);
    const dir = to.subtract(from);
    const length = dir.length();
    dir.normalise().rotate(isDownArrow ? 90 : -90);
    const midPos = mid.add(dir.mulS(length / 4));
    return midPos;
  }
  private clone = (v: Vector) => new Vector(v.x, v.y);
}

class PointerConnectionManager {
  constructor() {
    this.reset();
  }
  public reset() {
    this.allAddressList.clear();
    this.ptrAddressList.clear();
    this.resetPosList();
  }

  public resetPosList() {
    this.connetionList = [];
    this.fromCellPosList.clear();
    this.toCellPosList.clear();
  }

  public addVariableAddr(address: number, id: string) {
    this.allAddressList.set(address, id);
  }

  public addPtrVariable(address: number, id: string) {
    if (!this.ptrAddressList.has(address)) {
      this.ptrAddressList.set(address, []);
    }
    const pair = this.ptrAddressList.get(address);
    if (pair !== undefined) {
      pair.push(id);
    }
  }

  public makeConnection() {
    for (const [ptrAddress, fromKeys] of this.ptrAddressList.entries()) {
      for (const [address, toKey] of this.allAddressList) {
        if (ptrAddress === address) {
          for (const fromKey of fromKeys) {
            this.connetionList.push(new Connection(fromKey, toKey));
          }
        }
      }
    }
  }

  public addPos(key: string, canvasCell: CanvasCell) {
    for (const connection of this.connetionList) {
      if (key === connection.fromKey) {
        this.fromCellPosList.set(key, canvasCell);
      }
      if (key === connection.toKey) {
        this.toCellPosList.set(key, canvasCell);
      }
    }
  }

  public makeCanvasArrows(): CanvasArrow[] {
    const list: CanvasArrow[] = [];
    for (const connection of this.connetionList) {
      const { fromKey, toKey, color } = connection;
      const fromCell = this.fromCellPosList.get(fromKey);
      if (fromCell === undefined) {
        continue;
      }
      const toCell = this.toCellPosList.get(toKey);
      if (toCell === undefined) {
        continue;
      }
      const fromPos = new Vector(fromCell.x() + fromCell.width, fromCell.y());
      const canvasArrow = new CanvasArrow(fromPos, toCell.getPos(), color);
      list.push(canvasArrow);

      fromCell.setColor(color);
      toCell.setColor(color);
    }
    return list;
  }

  // 全ての変数のアドレスとそのセルのUUIDのリスト
  private allAddressList = new Map<number, string>();
  // ポインタ変数(fromになる変数)のアドレスとそのセルのUUIDのリスト
  private ptrAddressList = new Map<number, string[]>();
  // { fromのUUID, toのUUID, 色, 描画済みか}のリスト
  private connetionList: Connection[] = [];
  // fromの座標リスト
  private fromCellPosList = new Map<string, CanvasCell>();
  // toの座標リスト
  private toCellPosList = new Map<string, CanvasCell>();
}

const pointerConnectionManager = new PointerConnectionManager();

export class CanvasDrawer {
  private canvasStacks: CanvasStack[] = [];
  private canvasArrows: CanvasArrow[] = [];
  private execState: ExecState | null = null;
  private getTypedef: (type: string) => string;
  constructor(execState?: ExecState) {
    if (typeof execState === 'undefined') {
      this.getTypedef = (type: string) => type;
      return;
    }
    this.execState = execState;
    this.getTypedef = execState.getTypedef.bind(execState);
    pointerConnectionManager.reset();
    this.updateStack();
    this.updateConnection();
  }

  private updateStack() {
    // Stacksの作成
    if (this.execState === null) {
      return;
    }
    const stacks = this.execState.getStacks();
    for (const stack of stacks) {
      const canvasStack = new CanvasStack(stack, this.getTypedef);
      if (!canvasStack.isEmpty()) {
        this.canvasStacks.push(canvasStack);
      }
    }
  }

  private updateConnection() {
    // ポインタの接続の作成
    pointerConnectionManager.makeConnection();

    // 各Cellの具体的な座標の計算と設定,
    // 同時にConnectionに含まれるuuidなら座標の登録
    this.calcPos();

    // Connectionリストと座標リストを用いてArrowsの作成
    this.canvasArrows = pointerConnectionManager.makeCanvasArrows();
  }

  public updatePos() {
    pointerConnectionManager.resetPosList();
    this.updateConnection();
  }

  public getCanvasStacks(): CanvasStack[] {
    return this.canvasStacks;
  }

  public getCanvasArrows(): CanvasArrow[] {
    return this.canvasArrows;
  }

  private calcPos() {
    const originX = 50;
    const originY = 50;
    const offsetX = 10;
    const offsetY = 10;
    let index = 0;
    let sumOfHeight = 0;
    for (const canvasStack of this.canvasStacks) {
      const height = canvasStack.height();
      const x = originX + offsetX * index;
      const y = originY + sumOfHeight;
      this.calcStackPos(x, y, canvasStack);
      sumOfHeight += height + offsetY;
      ++index;
    }
  }

  private calcStackPos(x: number, y: number, canvasStack: CanvasStack) {
    canvasStack.setPos(x, y);
    const offsetY = CanvasCell.HEIGHT;
    // stack名のヘッダ部分の高さを考慮する
    y += offsetY;
    let index = 0;
    const canvasTable = canvasStack.getCanvasTable();
    for (const canvasRow of canvasTable) {
      if (!canvasRow[0].isVisible) {
        continue;
      }
      const offset = offsetY * index;
      this.calcVariablePos(x, y + offset, canvasRow);
      ++index;
    }
  }

  private calcVariablePos(x: number, y: number, canvasRow: CanvasRow) {
    let left = 0;
    for (const cell of canvasRow) {
      const { width, key } = cell;
      cell.setPos(x + left, y);
      cell.clearColor();
      if (cell.isVisible) {
        left += width;
        pointerConnectionManager.addPos(key, cell);
      }
    }
  }
}

export class CanvasStack {
  public readonly key: string;
  private numOfCol: number = 0;
  private pos: Vector = new Vector(-1, -1);
  private canvasTable: CanvasTable;
  constructor(
    private readonly stack: Stack,
    private readonly getTypedef: (type: string) => string
  ) {
    this.canvasTable = this.makeCanvasTable();
    if (2 <= this.canvasTable.length) {
      this.pushbackEmptyCell(this.canvasTable);
      this.alignToMaximumWidth(this.canvasTable);
    }
    if (1 <= this.canvasTable.length) {
      this.rescaleWidthForLongFuncName();
    }
    this.key = stack.name;
  }

  public setPos(x: number, y: number) {
    this.pos.setAxes(x, y);
  }

  public x() {
    return this.pos.getX();
  }
  public y() {
    return this.pos.getY();
  }

  public isEmpty() {
    return this.canvasTable.length <= 0;
  }

  public getCanvasTable() {
    return this.canvasTable;
  }

  public name() {
    return this.stack.name;
  }

  public height() {
    if (this.canvasTable.length <= 0) {
      return 0;
    }
    // Stack名など表示するheader1行分の高さ
    const numOfVisible = this.canvasTable.reduce(
      (h: number, row: CanvasRow) => (h += row[0].isVisible ? 1 : 0),
      0
    );
    const height = (numOfVisible + 1) * CanvasCell.HEIGHT;
    return height;
  }

  public width() {
    if (this.canvasTable.length <= 0) {
      return 0;
    }
    const width = this.canvasTable[0].reduce(
      (sum, col) => (sum += col.width),
      0
    );
    return width;
  }

  private makeCanvasTable(): CanvasTable {
    const canvasTable: CanvasTable = [];
    const variables = this.stack.getVariables();
    const stackName = this.stack.name;
    for (const variable of variables) {
      const value = variable.getValue();
      const isArrayVariable = Array.isArray(value);
      const canvasVariable = isArrayVariable
        ? new CanvasArrayVariable(variable, stackName, this.getTypedef)
        : new CanvasVariable(variable, stackName, this.getTypedef);
      const cellss = canvasVariable.getCanvasTable();
      canvasTable.push(...cellss);
    }
    return canvasTable;
  }
  private pushbackEmptyCell(canvasTable: CanvasTable) {
    this.numOfCol = Math.max(
      ...canvasTable.map((row: CanvasRow) => row.length)
    );
    for (const row of canvasTable) {
      const emptyCells = new Array(this.numOfCol - row.length);
      for (let i = 0; i < emptyCells.length; ++i) {
        emptyCells[i] = new CanvasCell('', `${this.key}-empty-${i}`);
      }
      row.push(...emptyCells);
    }
  }
  private alignToMaximumWidth(canvasTable: CanvasTable) {
    const widths: number[] = new Array(this.numOfCol);
    widths.fill(0);
    for (const row of canvasTable) {
      for (let i = 0; i < row.length; ++i) {
        if (widths[i] < row[i].width) {
          widths[i] = row[i].width;
        }
      }
    }
    for (const row of canvasTable) {
      for (let i = 0; i < row.length; ++i) {
        row[i].width = widths[i];
      }
    }
  }
  private rescaleWidthForLongFuncName() {
    const nameWidth = ((this.stack.name.length + 3) * CanvasCell.FONT_SIZE) / 2;
    while (this.width() < nameWidth) {
      const scale = nameWidth / this.width();
      for (const row of this.canvasTable) {
        for (let i = 0; i < row.length; ++i) {
          row[i].width *= scale;
        }
      }
    }
  }
}

export class CanvasVariable {
  public readonly key: string;
  public static readonly NUM_OF_COL = 4;
  protected canvasCells: CanvasCell[] = [];
  constructor(
    protected readonly variable: Variable,
    private readonly parentName: string,
    protected readonly getTypedef: (type: string) => string
  ) {
    this.key = `${this.parentName}-${variable.name}`;
    this.init(variable);
  }

  protected init(variable: Variable) {
    const { type, name, address } = variable;
    const value = variable.getValue();
    let valueStr = value.toString();

    const rawType = this.getTypedef(type);
    if (rawType.indexOf('*') !== -1 && value != null) {
      valueStr = '0x' + value.toString(16).toUpperCase();
    }
    if (rawType === 'char' && value != null) {
      valueStr += ` '${String.fromCharCode(valueStr)}'`;
    }

    const addressStr = `&${name}(0x${address.toString(16).toUpperCase()}) `;
    this.pushCell(type);
    this.pushCell(name);
    const valueCell = this.pushCell(valueStr);
    const addrCell = this.pushCell(addressStr);
    if (this.isTypePtr()) {
      // valueはアドレス値
      pointerConnectionManager.addPtrVariable(value, valueCell.key);
    }
    pointerConnectionManager.addVariableAddr(address, addrCell.key);
  }

  protected isTypePtr(): boolean {
    const type = this.variable.type;
    const rawType = this.getTypedef(type);
    const isTypePtr = rawType.indexOf('*') !== -1;
    return isTypePtr;
  }

  public getCanvasTable(): CanvasTable {
    return [this.canvasCells];
  }

  protected pushCell(text: string) {
    const cell = new CanvasCell(text, this.key);
    this.canvasCells.push(cell);
    return cell;
  }
}

export class CanvasArrayVariable extends CanvasVariable {
  constructor(
    variable: Variable,
    parentName: string,
    getTypedef: (type: string) => string
  ) {
    super(variable, parentName, getTypedef);
  }

  protected init(variable: Variable) {
    const { type, name, address } = variable;
    const valueStr = '0x' + address.toString(16).toUpperCase();
    const addressStr = `&${name}(SYSTEM)`;
    this.pushCell(type);
    this.pushCell(name);
    const valueCell = this.pushCell(valueStr);
    this.pushCell(addressStr);
    pointerConnectionManager.addPtrVariable(address, valueCell.key);
  }

  public getCanvasTable(): CanvasTable {
    let children: CanvasTable = [];
    const value: Variable[] = this.variable.getValue();
    for (const v of value) {
      const canvasVariable = Array.isArray(v.getValue())
        ? new CanvasArrayVariable(v, this.key, this.getTypedef)
        : new CanvasVariable(v, this.key, this.getTypedef);
      const table = canvasVariable.getCanvasTable();
      const shiftedTable = table.map((row, index) =>
        [new CanvasCell('', `${this.key}-empty-${index}`)].concat(row)
      );
      children.push(...shiftedTable);
    }
    this.addToFoldCell(children);
    return [this.canvasCells].concat(children);
  }

  private addToFoldCell(children: CanvasTable) {
    const cellToFold = new CanvasCell('▼', '');
    this.canvasCells.push(cellToFold);
    cellToFold.setChildren(children);
  }
}

export class CanvasCell {
  public width: number;

  public static readonly FONT_SIZE: number = 17;
  public static readonly HEIGHT: number = 25;
  public readonly key: string;
  public isVisible: boolean = true;

  private pos: Vector = new Vector(-1, -1);
  private colors: string[] = [];
  private children: CanvasTable | null = null;
  constructor(private text: string, parentKey: string) {
    const margin = text.length % 2 === 0 ? 1.5 : 1;
    this.width = (text.length + 2 * margin) * (CanvasCell.FONT_SIZE / 2);
    this.key = `${parentKey}-${text}`;
  }

  public setPos(x: number, y: number) {
    this.pos.setAxes(x, y);
  }

  public getPos() {
    return this.pos;
  }

  public x() {
    return this.pos.getX();
  }
  public y() {
    return this.pos.getY();
  }

  public clearColor() {
    this.colors = [];
  }

  public setColor(color: string) {
    this.colors.push(color);
  }

  public hasColor() {
    return 0 < this.colors.length;
  }

  public getColors() {
    return this.colors;
  }

  public getText() {
    return `${this.text}`;
  }

  public setChildren(children: CanvasTable) {
    this.children = children;
  }

  public canToggleFold() {
    return this.children !== null && 0 < this.children.length;
  }
  public toggleFold() {
    if (this.children !== null) {
      for (const child of this.children) {
        for (const cell of child) {
          cell.isVisible = !cell.isVisible;
        }
      }
    }
    this.text = this.text === '▼' ? '▲' : '▼';
    signal('redraw');
  }
}
