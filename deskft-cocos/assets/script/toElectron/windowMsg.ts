import { _decorator, Component, Node } from 'cc';
import { toElectron } from './toElectron';

let dosomething:(event:any)=>void
let toElectronNode:Node

function windowAddEvent(toElectron?:Node){
  console.log("------cocos window监听添加message事件")
  toElectronNode = toElectron
  window.addEventListener('message', dosomething=(event:any)=>{
    // console.log(event)
    console.log(event.data)
    changeSomething(event.data)
  }, false);
}

function changeSomething(msg:any){
  console.log("-----message事件 changeSomething"+JSON.stringify(msg))
  //存储主播身份码
  if (msg.event=="bliveroom") {
    console.log(msg.data)
    let bliveRoom:{
      room_id:string,
      code:string,
    } = JSON.parse(msg.data)
    localStorage.setItem("bliveRoom",msg.data)
    let res_msg = {
      event:"code-saved"
    }
    windowPostMsg(res_msg)
  }
  //开始连接
  if (msg.event=="start-conect") {
    toElectronNode.getComponent(toElectron).startConnect()
  }

  // windowRemoveEvent()
}

function windowPostMsg(msg:any){
  window.top.postMessage(msg,"*")
}

function windowRemoveEvent(){
  console.log("----移除msg事件")
  window.removeEventListener("message",dosomething)
}



export {
  windowAddEvent,
  windowPostMsg
}