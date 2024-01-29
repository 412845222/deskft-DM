import { _decorator, Component, Node, Vec2, instantiate, UICoordinateTracker, EventHandler, RigidBody, Label } from "cc";
import { ballItem } from "./ballItem";
import { GameProcess } from "./gameProcess";
import dwebXhr from "./http/dwebXhr";
import ws from "./http/websocket";
import { createSocket, destroySocket } from "./websocket/index";
import { DM_Info } from "./websocket/dmDataStruct"
import { canvas } from "./canvas";
import { testEventTrigger } from "./testEventTrigger";
import { PlayerPool } from "./DMmessage/PlayerPool";
import { ballItemMatMnger } from "./ballItemMatMnger";
import { CameraMnger } from "./CameraMnger/CameraMnger";
import { windowPostMsg } from "./toElectron/windowMsg";
const { ccclass, property } = _decorator;

@ccclass("gameInit")
export class gameInit extends Component {
  map_origin: Vec2 = new Vec2(2.5, 2.5); // 地图原点坐标
  grid_scale: number = 5; // 格子大小
  gird_rows: number = 8; // 行数
  grid_columns: number = 6; // 列数

  @property({ type: Node })
  grid_item: Node = null; // 格子预制体
  mapGrid: Node = null;

  @property({ type: Node })
  ball_team1: Node = null; // 球预制体
  @property({ type: Node })
  ball_team2: Node = null; // 球预制体
  @property({ type: Node })
  canvas2D: Node = null;
  @property({ type: Node })
  editBox: Node = null

  ball_origin: Vec2 = new Vec2(5, 5); // 球的原点坐标
  ball_grid_scale: number = 5; // 格子大小
  ball_grid_rows: number = 7; // 行数
  ball_grid_columns: number = 5; // 列数

  ball_init_posArr: Array<Vec2> = [
    new Vec2(3, 2),
    new Vec2(1, 2),
    new Vec2(4, 1),
    new Vec2(2, 1),
    new Vec2(0, 1),
    //上下对称
    new Vec2(1, 4),
    new Vec2(3, 4),
    new Vec2(0, 5),
    new Vec2(2, 5),
    new Vec2(4, 5),
  ];

  ballTeam1: Array<Node> = [];
  ballTeam2: Array<Node> = [];

  //场次信息
  game_id: string;
  //长连接信息
  websocket_info: {
    auth_body: string;
    wss_link: string[];
  };
  //主播信息
  anchor_info: {
    room_id: number;
    uface: string;
    uid: number;
    uname: string;
  };

  dwebWs: WebSocket = null;
  hostUrl: string = "https://blive-deskft.dweb.club";

  autoPlay_type: boolean = false
  autoPlay: number | any = 0;
  @property({ type: Node })
  timeUiNode: Node = null;
  timeNum: number = 20

  //玩家池
  playerPool: PlayerPool = new PlayerPool();
  //摄像头管理
  @property({ type: Node })
  GameCamera: Node = null;
  @property({ type: Node })
  PreviewCamera: Node = null;
  @property({ type: Node })
  gameStartBtn: Node = null;

  cameraMnger: CameraMnger = null;

  start() {
    this.mapGrid = this.node.getParent().getChildByName("mapGrid");
    // this.groundInit();
    //初始化摄像头
    this.cameraMnger = new CameraMnger({
      canvas2D: this.canvas2D,
      GameCamera: this.GameCamera,
      PreviewCamera: this.PreviewCamera,

    });
    //初始化游戏进程
    this.ballInit();
    //初始化玩家池
    this.playerPool.mapGrid = this.mapGrid;
  }

  //开始游戏
  releaseGameStart() {
    console.log('游戏开始')
    this.editBox.getComponent(testEventTrigger).scriptInputValue("开始")
    this.canvas2D.getComponent(canvas).gamePushOn()
    this.startAutoLoopGame()
    this.gameStartBtn.active = false
    this.autoPlay_type = true
  }



