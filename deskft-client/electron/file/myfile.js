const { ipcMain } = require("electron");
const fs = require("fs");
const path = require('path')

class MyFile {
  constructor() {
    ipcMain.on("file",this.msgToMyFile)
  }


  msgToMyFile=(event,msg)=>{
    if (msg.event=="save-file") {
      let imageData = msg.data
      // 将Base64编码的图片数据写入文件
      const filePath = path.join(__dirname, "savedFile.png");
      const imageDataWithoutPrefix = imageData.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFile(filePath, imageDataWithoutPrefix, "base64", (err) => {
        if (err) {
          console.error("Error saving file:", err);
          // 在这里可以向渲染进程发送保存失败的消息
        } else {
          console.log("File saved successfully:", filePath);
          // 在这里可以向渲染进程发送保存成功的消息
        }
      });
    }
  }
}

module.exports = {
  MyFile: MyFile,
};