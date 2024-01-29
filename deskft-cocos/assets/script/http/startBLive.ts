import { _decorator, Component, Node } from 'cc';
import { gameInit } from '../gameInit';
const { ccclass, property } = _decorator;

@ccclass('startBLive')
export class startBLive extends Component {
    @property({ type: Node })
    gameInit:Node = null;
    start() {

    }

    startBlive(){
        this.gameInit.getComponent(gameInit).getBliveData();
    }

    update(deltaTime: number) {
        
    }
}

