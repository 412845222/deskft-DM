import { _decorator, Camera, Node, RigidBody, tween, Vec3 } from "cc";
import { canvas } from "../canvas";


export class CameraMnger {

  GameCamera:Node = null;
  PreviewCamera:Node = null;
  canvas2D:Node = null;

  constructor(option:{
    canvas2D:Node,
    GameCamera:Node,
    PreviewCamera:Node,
  }) {
    this.canvas2D = option.canvas2D;
    this.GameCamera = option.GameCamera;
    this.PreviewCamera = option.PreviewCamera;
    this.setFirstCamera('preview');
  }

  setFirstCamera(type:"preview"|"game"){
    if(type == 'preview'){
      this.canvas2D.getComponent(canvas).ballsName.active = false;
      this.GameCamera.getComponent(Camera).priority = 0;
      this.PreviewCamera.getComponent(Camera).priority = 1;
    }else{
      this.canvas2D.getComponent(canvas).ballsName.active = true;
      this.GameCamera.getComponent(Camera).priority = 1;
      this.PreviewCamera.getComponent(Camera).priority = 0;
    }
  }
}