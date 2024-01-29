interface DM_Info {
  room_id:number,//弹幕接收的直播间
  uid:number,//用户UID
  uname:string,//用户昵称
  msg:string,//弹幕内容
  msg_id:string,//消息唯一id
  fans_medal_level:number,//对应房间勋章信息
  fans_medal_name:string,//对应房间勋章信息
  fans_medal_wearing_status: boolean,//该房间粉丝勋章佩戴情况
  guard_level:number,//对应房间大航海 1总督 2提督 3舰长
  timestamp:number,//弹幕发送时间秒级时间戳
  uface:string//用户头像   
  emoji_img_url: string, //表情包图片地址
  dm_type: number,//弹幕类型 0：普通弹幕 1：表情包弹幕
}


export type {
  DM_Info
}