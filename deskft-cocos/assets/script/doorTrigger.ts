import { _decorator, Component, Node, BoxCollider, ITriggerEvent, RigidBody } from 'cc';
import { canvas } from './canvas';
import { gameInit } from './gameInit';
const { ccclass, property } = _decorator;

@ccclass('doorTrigger')
export class doorTrigger extends Component {

    @property({ type: String })
    teamName: string = '';

    @property({ type: Node })
    canvas2D: Node = null;

    @property({ type: Node })
    gameInit:Node = null;

    start() {
      this.node.getComponent(BoxCollider).on("onTriggerEnter", this.onTriggerEnter, this);
    }

    onTriggerEnter(event: ITriggerEvent) {
      console.log('onTriggerEnter---进球！')
      this.gameInit.getComponent(gameInit).staticAllBall();
      this.canvas2D.getComponent(canvas).goalBallStep(this.teamName)
    }

    update(deltaTime: number) {
        
    }
}