  onMessageCallBack = (res: any) => {
    console.log(res);
    let gameStepIdx = this.canvas2D.getComponent(canvas).gameProcess.stepIdx
    if (res.cmd == 'LIVE_OPEN_PLATFORM_DM') {
      console.log('收到弹幕')
      let data: DM_Info = res.data
      let msg = data.msg
      console.log(msg)
      console.log(gameStepIdx)
      if (msg == "入场") {
        this.playerPool.addPlayer(data)
      }
      if (gameStepIdx == 1) {
        // if (msg == '开始') {
        //   console.log('游戏开始')
        //   this.editBox.getComponent(testEventTrigger).scriptInputValue(msg)
        //   this.canvas2D.getComponent(canvas).gamePushOn()
        //   this.startAutoLoopGame()
        //   this.autoPlay_type = true
        // }
      }
      if (gameStepIdx == 2) {
        //入场玩家消息
        let enterPlayer = this.playerPool.PlayerList.filter((item) => {
          if (item.uid == data.uid) {
            return item
          }
        })
        if (enterPlayer.length > 0) {
          let playerMoveMsg = {
            uid: data.uid,
            msg: msg
          }
          this.playerPool.playerMoveBallVote(playerMoveMsg, this.canvas2D)
        }


        this.editBox.getComponent(testEventTrigger).scriptInputValue(msg)
        this.canvas2D.getComponent(canvas).gameStepVote(msg)
      }
      if (gameStepIdx == 3) {
        //入场玩家消息
        let enterPlayer = this.playerPool.PlayerList.filter((item) => {
          if (item.uid == data.uid) {
            return item
          }
        })
        if (enterPlayer.length > 0) {
          let playerMoveMsg = {
            uid: data.uid,
            msg: msg
          }
          this.playerPool.playerMoveBallVote(playerMoveMsg, this.canvas2D)
        }

        this.editBox.getComponent(testEventTrigger).scriptInputValue(msg)
        this.canvas2D.getComponent(canvas).gameStepVote(msg)
      }
    }
  };

  startAutoLoopGame() {
    //每隔20秒gamePushOn
    this.timeUiNode.active = true
    this.timeUiNode.getChildByName('number').getComponent(Label).string = this.timeNum + ''
    this.autoPlay = setInterval(() => {
      this.timeNum -= 1
      this.timeUiNode.getChildByName('number').getComponent(Label).string = this.timeNum + ''

      if (this.timeNum == 0) {
        this.canvas2D.getComponent(canvas).gamePushOn()
        let gameStepIdx = this.canvas2D.getComponent(canvas).gameProcess.stepIdx
        console.log('----自动---', gameStepIdx)
        if (gameStepIdx == 1) {
          this.timeNum = 5
          this.cancelAutoPlay()
          this.timeUiNode.active = false
        }
        if (gameStepIdx == 0) {
          this.timeNum = 5
          this.cancelAutoPlay()
          this.timeUiNode.active = false
        }
        if (gameStepIdx == 2 || gameStepIdx == 3) {
          this.timeNum = 40
        }
      }
    }, 1000);
  }

  cancelAutoPlay() {
    clearInterval(this.autoPlay)
  }

  getBliveData() {
    dwebXhr.sendAjax(this.hostUrl + "/live-Auth", "GET", (res: any) => {
      console.log(JSON.parse(res));
      let data = JSON.parse(res);
      if (data.data) {
        this.game_id = data.data.game_info.game_id;
        this.websocket_info = data.data.websocket_info;
        this.anchor_info = data.data.anchor_info;
        this.handleCreateSocket();
      } else {
        console.log("获取数据失败 -- 获取服务端缓存");
        dwebXhr.sendAjax(this.hostUrl + "/try-again", "GET", (res: any) => {
          console.log(res);
          let data = res;
          if (data.data) {
            this.game_id = data.data.game_info.game_id;
            this.websocket_info = data.data.websocket_info;
            this.anchor_info = data.data.anchor_info;
          }
        });
        this.handleCreateSocket();
      }
      this.loopHeartbeat();
    });
  }



  /**
   * 测试创建长长连接接口
   */
  handleCreateSocket = () => {
    if (this.websocket_info.auth_body && this.websocket_info.wss_link) {
      let ws = createSocket(this.websocket_info.auth_body, this.websocket_info.wss_link, this.onMessageCallBack);
    }
  };

  /**
   * 测试销毁长长连接接口
   */
  handleDestroySocket = () => {
    destroySocket();
    console.log("-----长连接销毁成功-----");
  };

  loopHeartbeat() {
    setInterval(() => {
      let data = {
        game_id: this.game_id,
      };
      dwebXhr.sendAjax(
        this.hostUrl + "/loop-heart/",
        "POST",
        (res: any) => {
          console.log("心跳返回");
          console.log(res);
        },
        data
      );
    }, 20000);
  }

