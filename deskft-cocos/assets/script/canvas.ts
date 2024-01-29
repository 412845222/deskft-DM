import { _decorator, Component, Node, instantiate, Label, tween, Vec3, RenderTexture, Sprite, SpriteFrame, Camera, RigidBody } from "cc";
import { gameInit } from "./gameInit";
import { GameProcess } from "./gameProcess";
import { VoteCatapult } from "./voteCatapult";
import { VoteBall, VoteDetail } from "./voteSelectBall";
const { ccclass, property } = _decorator;

@ccclass("canvas")
export class canvas extends Component {
  @property({ type: Node })
  ballName: Node = null;
  @property({ type: Node })
  gridName: Node = null;

  @property({ type: Node })
  processTip: Node = null;

  @property({ type: Node })
  playText: Node = null; //490 790

  @property({ type: Node })
  gridsName: Node = null;
  @property({ type: Node })
  ballsName: Node = null;
  //球员名字列表
  ballNameList: Node[] = [];

  gameProcess: GameProcess = null;
  voteBall: VoteBall = null;
  voteCatapult: VoteCatapult = null;
  red_targetGrid: Node = null;
  blue_targetGrid: Node = null;

  @property({ type: Node })
  step1_ui: Node = null;
  @property({ type: Node })
  step2_ui: Node = null;

  @property({ type: Node })
  mapGrid: Node = null;
  @property({ type: Node })
  gameInit: Node = null;

  move_timer: number = 0;

  @property({ type: Node })
  scoreNode: Node = null;
  @property({ type: Node })
  leftUiPreview: Node = null; //-440 -840
  @property({ type: Node })
  bottomUi: Node = null;

  pushNextTimer: number = null;

  start() {
    // this.ballsName = this.ballName.getParent();
    // this.gridsName = this.gridName.getParent();
    this.gameProcess = new GameProcess();
    this.voteBall = new VoteBall();
    this.leftUiCameraPreview();
  }

  releaseStart(){
    let target ={
      left:this.leftUiPreview.position.x,
      bottom:this.bottomUi.position.y,
      playText:this.playText.position.x
    }

    tween(target).to(0.5,{
      left:-440,
      bottom:0,
      playText:490
    },{
      easing:"sineOut",
      onUpdate:()=>{
        this.leftUiPreview.setPosition(new Vec3(target.left,0,0))
        this.bottomUi.setPosition(new Vec3(0,target.bottom,0))
        this.playText.setPosition(new Vec3(target.playText,0,0))
      },
      onComplete:()=>{
        this.gamePushOn();
      }
    }).start()
  }

  gamePushOn() {
    let gameProcess = this.node.getComponent(canvas).gameProcess;
    console.log(gameProcess);
    let step = gameProcess.stepList[gameProcess.stepIdx];
    this.processTip.getComponent(Label).string = step.tipStr;
    if (step.title) {
      this.playText.getChildByName("Title_Label").getComponent(Label).string = step.title;
    }
    console.log(step.stepIdx);
    if (step.stepIdx == 1) {
      this.selectBallStep();
      this.leftUiCameraPreview();
    }
    if (step.stepIdx == 2) {
      this.catapultStep();
    }
    if (step.stepIdx == 3) {
      this.ballMoveStep();
      gameProcess.stepIdx = -1;
      this.voteBall.clearVotePool();
      this.voteCatapult.clearVotePool();
      this.gameInit.getComponent(gameInit).playerPool.moveBallVoteList = [];
      this.clearMoveTime()
    }
    gameProcess.stepIdx += 1;
    this.leftUiCameraPreview();
  }
  //进球阶段
  goalBallStep(teamName: string) {
    this.gameProcess.goalBall(teamName);
    this.clearMoveTime();
    clearInterval(this.pushNextTimer);
    let red_num = this.scoreNode.getChildByPath("teamNum/red");
    let blue_num = this.scoreNode.getChildByPath("teamNum/blue");
    red_num.getComponent(Label).string = this.gameProcess.score.red + "";
    blue_num.getComponent(Label).string = this.gameProcess.score.blue + "";

    let goal_text = this.scoreNode.getChildByName("goal-text");
    let team_num = this.scoreNode.getChildByName("teamNum");

    tween(goal_text.position)
      .to(0.3, new Vec3(0, 80, 0), {
        easing: "sineOut",
        onUpdate: (target: Vec3) => {
          goal_text.setPosition(target);
        },
        onComplete: () => {
          setTimeout(() => {
            tween(goal_text.position)
              .to(0.3, new Vec3(0, 500, 0), {
                easing: "sineIn",
                onUpdate: (target: Vec3) => {
                  goal_text.setPosition(target);
                },
              })
              .start();
          }, 2000);
        },
      })
      .start();

    tween(team_num.position)
      .to(0.3, new Vec3(0, -20, 0), {
        easing: "sineOut",
        onUpdate: (target: Vec3) => {
          team_num.setPosition(target);
        },
        onComplete: () => {
          setTimeout(() => {
            tween(team_num.position)
              .to(0.3, new Vec3(0, -500, 0), {
                easing: "sineIn",
                onUpdate: (target: Vec3) => {
                  team_num.setPosition(target);
                },
                onComplete: () => {
                  this.nextRound();
                },
              })
              .start();
          }, 2000);
        },
      })
      .start();
  }

