import { _decorator, Component, Node, EditBox, instantiate, Label } from 'cc';
import { canvas } from './canvas';
const { ccclass, property } = _decorator;

@ccclass('testEventTrigger')
export class testEventTrigger extends Component {

    @property({ type: Node })
    chatContent:Node = null;
    @property({ type: Node })
    chatItem:Node = null;
    @property({ type: Node })
    canvasUI:Node = null;

    start() {

    }

    getInputValue(editbox: EditBox) {
        this.canvasUI.getComponent(canvas).gameStepVote(editbox.string)
        let new_node = instantiate(this.chatItem);
        new_node.active = true;
        new_node.getComponent(Label).string = editbox.string;
        this.chatContent.addChild(new_node);
        editbox.string = '';
    }

    scriptInputValue(value:string){
        let new_node = instantiate(this.chatItem);
        new_node.active = true;
        new_node.getComponent(Label).string = value;
        this.chatContent.addChild(new_node);
        this.canvasUI.getComponent(canvas).gameStepVote(value)
    }

    

    update(deltaTime: number) {
        
    }
}

