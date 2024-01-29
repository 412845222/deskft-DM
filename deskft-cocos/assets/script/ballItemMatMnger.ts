import { _decorator, assetManager, Component, ImageAsset, Label, Material, MeshRenderer, Node, Texture2D } from 'cc';
import { canvas } from './canvas';
import { PlayerInfo } from './DMmessage/PlayerPool';
const { ccclass, property } = _decorator;

@ccclass('ballItemMatMnger')
export class ballItemMatMnger extends Component {

  @property({ type: Node })
  ballMesh: Node = null;
  @property({ type: Node })
  canvas2D: Node = null;
  teamNum: number = 0;
  memberNum: number = 0;

  avatarMat: any = null;

  start() {
    this.teamNum = parseInt(this.name.split('_')[1])
    this.memberNum = parseInt(this.name.split('_')[2])
    let renderable = this.ballMesh.getComponent(MeshRenderer);
    let material = renderable.getRenderMaterial(1);
    let new_material = new Material();
    new_material.copy(material);
    this.avatarMat = new_material;
    // console.log(this.avatarMat)
    this.avatarMat.setProperty('albedoMap', null);
    renderable.setSharedMaterial(this.avatarMat, 1);
  }


  setAvatarMat(playerinfo: PlayerInfo) {
    let imgSrc = playerinfo.uface

    console.log(imgSrc)
    assetManager.loadRemote<ImageAsset>(imgSrc, (err, imageAsset: ImageAsset) => {

      if (err) {
        console.error("loadRemote err")
        console.error(err)
        return
      }
      console.log("loadRemote success")
      console.log(imageAsset)
      let texture = new Texture2D();
      texture.image = imageAsset;
      this.avatarMat.setProperty('albedoMap', texture);
      //设置名字
      let targetBallNameNode = this.canvas2D.getComponent(canvas).getBallNameNode(this.teamNum, this.memberNum)
      console.log(targetBallNameNode)
      if (targetBallNameNode) {
        targetBallNameNode[0].getChildByName("Label-player").getComponent(Label).string = playerinfo.uname
        targetBallNameNode[0].getChildByName("Label-player-bg").getComponent(Label).string = playerinfo.uname
      }
    })
  }

  update(deltaTime: number) {

  }
}