  nextRound() {
    let restart = this.gameProcess.nextRound();
    if (restart.restart) {
      this.restartGame(restart.victory);
    } else {
      this.gameInit.getComponent(gameInit).reInit();
      this.clearBallNumber2D();
      //清空投票记录
      this.voteBall.clearVotePool();
      this.voteCatapult.clearVotePool();
      this.clearMoveTime();
      clearInterval(this.pushNextTimer);
      this.gamePushOn();
      this.leftUiCameraPreview();
      if (this.gameInit.getComponent(gameInit).autoPlay_type) {
        this.gameInit.getComponent(gameInit).startAutoLoopGame();
      }
    }
  }

  //重载游戏
  restartGame(team: string) {
    let victoryNode: Node;
    if (team == "red") {
      victoryNode = this.scoreNode.getChildByName("victory-red");
    } else {
      victoryNode = this.scoreNode.getChildByName("victory-blue");
    }

    tween(victoryNode.position)
      .to(0.3, new Vec3(0, 0, 0), {
        easing: "sineOut",
        onUpdate: (target: Vec3) => {
          victoryNode.setPosition(target);
        },
        onComplete: () => {
          setTimeout(() => {
            tween(victoryNode.position)
              .to(0.3, new Vec3(0, 600, 0), {
                easing: "sineIn",
                onUpdate: (target: Vec3) => {
                  victoryNode.setPosition(target);
                },
                onComplete: () => {
                  this.gameInit.getComponent(gameInit).reInit();
                  this.clearBallNumber2D();
                  this.gameProcess = new GameProcess();
                  this.voteBall = new VoteBall();
                  this.voteCatapult = null;
                  this.red_targetGrid = null;
                  this.blue_targetGrid = null;
                  this.ballNameList = [];
                  this.clearMoveTime();
                  clearInterval(this.pushNextTimer);
                  this.gamePushOn();
                  this.leftUiCameraPreview();
                  if (this.gameInit.getComponent(gameInit).autoPlay_type) {
                    this.gameInit.getComponent(gameInit).startAutoLoopGame();
                  }
                },
              })
              .start();
          }, 2000);
        },
      })
      .start();
  }

  //球运动观看阶段
  ballMoveStep() {
    this.ballMove();
    //隐藏地图grid以及2D坐标
    this.hideMapGridAndGridsName();

    //收起2阶段UI
    tween(this.step2_ui.position)
      .to(0.3, new Vec3(600, 0, 0), {
        easing: "smooth",
        onUpdate: (target: Vec3) => {
          this.step2_ui.setPosition(target);
        },
        onComplete: () => {},
      })
      .start();
  }

  hideMapGridAndGridsName() {
    this.gameInit.getComponent(gameInit).hideGround();
    //循环删除2D坐标Label地图
    for (let index = 0; index < 6; index++) {
      let grid_x_name = this.numberToLetter(index);
      let x_label = this.gridsName.getChildByName(grid_x_name);
      x_label.destroy();
    }
    for (let index = 0; index < 8; index++) {
      let grid_y_name = index + "";
      let y_label = this.gridsName.getChildByName(grid_y_name);
      y_label.destroy();
    }
  }

  ballMove() {
    let red_ballNode = this.mapGrid.getChildByName("ball_1_" + this.voteBall.getTeamVoteDetail("red").first.ballIdx);
    let blue_ballNode = this.mapGrid.getChildByName("ball_2_" + this.voteBall.getTeamVoteDetail("blue").first.ballIdx);
    let red_ball = red_ballNode.getComponent(RigidBody);
    let blue_ball = blue_ballNode.getComponent(RigidBody);
    let red_power = this.voteCatapult.getTeamVoteResult("red").power.first.power;
    let blue_power = this.voteCatapult.getTeamVoteResult("blue").power.first.power;
    

    this.gameInit.getComponent(gameInit).playerPool.moveBallVoteList.forEach((voteItem)=>{
      let playerBallNode = this.mapGrid.getChildByName(voteItem.ballName);
      let ballRigidBody = playerBallNode.getComponent(RigidBody);
      let power = voteItem.power;
      if(voteItem.ballName=="ball_1_" + this.voteBall.getTeamVoteDetail("red").first.ballIdx){
        red_power = red_power+power;
      }else if(voteItem.ballName=="ball_2_" + this.voteBall.getTeamVoteDetail("blue").first.ballIdx){
        blue_power = blue_power+power;
      }else{
        ballRigidBody.applyLocalImpulse(new Vec3(0, 0, -power/2));
      }
    })

    red_ball.applyLocalImpulse(new Vec3(0, 0, -red_power/2));
    blue_ball.applyLocalImpulse(new Vec3(0, 0, -blue_power/2));

    this.moveTimer();
  }

