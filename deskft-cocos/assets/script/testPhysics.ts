import { _decorator, Component, Node, RigidBody, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('testPhysics')
export class testPhysics extends Component {

    @property({ type: Node })
    testBall:Node = null;

    @property({ type: Node })
    mapGrid:Node = null;

    start() {

    }

    testPushBall(){
      console.log('testPushBall')
      this.testBall.getComponent(RigidBody).applyLocalImpulse(new Vec3(0, 0, -10), new Vec3(0, 0, 0))
    }

    testTotate(){
      console.log('testTotate')
      let targetMap = this.mapGrid.getChildByName('grid_5_5')

      //旋转自身朝向targetMap的坐标
      let ballnode = this.testBall.getChildByName('ball')
      ballnode.lookAt(targetMap.position)
      let y = ballnode.eulerAngles.y
      // this.testBall.setRotation(angle)
      this.testBall.getComponent(RigidBody).type = 2
      let tartgetVec3 = {
        x:this.testBall.eulerAngles.x,
        y:this.testBall.eulerAngles.y,
        z:this.testBall.eulerAngles.z
      }
      tween(tartgetVec3).to(1, {x:0,y:ballnode.eulerAngles.y,z:0},{onComplete:(target:Vec3)=> {
        this.testBall.getComponent(RigidBody).type = 1
        ballnode.setRotationFromEuler(0,0,0)
      },onUpdate:(target:Vec3)=>{
        console.log(target)
        this.testBall.setRotationFromEuler(new Vec3(target.x,target.y,target.z))
      }}).start()
    }

    update(deltaTime: number) {
        
    }
}

