import { ballItemMatMnger } from "../ballItemMatMnger";
import { canvas } from "../canvas";
import dwebXhr from "../http/dwebXhr";
import { DM_Info } from "../websocket/dmDataStruct";
import { _decorator, Node, RigidBody, tween, Vec3 } from "cc";

export class PlayerPool {
  PlayerList: PlayerInfo[] = [];
  mapGrid: Node = null;
  hostUrl: string = "https://blive-deskft.dweb.club";


  moveBallVoteList: {
    uid: number,
    ballName: string,
    rotDeg: number,
    power: number
  }[] = []


  playerMoveBallVote(movemsg: { uid: number, msg: string }, canvas2D: Node) {
    let canvas2DScript = canvas2D.getComponent(canvas);
    if (movemsg.msg.indexOf(" ") == -1) {
      return
    } else {
      let inputValue = movemsg.msg;
      let str_arr = inputValue.split(" ");
      let rot_deg = parseInt(str_arr[0])
      let power = parseInt(str_arr[1]);
      //判断gridPos x y是否为数字
      if (isNaN(Number(rot_deg)) || isNaN(Number(power))) {
        console.log("入场玩家参数输入类型不符合：int int");
        return;
      } else {
        //判断rot_deg 角度0-360 如果大于360则取余
        if (rot_deg > 360) {
          rot_deg = rot_deg % 360;
        }else if(rot_deg<0){
          rot_deg = rot_deg % 360+360;
        }

        //判断power是否在1-100之间
        if (power < 1 || power > 100) {
          console.log("power不在1-100之间");
          return;
        }
      }

      //判断当前用户是否在列表中
      let player = this.PlayerList.filter((item) => {
        return item.uid == movemsg.uid;
      })
      console.log("=====player=====")
      console.log(player)

      //判断当前用户的票是否已经投完
      let voted = this.moveBallVoteList.filter((item) => {
        if (item.uid == movemsg.uid) {
          return item;
        }
      })

      console.log(voted)

      if (voted.length>0) {
        voted[0].ballName = `ball_${player[0].team}_${player[0].memberNum - 1}`;
        voted[0].rotDeg = rot_deg;
        voted[0].power = power;
      } else {
        this.moveBallVoteList.push({
          uid: movemsg.uid,
          ballName: `ball_${player[0].team}_${player[0].memberNum - 1}`,
          rotDeg: rot_deg,
          power: power
        })
      }

      console.log(this.moveBallVoteList)
      this.playerBallRotate(player[0].team, player[0].memberNum - 1, rot_deg)
    }
  }

  playerBallRotate(teamNum: number, memberNum: number, rotDeg:number) {

    let ballName = `ball_${teamNum}_${memberNum}`
    let ball_cameraNode = this.mapGrid.getChildByName(ballName);
    ball_cameraNode.setRotationFromEuler(0, 0, 0);
    ball_cameraNode.getComponent(RigidBody).type = 2;
    let tartgetVec3 = {
      x: ball_cameraNode.eulerAngles.x,
      y: ball_cameraNode.eulerAngles.y,
      z: ball_cameraNode.eulerAngles.z,
    };
    tween(tartgetVec3).to(
        1,
        { x: 0, y: ball_cameraNode.eulerAngles.y+rotDeg, z: 0 },
        {
          onComplete: (target: Vec3) => {
            ball_cameraNode.getComponent(RigidBody).type = 1;
          },
          onUpdate: (target: Vec3) => {
            ball_cameraNode.setRotationFromEuler(new Vec3(target.x, target.y, target.z));
          },
        }
      ).start();
  }

  addPlayer(data: DM_Info) {
    //比对当前用户是否已经在列表中
    for (let i = 0; i < this.PlayerList.length; i++) {
      if (this.PlayerList[i].uid == data.uid) {
        return;
      }
    }
    let team1Num = 0;
    let team2Num = 0;
    for (let i = 0; i < this.PlayerList.length; i++) {
      if (this.PlayerList[i].team == 1) {
        team1Num++;
      } else {
        team2Num++;
      }
    }

    let targetTeam: 1 | 2 = team1Num > team2Num ? 2 : 1;
    let targetMemberNum: 1 | 2 | 3 | 4 | 5 = 1;

    let targetTeamPlayerList = this.PlayerList.filter((item) => {
      return item.team == targetTeam;
    });

    //查找空缺位置 如果没有空缺位置则结束
    if (targetTeamPlayerList.length >= 5) {
      return;
    }
    for (let i = 0; i < 5; i++) {
      let isExist = false;
      for (let j = 0; j < targetTeamPlayerList.length; j++) {
        if (targetTeamPlayerList[j].memberNum == i + 1) {
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        targetMemberNum = i + 1;
        break;
      }
    }

    let player: PlayerInfo = {
      uid: data.uid,
      uname: data.uname,
      uface: data.uface,
      team: targetTeam,
      memberNum: targetMemberNum,
    }
    console.log(player)
    this.PlayerList.push(player);

    dwebXhr.sendAjax(this.hostUrl + "/get-img/?imgSrc=" + player.uface, "GET", (data: any) => {
      console.log("get-img success")
      console.log(data)
      let imgSrc = data.imgSrc
      player.uface = this.hostUrl + imgSrc
      this.ballAvatarInit(player);
    })
    // this.ballAvatarInit(player);
  }

  ballAvatarInit(player: PlayerInfo) {
    let ballNode = this.mapGrid.getChildByName("ball_" + player.team + "_" + (player.memberNum - 1));
    console.log(ballNode)
    ballNode.getComponent(ballItemMatMnger).setAvatarMat(player);
  }

  getPlayerInfo(team: 1 | 2, memberNum: 1 | 2 | 3 | 4 | 5 | number): PlayerInfo[] {
    let targetPlayer: PlayerInfo[] = this.PlayerList.filter((item) => {
      if (item.team == team && item.memberNum == memberNum) {
        return item;
      }
    })
    return targetPlayer;
  }

}

export interface PlayerInfo {
  uid: number;
  uname: string;
  uface: string;
  team: 1 | 2,
  memberNum: 1 | 2 | 3 | 4 | 5 | number
}