  moveTimer() {
    this.pushNextTimer = setInterval(() => {
      this.move_timer += 1;
      console.log(this.move_timer);
      if (this.move_timer >= 3) {
        clearInterval(this.pushNextTimer);
        this.gamePushOn();
        if (this.gameInit.getComponent(gameInit).autoPlay_type) {
          this.gameInit.getComponent(gameInit).startAutoLoopGame();
        }
      }
    }, 1000);
  }

  clearMoveTime() {
    this.move_timer = 0;
  }

  //投球阶段
  catapultStep() {
    this.cameraPreviewFindSelectBall();
    this.leftUiCameraPreview();
    this.gameInit.getComponent(gameInit).groundInit();
    this.voteCatapult = new VoteCatapult();
    this.catapultStepUIBinding();

    //收起1阶段UI
    tween(this.step1_ui.position)
      .to(0.3, new Vec3(300, 0, 0), {
        easing: "smooth",
        onUpdate: (target: Vec3) => {
          this.step1_ui.setPosition(target);
        },
      })
      .start();
    //展开2阶段UI
    tween(this.step2_ui.position)
      .to(0.3, new Vec3(0, 0, 0), {
        easing: "smooth",
        onUpdate: (target: Vec3) => {
          this.step2_ui.setPosition(target);
        },
      })
      .start();
  }

