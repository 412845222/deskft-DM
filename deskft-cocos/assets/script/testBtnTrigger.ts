import { _decorator, Component, Node, Label } from 'cc';
import { canvas } from './canvas';
import { gameInit } from './gameInit';
const { ccclass, property } = _decorator;

@ccclass('testBtnTrigger')
export class testBtnTrigger extends Component {

  @property({ type: Node })
  canvasUI:Node = null;
  @property({ type: Node })
  gameInit:Node = null;

  

    start() {
      // this.testBtnClick()
    }

    testBtnClick(){ 
      this.canvasUI.getComponent(canvas).gamePushOn()
    }

    cancelAutoPlay(){
      this.gameInit.getComponent(gameInit).cancelAutoPlay()
    }



    update(deltaTime: number) {
        
    }
}

