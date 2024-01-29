import { _decorator, Component, Node } from 'cc';
import { windowAddEvent, windowPostMsg } from './windowMsg';
import { IDcodeInput } from '../IDcodeInput/IDcodeInput';
const { ccclass, property } = _decorator;

@ccclass('toElectron')
export class toElectron extends Component {


  @property({type:Node})
  idInputNode:Node = null

  start() {
    console.log("cocos-------toElectron start")
    windowAddEvent(this.node)
    //唤起electron BliveRoom
    windowPostMsg({
      event: "blive-start",
    });
  }


  startConnect=()=> {
    console.log("开始连接")
    this.idInputNode.getComponent(IDcodeInput).submitBtnClick()
  }

  update(deltaTime: number) {

  }
}