  catapultStepUIBinding() {
    let red_voteData = this.voteCatapult.getTeamVoteResult("red");
    let blue_voteData = this.voteCatapult.getTeamVoteResult("blue");

    let red_first_grid = red_voteData.gridPos.first;
    let red_second_grid = red_voteData.gridPos.second;
    let red_third_grid = red_voteData.gridPos.third;
    let red_first_node = this.step2_ui.getChildByPath("Team1/posItem");
    let red_second_node = this.step2_ui.getChildByPath("Team1/posItem-001");
    let red_third_node = this.step2_ui.getChildByPath("Team1/posItem-002");

    if (red_first_grid != undefined) {
      let red_first_grid_name = this.numberToLetter(red_first_grid.x) + red_first_grid.y;
      let red_first_grid_voteNum = red_first_grid.voteNum;
      red_first_node.getChildByPath("posText").getComponent(Label).string = red_first_grid_name;
      red_first_node.getChildByPath("posText-vote").getComponent(Label).string = red_first_grid_voteNum + " 票";
    } else {
      red_first_node.getChildByPath("posText").getComponent(Label).string = "-";
      red_first_node.getChildByPath("posText-vote").getComponent(Label).string = "-" + " 票";
    }

    if (red_second_grid != undefined) {
      let red_second_grid_name = this.numberToLetter(red_second_grid.x) + red_second_grid.y;
      let red_second_grid_voteNum = red_second_grid.voteNum;
      red_second_node.getChildByPath("posText").getComponent(Label).string = red_second_grid_name;
      red_second_node.getChildByPath("posText-vote").getComponent(Label).string = red_second_grid_voteNum + " 票";
    } else {
      red_second_node.getChildByPath("posText").getComponent(Label).string = "-";
      red_second_node.getChildByPath("posText-vote").getComponent(Label).string = "-" + " 票";
    }

    if (red_third_grid != undefined) {
      let red_third_grid_name = this.numberToLetter(red_third_grid.x) + red_third_grid.y;
      let red_third_grid_voteNum = red_third_grid.voteNum;
      red_third_node.getChildByPath("posText").getComponent(Label).string = red_third_grid_name;
      red_third_node.getChildByPath("posText-vote").getComponent(Label).string = red_third_grid_voteNum + " 票";
    } else {
      red_third_node.getChildByPath("posText").getComponent(Label).string = "-";
      red_third_node.getChildByPath("posText-vote").getComponent(Label).string = "-" + " 票";
    }

    let red_first_power = red_voteData.power.first;
    let red_second_power = red_voteData.power.second;
    let red_third_power = red_voteData.power.third;

    let red_first_power_node = this.step2_ui.getChildByPath("Team1/intensity-item");
    let red_second_power_node = this.step2_ui.getChildByPath("Team1/intensity-item-001");
    let red_third_power_node = this.step2_ui.getChildByPath("Team1/intensity-item-002");

    if (red_first_power != undefined) {
      red_first_power_node.getChildByPath("intensityText-value").getComponent(Label).string = red_first_power.power + "%";
      red_first_power_node.getChildByPath("vote-text").getComponent(Label).string = red_first_power.voteNum + " 票";
    } else {
      red_first_power_node.getChildByPath("intensityText-value").getComponent(Label).string = "-";
      red_first_power_node.getChildByPath("vote-text").getComponent(Label).string = "-" + " 票";
    }

    if (red_second_power != undefined) {
      red_second_power_node.getChildByPath("intensityText-value").getComponent(Label).string = red_second_power.power + "%";
      red_second_power_node.getChildByPath("vote-text").getComponent(Label).string = red_second_power.voteNum + " 票";
    } else {
      red_second_power_node.getChildByPath("intensityText-value").getComponent(Label).string = "-";
      red_second_power_node.getChildByPath("vote-text").getComponent(Label).string = "-" + " 票";
    }

    if (red_third_power != undefined) {
      red_third_power_node.getChildByPath("intensityText-value").getComponent(Label).string = red_third_power.power + "%";
      red_third_power_node.getChildByPath("vote-text").getComponent(Label).string = red_third_power.voteNum + " 票";
    } else {
      red_third_power_node.getChildByPath("intensityText-value").getComponent(Label).string = "-";
      red_third_power_node.getChildByPath("vote-text").getComponent(Label).string = "-" + " 票";
    }

    let blue_first_grid = blue_voteData.gridPos.first;
    let blue_second_grid = blue_voteData.gridPos.second;
    let blue_third_grid = blue_voteData.gridPos.third;
    let blue_first_node = this.step2_ui.getChildByPath("Team2/posItem");
    let blue_second_node = this.step2_ui.getChildByPath("Team2/posItem-001");
    let blue_third_node = this.step2_ui.getChildByPath("Team2/posItem-002");

    if (blue_first_grid != undefined) {
      console.log(blue_first_grid);
      let blue_first_grid_name = this.numberToLetter(blue_first_grid.x) + blue_first_grid.y;
      let blue_first_grid_voteNum = blue_first_grid.voteNum;
      blue_first_node.getChildByPath("posText").getComponent(Label).string = blue_first_grid_name;
      blue_first_node.getChildByPath("posText-vote").getComponent(Label).string = blue_first_grid_voteNum + " 票";
    } else {
      blue_first_node.getChildByPath("posText").getComponent(Label).string = "-";
      blue_first_node.getChildByPath("posText-vote").getComponent(Label).string = "-" + " 票";
    }

    if (blue_second_grid != undefined) {
      let blue_second_grid_name = this.numberToLetter(blue_second_grid.x) + blue_second_grid.y;
      let blue_second_grid_voteNum = blue_second_grid.voteNum;
      blue_second_node.getChildByPath("posText").getComponent(Label).string = blue_second_grid_name;
      blue_second_node.getChildByPath("posText-vote").getComponent(Label).string = blue_second_grid_voteNum + " 票";
    } else {
      blue_second_node.getChildByPath("posText").getComponent(Label).string = "-";
      blue_second_node.getChildByPath("posText-vote").getComponent(Label).string = "-" + " 票";
    }

    if (blue_third_grid != undefined) {
      let blue_third_grid_name = this.numberToLetter(blue_third_grid.x) + blue_third_grid.y;
      let blue_third_grid_voteNum = blue_third_grid.voteNum;
      blue_third_node.getChildByPath("posText").getComponent(Label).string = blue_third_grid_name;
      blue_third_node.getChildByPath("posText-vote").getComponent(Label).string = blue_third_grid_voteNum + " 票";
    } else {
      blue_third_node.getChildByPath("posText").getComponent(Label).string = "-";
      blue_third_node.getChildByPath("posText-vote").getComponent(Label).string = "-" + " 票";
    }

    let blue_first_power = blue_voteData.power.first;
    let blue_second_power = blue_voteData.power.second;
    let blue_third_power = blue_voteData.power.third;

    let blue_first_power_node = this.step2_ui.getChildByPath("Team2/intensity-item");
    let blue_second_power_node = this.step2_ui.getChildByPath("Team2/intensity-item-001");
    let blue_third_power_node = this.step2_ui.getChildByPath("Team2/intensity-item-002");

    if (blue_first_power != undefined) {
      blue_first_power_node.getChildByPath("intensityText-value").getComponent(Label).string = blue_first_power.power + "%";
      blue_first_power_node.getChildByPath("vote-text").getComponent(Label).string = blue_first_power.voteNum + " 票";
    } else {
      blue_first_power_node.getChildByPath("intensityText-value").getComponent(Label).string = "-";
      blue_first_power_node.getChildByPath("vote-text").getComponent(Label).string = "-" + " 票";
    }

    if (blue_second_power != undefined) {
      blue_second_power_node.getChildByPath("intensityText-value").getComponent(Label).string = blue_second_power.power + "%";
      blue_second_power_node.getChildByPath("vote-text").getComponent(Label).string = blue_second_power.voteNum + " 票";
    } else {
      blue_second_power_node.getChildByPath("intensityText-value").getComponent(Label).string = "-";
      blue_second_power_node.getChildByPath("vote-text").getComponent(Label).string = "-" + " 票";
    }

    if (blue_third_power != undefined) {
      blue_third_power_node.getChildByPath("intensityText-value").getComponent(Label).string = blue_third_power.power + "%";
      blue_third_power_node.getChildByPath("vote-text").getComponent(Label).string = blue_third_power.voteNum + " 票";
    } else {
      blue_third_power_node.getChildByPath("intensityText-value").getComponent(Label).string = "-";
      blue_third_power_node.getChildByPath("vote-text").getComponent(Label).string = "-" + " 票";
    }

    //旋转球视角方向
    let red_first = this.voteBall.getTeamVoteDetail("red").first.ballIdx;
    let blue_first = this.voteBall.getTeamVoteDetail("blue").first.ballIdx;
    //如果玩家控制，不需要自动旋转
    let playerList = this.gameInit.getComponent(gameInit).playerPool.PlayerList
    playerList.forEach((item)=>{
      if (item.team == 1&&item.memberNum-1 == red_first) {
        return
      }
      if (item.team == 2&&item.memberNum-1 == blue_first) {
        return
      }
    })

    
    let red_targetMap = this.mapGrid.getChildByName("grid_" + red_first_grid.x + "_" + red_first_grid.y);
    if (this.red_targetGrid == null || red_targetMap != this.red_targetGrid) {
      let red_camera_node = this.mapGrid.getChildByName("ball_1_" + red_first);
      red_camera_node.setRotationFromEuler(0, 0, 0);
      let red_ball_node = red_camera_node.getChildByName("ball");
      red_ball_node.lookAt(red_targetMap.position);
      red_camera_node.getComponent(RigidBody).type = 2;
      let red_tartgetVec3 = {
        x: red_camera_node.eulerAngles.x,
        y: red_camera_node.eulerAngles.y,
        z: red_camera_node.eulerAngles.z,
      };
      tween(red_tartgetVec3)
        .to(
          1,
          { x: 0, y: red_ball_node.eulerAngles.y, z: 0 },
          {
            onComplete: (target: Vec3) => {
              red_camera_node.getComponent(RigidBody).type = 1;
              red_ball_node.setRotationFromEuler(new Vec3(0, 0, 0));
            },
            onUpdate: (target: Vec3) => {
              red_camera_node.setRotationFromEuler(new Vec3(target.x, target.y, target.z));
            },
          }
        )
        .start();
      this.red_targetGrid = red_targetMap;
    }

    let blue_targetMap = this.mapGrid.getChildByName("grid_" + blue_first_grid.x + "_" + blue_first_grid.y);
    if (this.blue_targetGrid == null || blue_targetMap != this.blue_targetGrid) {
      let blue_camera_node = this.mapGrid.getChildByName("ball_2_" + blue_first);
      blue_camera_node.setRotationFromEuler(0, 0, 0);
      let blue_ball_node = blue_camera_node.getChildByName("ball");
      blue_ball_node.lookAt(blue_targetMap.position);
      blue_camera_node.getComponent(RigidBody).type = 2;
      let blue_tartgetVec3 = {
        x: blue_camera_node.eulerAngles.x,
        y: blue_camera_node.eulerAngles.y,
        z: blue_camera_node.eulerAngles.z,
      };
      tween(blue_tartgetVec3)
        .to(
          1,
          { x: 0, y: blue_ball_node.eulerAngles.y, z: 0 },
          {
            onComplete: (target: Vec3) => {
              blue_camera_node.getComponent(RigidBody).type = 1;
              blue_ball_node.setRotationFromEuler(new Vec3(0, 0, 0));
            },
            onUpdate: (target: Vec3) => {
              blue_camera_node.setRotationFromEuler(new Vec3(target.x, target.y, target.z));
            },
          }
        )
        .start();
      this.blue_targetGrid = blue_targetMap;
    }
  }

