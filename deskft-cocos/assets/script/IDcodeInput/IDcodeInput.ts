import { _decorator, Component, EditBox, Input, Label, Node } from 'cc';
import { toElectron } from '../toElectron/toElectron';
import dwebXhr from '../http/dwebXhr';
import { gameInit } from '../gameInit';
import { canvas } from '../canvas';

const { ccclass, property } = _decorator;

@ccclass('IDcodeInput')
export class IDcodeInput extends Component {

  @property({ type: Node })
  conectTip: Node = null;
  @property({ type: Node })
  progressBar: Node = null;
  @property({ type: Node })
  toElectronNode: Node = null;
  @property({ type: Node })
  gameInit: Node = null;

  @property({ type: String })
  hostUrl: string = "";

  conectTipTimer: number = 0;
  conectTipString: string = "连接中"
  conectIng: boolean = true

  start() {

  }

  submitBtnClick() {
    console.log('------submitBtnClick')
    if (this.conectIng) {
      console.log('------开始重连')
      this.conectIng = false
      this.conectTipStringAnime()

      //服务器登录
      let bliveRoom: { room_id: string, code: string } = JSON.parse(localStorage.getItem("bliveRoom"))
      console.log(this.hostUrl)
      console.log(bliveRoom)
      dwebXhr.sendAjax(this.hostUrl + "/live-Auth/", "POST", (res: any) => {
        console.log(JSON.parse(res));
        res = JSON.parse(res);
        if (res.code == 7002) {
          console.log("-----房间重复")
          this.conectTipString = "冷却中"
          alert("房间重复,请重试")
          this.endGameRoom()
        }
        if (res.code == 0) {
          this.enterGame(res)
        }
      }, {
        code: bliveRoom.code,
        room_id: bliveRoom.room_id
      });

    } else {
      console.log('---正在连接--无可操作')
    }
  }

  conectTipStringAnime() {
    let time_num = 0
    this.conectTipTimer = setInterval(() => {
      this.conectTip.getChildByName("Label").getComponent(Label).string = `${this.conectTipString}...${time_num++}`
      if (time_num > 10) {
        this.conectIng = true
        this.conectTip.getChildByName("Label").getComponent(Label).string = "点击重试"
        clearInterval(this.conectTipTimer)
      }
    }, 1000)
  }

  enterGame(data:any) {
    this.gameInit.getComponent(gameInit).game_id = data.data.game_info.game_id;
    this.gameInit.getComponent(gameInit).websocket_info = data.data.websocket_info;
    this.gameInit.getComponent(gameInit).anchor_info = data.data.anchor_info;
    this.gameInit.getComponent(gameInit).handleCreateSocket();
    this.gameInit.getComponent(gameInit).cameraMnger.setFirstCamera('game')
    this.gameInit.getComponent(gameInit).loopHeartbeat()
    this.gameInit.getComponent(gameInit).canvas2D.getComponent(canvas).releaseStart()
    this.node.getParent().active = false
  }

  endGameRoom() {
    let bliveRoom: { room_id: string, code: string } = JSON.parse(localStorage.getItem("bliveRoom"))
    dwebXhr.sendAjax(this.hostUrl + "/game-end/", "POST", (res: any) => {
      console.log(JSON.parse(res));

    }, {
      code: bliveRoom.code,
      room_id: bliveRoom.room_id
    });
  }

  reloadAllWindow(){
    this.endGameRoom()
    window.location.reload()
  }

  update(deltaTime: number) {

  }
}


