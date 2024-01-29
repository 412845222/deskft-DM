import { _decorator, Component, Node } from "cc";
import { canvas } from "./canvas";
const { ccclass, property } = _decorator;

@ccclass("gridItem")
export class gridItem extends Component {
  @property({ type: Node })
  canvas2D: canvas = null;

  start() {}

  //坐标转换
  uicoordinate(pos: any, scole: any, somedata: any) {
    // canvas.drawBallNumber2D(pos, scole, somedata)
    this.canvas2D.getComponent(canvas).drawMapGridNumber2D(pos, scole, somedata);
  }

  update(deltaTime: number) {}
}