  cameraPreviewFindSelectBall() {
    let red_first = this.voteBall.getTeamVoteDetail("red").first.ballIdx;
    let blue_first = this.voteBall.getTeamVoteDetail("blue").first.ballIdx;

    let red_ballNode = this.mapGrid.getChildByName("ball_1_" + red_first);
    let red_camera = red_ballNode.getChildByName("Camera");
    let red_preview = new RenderTexture();
    red_preview.reset({ width: 300, height: 200 });
    red_camera.getComponent(Camera).targetTexture = red_preview;
    let red_sp = new SpriteFrame();
    red_sp.texture = red_preview;
    this.step2_ui.getChildByPath("Team1/cameraPreview").getComponent(Sprite).spriteFrame = red_sp;

    let blue_ballNode = this.mapGrid.getChildByName("ball_2_" + blue_first);
    let blue_camera = blue_ballNode.getChildByName("Camera");
    let blue_preview = new RenderTexture();
    blue_preview.reset({ width: 300, height: 200 });
    blue_camera.getComponent(Camera).targetTexture = blue_preview;
    let blue_sp = new SpriteFrame();
    blue_sp.texture = blue_preview;
    this.step2_ui.getChildByPath("Team2/cameraPreview").getComponent(Sprite).spriteFrame = blue_sp;
  }

