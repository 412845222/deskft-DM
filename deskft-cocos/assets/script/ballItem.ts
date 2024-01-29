import { _decorator, Component, Node, CylinderCollider } from "cc";
const { ccclass, property } = _decorator;
import { canvas } from "./canvas"
@ccclass("ballItem")
export class ballItem extends Component {

  @property({ type: Node })
  canvas2D: canvas = null;

  start() {
    // console.log('ballItem start')
    this.node.getComponent(CylinderCollider).on("onCollisionEnter", this.onCollisionEnter, this);
    this.node.getComponent(CylinderCollider).on("onCollisionStay", this.onCollisionStay, this);
  }
  onCollisionStay(event: any) {
    // console.log('onCollisionStay')
    this.canvas2D.getComponent(canvas).clearMoveTime()
  }

  onCollisionEnter(event: any) {
    // console.log('onCollisionEnter')
  }

  //坐标转换
  uicoordinate(pos: any, scole: any, somedata: any) {
    // console.log(somedata)
    this.canvas2D.getComponent(canvas).drawBallNumber2D(pos, scole, somedata)
  }

  update(deltaTime: number) {}
}
