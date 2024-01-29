const { ipcMain } = require("electron");

class BLiveRoom {
  room_id = ""
  code = ""

  constructor(option) {
    ipcMain.on("BLiveRoom",this.msgToBLiveRoom)
  }

  msgToBLiveRoom = (event,msg)=>{
    if (msg.event == 'bliveroom') {
      event.reply('bliveroom', {
        room_id:this.room_id,
        code:this.code
      })
    }
  }
}

module.exports = {
  BLiveRoom: BLiveRoom,
};