  leftUiCameraPreview() {
    let red_first = this.voteBall.getTeamVoteDetail("red").first.ballIdx;
    let blue_first = this.voteBall.getTeamVoteDetail("blue").first.ballIdx;

    let red_ballNode = this.mapGrid.getChildByName("ball_1_" + red_first);
    let red_camera = red_ballNode.getChildByName("Camera-001");
    let red_preview = new RenderTexture();
    red_preview.reset({ width: 400, height: 300 });
    red_camera.getComponent(Camera).targetTexture = red_preview;
    let red_sp = new SpriteFrame();
    red_sp.texture = red_preview;
    this.leftUiPreview.getChildByName("red").getComponent(Sprite).spriteFrame = red_sp;

    let blue_ballNode = this.mapGrid.getChildByName("ball_2_" + blue_first);
    let blue_camera = blue_ballNode.getChildByName("Camera-001");
    let blue_preview = new RenderTexture();
    blue_preview.reset({ width: 400, height: 300 });
    blue_camera.getComponent(Camera).targetTexture = blue_preview;
    let blue_sp = new SpriteFrame();
    blue_sp.texture = blue_preview;
    this.leftUiPreview.getChildByName("blue").getComponent(Sprite).spriteFrame = blue_sp;
  }

  //选球阶段
  selectBallStep() {
    this.selectBall_uiBinding();

    tween(this.step1_ui.position)
      .to(0.3, new Vec3(0, 0, 0), {
        easing: "smooth",
        onUpdate: (target: Vec3) => {
          this.step1_ui.setPosition(target);
        },
      })
      .start();
  }

  //选球阶段UI绑定
  selectBall_uiBinding() {
    let red_uidata: VoteDetail = this.voteBall.getTeamVoteDetail("red");
    let blue_uidata: VoteDetail = this.voteBall.getTeamVoteDetail("blue");
    console.log("---获取票池结果---");
    this.step1_ui.getChildByPath("Team1/ball_icon_frist/ballName").getComponent(Label).string = red_uidata.first.ballIdx + 1 + "";
    let red_first_ball = this.step1_ui.getChildByPath("Team1/ball_icon_001");
    red_first_ball.getChildByName("ballName").getComponent(Label).string = red_uidata.first.ballIdx + 1 + "";
    red_first_ball.getChildByName("voteNum").getComponent(Label).string = red_uidata.first.voteNum + " 票";

    let red_second_ball = this.step1_ui.getChildByPath("Team1/ball_icon_002");
    if (red_uidata.second.ballIdx != null) {
      red_second_ball.getChildByName("ballName").getComponent(Label).string = red_uidata.second.ballIdx + 1 + "";
      red_second_ball.getChildByName("voteNum").getComponent(Label).string = red_uidata.second.voteNum + " 票";
    } else {
      red_second_ball.getChildByName("ballName").getComponent(Label).string = "-";
      red_second_ball.getChildByName("voteNum").getComponent(Label).string = "0 票";
    }

    let red_third_ball = this.step1_ui.getChildByPath("Team1/ball_icon_003");
    if (red_uidata.third.ballIdx != null) {
      red_third_ball.getChildByName("ballName").getComponent(Label).string = red_uidata.third.ballIdx + 1 + "";
      red_third_ball.getChildByName("voteNum").getComponent(Label).string = red_uidata.third.voteNum + " 票";
    } else {
      red_third_ball.getChildByName("ballName").getComponent(Label).string = "-";
      red_third_ball.getChildByName("voteNum").getComponent(Label).string = "0 票";
    }

    this.step1_ui.getChildByPath("Team2/ball_icon_frist/ballName").getComponent(Label).string = blue_uidata.first.ballIdx + 1 + "";
    let blue_first_ball = this.step1_ui.getChildByPath("Team2/ball_icon_001");
    blue_first_ball.getChildByName("ballName").getComponent(Label).string = blue_uidata.first.ballIdx + 1 + "";
    blue_first_ball.getChildByName("voteNum").getComponent(Label).string = blue_uidata.first.voteNum + " 票";

    let blue_second_ball = this.step1_ui.getChildByPath("Team2/ball_icon_002");
    if (blue_uidata.second.ballIdx != null) {
      blue_second_ball.getChildByName("ballName").getComponent(Label).string = blue_uidata.second.ballIdx + 1 + "";
      blue_second_ball.getChildByName("voteNum").getComponent(Label).string = blue_uidata.second.voteNum + " 票";
    } else {
      blue_second_ball.getChildByName("ballName").getComponent(Label).string = "-";
      blue_second_ball.getChildByName("voteNum").getComponent(Label).string = "0 票";
    }

    let blue_third_ball = this.step1_ui.getChildByPath("Team2/ball_icon_003");
    if (blue_uidata.third.ballIdx != null) {
      blue_third_ball.getChildByName("ballName").getComponent(Label).string = blue_uidata.third.ballIdx + 1 + "";
      blue_third_ball.getChildByName("voteNum").getComponent(Label).string = blue_uidata.third.voteNum + " 票";
    } else {
      blue_third_ball.getChildByName("ballName").getComponent(Label).string = "-";
      blue_third_ball.getChildByName("voteNum").getComponent(Label).string = "0 票";
    }

    //获取投票第一球的node
    for (let i = 0; i < 5; i++) {
      let red_first_ball_node = this.mapGrid.getChildByName("ball_1_" + red_uidata.first.ballIdx).getChildByName("Particle");
      red_first_ball_node.active = true;
      let blue_first_ball_node = this.mapGrid.getChildByName("ball_2_" + blue_uidata.first.ballIdx).getChildByName("Particle");
      blue_first_ball_node.active = true;

      if (red_uidata.first.ballIdx == i) {
        this.mapGrid.getChildByName("ball_1_" + i).getChildByName("Particle").active = true;
      } else {
        this.mapGrid.getChildByName("ball_1_" + i).getChildByName("Particle").active = false;
      }

      if (blue_uidata.first.ballIdx == i) {
        this.mapGrid.getChildByName("ball_2_" + i).getChildByName("Particle").active = true;
      } else {
        this.mapGrid.getChildByName("ball_2_" + i).getChildByName("Particle").active = false;
      }
    }
    this.leftUiCameraPreview();
  }