  ballInit() {
    console.log("ballInit", this.ball_init_posArr)
    for (let i = 0; i < this.ball_grid_columns; i++) {
      for (let j = 0; j < this.ball_grid_rows; j++) {
        this.ball_init_posArr.forEach((item, index) => {
          if (i == item.x && j == item.y) {
            if (index < 5) {
              let playerInfo = this.playerPool.getPlayerInfo(1, index + 1)
              console.log("红色玩家信息========")
              // console.log(playerInfo)


              let new_node = instantiate(this.ball_team1);
              new_node.name = "ball_1_" + index;
              new_node.active = true;
              new_node.setPosition(this.ball_origin.x + i * this.ball_grid_scale, new_node.position.y, this.ball_origin.y + j * this.ball_grid_scale);
              this.mapGrid.addChild(new_node);
              let diyEvent = new EventHandler();
              diyEvent.target = new_node;
              diyEvent.component = "ballItem";
              diyEvent.handler = "uicoordinate";
              diyEvent.customEventData = new_node.name;
              new_node.getComponent(UICoordinateTracker).syncEvents.push(diyEvent);

              if (playerInfo.length > 0) {
                new_node.getComponent(ballItemMatMnger).setAvatarMat(playerInfo[0]);
              }

            } else {
              let playerInfo = this.playerPool.getPlayerInfo(2, index - 5 + 1)
              console.log("蓝队玩家信息========")
              // console.log(playerInfo)

              let new_node = instantiate(this.ball_team2);
              new_node.name = "ball_2_" + (index - 5);
              new_node.active = true;
              new_node.setPosition(this.ball_origin.x + i * this.ball_grid_scale, new_node.position.y, this.ball_origin.y + j * this.ball_grid_scale);
              this.mapGrid.addChild(new_node);
              let diyEvent = new EventHandler();
              diyEvent.target = new_node;
              diyEvent.component = "ballItem";
              diyEvent.handler = "uicoordinate";
              diyEvent.customEventData = new_node.name;
              new_node.getComponent(UICoordinateTracker).syncEvents.push(diyEvent);

              if (playerInfo.length > 0) {
                new_node.getComponent(ballItemMatMnger).setAvatarMat(playerInfo[0]);
              }

            }
          }
        });
      }
    }
  }

  staticAllBall() {
    this.ball_init_posArr.forEach((item, index) => {
      if (index < 5) {
        let ball_node = this.mapGrid.getChildByName("ball_1_" + index);
        ball_node.getComponent(RigidBody).type = 2;
      } else {
        let ball_node = this.mapGrid.getChildByName("ball_2_" + (index - 5));
        ball_node.getComponent(RigidBody).type = 2;
      }
    });
  }

  //删除所有球
  deleteAllBall() {
    this.ball_init_posArr.forEach((item, index) => {
      if (index < 5) {
        let ball_node = this.mapGrid.getChildByName("ball_1_" + index);
        ball_node.destroy();
      } else {
        let ball_node = this.mapGrid.getChildByName("ball_2_" + (index - 5));
        ball_node.destroy();
      }
    });
  }

  //重新初始化
  reInit() {
    this.deleteAllBall();
    this.ballInit();
  }

  groundInit() {
    //循环生成地图
    for (let i = 0; i < this.grid_columns; i++) {
      for (let j = 0; j < this.gird_rows; j++) {
        let new_node = instantiate(this.grid_item);
        new_node.name = "grid_" + i + "_" + j;
        new_node.active = true;
        new_node.setPosition(this.map_origin.x + i * this.grid_scale, new_node.position.y, this.map_origin.y + j * this.grid_scale);
        this.mapGrid.addChild(new_node);
        let diyEvent = new EventHandler();
        diyEvent.target = new_node;
        diyEvent.component = "gridItem";
        diyEvent.handler = "uicoordinate";
        diyEvent.customEventData = new_node.name;
        new_node.getComponent(UICoordinateTracker).syncEvents.push(diyEvent);
      }
    }
  }

  //隐藏ground grid
  hideGround() {
    //循环删除地图
    for (let i = 0; i < this.grid_columns; i++) {
      for (let j = 0; j < this.gird_rows; j++) {
        let grid_node = this.mapGrid.getChildByName("grid_" + i + "_" + j);
        grid_node.destroy();
      }
    }
  }
  update(deltaTime: number) { }
}