  //获取游戏阶段并投票
  gameStepVote(inputValue: string) {
    // console.log(inputValue);
    let stepIdx = this.gameProcess.stepIdx;
    if (stepIdx - 1 == 1) {
      //判断 - 是否在字符串中
      if (inputValue.indexOf("-") == -1) {
        return;
      } else {
        let str_arr = inputValue.split("-");
        let team = str_arr[0];
        let ballName = parseInt(str_arr[1]);
        //判断team ballName是否为字符串与数字
        if (isNaN(Number(ballName))) {
          console.log("ballName不是数字");
          return;
        }
        //判断team是否为red blue
        if (team != "红色" && team != "蓝色") {
          console.log("team不是红色或蓝色");
          return;
        }
        //如果是 红色 改为 red 如果是蓝色 改为 blue
        if (team == "红色") {
          team = "red";
        }
        if (team == "蓝色") {
          team = "blue";
        }
        //判断ballName是否在1-5之间 在则 -1变为index
        if (ballName < 1 || ballName > 5) {
          console.log("ballName不在1-5之间");
          return;
        } else {
          ballName -= 1;
        }
        this.voteBall.voteBall(team, ballName);
      }
      this.selectBall_uiBinding();
    }
    if (stepIdx - 1 == 2) {
      //判断 - 是否在字符串中
      //红色-a6-80
      //蓝色-a6-80
      if (inputValue.indexOf("-") == -1) {
        return;
      } else {
        let str_arr = inputValue.split("-");
        let team = str_arr[0];
        let gridPos = this.splitGridPos(str_arr[1]);
        let power = parseInt(str_arr[2]);
        //判断team是否为red blue
        if (team != "红色" && team != "蓝色") {
          console.log("team不是红色或蓝色");
          return;
        }
        //如果是 红色 改为 red 如果是蓝色 改为 blue
        if (team == "红色") {
          team = "red";
        }
        if (team == "蓝色") {
          team = "blue";
        }
        //判断gridPos x y是否为数字
        if (isNaN(Number(gridPos.x)) || isNaN(Number(gridPos.y))) {
          console.log("gridPos不是数字");
          return;
        } else {
          //判断gridPos x是否在0-5之间 y是否在0-7之间
          if (gridPos.x < 0 || gridPos.x > 5 || gridPos.y < 0 || gridPos.y > 7) {
            console.log("gridPos不在0-5之间或0-7之间");
            return;
          }
        }

        //判断power是否为数字
        if (isNaN(Number(power))) {
          console.log("power不是数字");
          return;
        } else {
          //判断power是否在1-100之间
          if (power < 1 || power > 100) {
            console.log("power不在1-100之间");
            return;
          }
        }
        this.voteCatapult.voteCatapult(team, gridPos, power);
      }
      this.catapultStepUIBinding();
    }
  }

  //拆分a1 a2等 为x y
  splitGridPos(gridPos: string) {
    let x: number | string = gridPos.split("")[0];
    let y = parseInt(gridPos.split("")[1]);
    x = this.letterToNumber(x);
    return { x: x, y: y };
  }

  //绘制球员编号2D
  drawBallNumber2D = (pos: any, scole: any, somedata: any) => {
    let isnotName = this.checkBallNumber(somedata);
    if (isnotName == -1) {
      let new_node = instantiate(this.ballName);
      new_node.name = somedata;
      new_node.active = true;
      new_node.setPosition(pos.x, pos.y, pos.z);
      let label_str = somedata.split("_")[2];
      new_node.getChildByName("Label").getComponent(Label).string = parseInt(label_str) + 1 + "";

      let teamNum = parseInt(somedata.split("_")[1]);
      let memberNum = parseInt(somedata.split("_")[2]);

      let playerList = this.gameInit.getComponent(gameInit).playerPool.PlayerList;
      let tagetPlayer = playerList.filter((item: any) => {
        if (item.team == teamNum && item.member == memberNum-1) {
          new_node.getChildByName("Label-player").getComponent(Label).string = item.name;
        }
      })
      // console.log(tagetPlayer)
      new_node.getChildByName("Label-player").getComponent(Label).string =tagetPlayer.length>0?tagetPlayer[0].uname:"空缺";
      new_node.getChildByName("Label-player-bg").getComponent(Label).string =tagetPlayer.length>0?tagetPlayer[0].uname:"空缺";
      this.ballsName.addChild(new_node);
      this.ballNameList.push(new_node);
    } else {
      this.ballNameList[isnotName].setPosition(pos.x, pos.y, pos.z);
    }
  };
  //清空球员编号Label
  clearBallNumber2D = () => {
    for (let i = 0; i < this.ballNameList.length; i++) {
      this.ballNameList[i].destroy();
    }
    this.ballNameList = [];
  };

  getBallNameNode = (teamNum:number,memberNum:number) => {
    console.log(teamNum,memberNum)
    let res = this.ballNameList.filter((item, index) => {
      if (item.name == "ball_" + teamNum + "_" + memberNum) {
        return item;
      }
    })

    return res
  }

  //绘制地图坐标砖块编号
  drawMapGridNumber2D = (pos: any, scole: any, somedata: any) => {
    // console.log(pos, scole, somedata);
    let grid_str_arr = somedata.split("_");
    let grid_x = parseInt(grid_str_arr[1]);
    let grid_y = parseInt(grid_str_arr[2]);
    //grid_x为1-5变成a-e
    let grid_x_str = this.numberToLetter(grid_x);
    if (grid_y == 0) {
      // console.log(grid_x_str);
      let new_node = instantiate(this.gridName);
      new_node.name = grid_x_str;
      new_node.active = true;
      new_node.setPosition(pos.x, pos.y + 60, pos.z);
      new_node.getChildByName("Label").getComponent(Label).string = grid_x_str;
      this.gridsName.addChild(new_node);
    }
    if (grid_x == 5) {
      let new_node = instantiate(this.gridName);
      new_node.name = grid_y + "";
      new_node.active = true;
      new_node.setPosition(pos.x + 60, pos.y, pos.z);
      new_node.getChildByName("Label").getComponent(Label).string = grid_y + "";
      this.gridsName.addChild(new_node);
    }
  };
  numberToLetter(num: number) {
    let letter = "";
    switch (num) {
      case 0:
        letter = "a";
        break;
      case 1:
        letter = "b";
        break;
      case 2:
        letter = "c";
        break;
      case 3:
        letter = "d";
        break;
      case 4:
        letter = "e";
        break;
      case 5:
        letter = "f";
        break;
    }
    return letter;
  }
  letterToNumber(letter: string) {
    let num = -1;
    switch (letter) {
      case "a":
        num = 0;
        break;
      case "b":
        num = 1;
        break;
      case "c":
        num = 2;
        break;
      case "d":
        num = 3;
        break;
      case "e":
        num = 4;
        break;
      case "f":
        num = 5;
        break;
    }
    return num;
  }

  //检查球员编号是否存在
  checkBallNumber = (somedata: any) => {
    let idx = -1;
    this.ballNameList.forEach((item, index) => {
      if (item.name == somedata) {
        idx = index;
      }
    });
    return idx;
  };

  update(deltaTime: number) {}
}
