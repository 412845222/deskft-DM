


const sqlite3 = require("sqlite3").verbose();
const { ipcMain } = require("electron");
const fs = require("fs");

class MyDB {
  db = new sqlite3.Database("mydb");

  constructor() {
    this.init();
    ipcMain.on("sql",this.msgToDB)
  }

  msgToDB=(event,msg)=>{
    if (msg.event == "insert") {
      this.insert(event,msg.data)
    }
    if (msg.event=="query") {
      this.query(event,msg.data)
    }
    if (msg.event=="delete") {
      this.delete(event,msg.data)
    }
    if(msg.event=="open-file"){
      this.openFile(event,msg.data)
    }
  }

  openFile(event,data){
    let file_path = data.path
    console.log(file_path)
    let file_data = fs.readFileSync(file_path)
    event.reply("open-file",file_data)
  }

  delete(event,data){
    console.log("------msg delete sql----")
    console.log(data)
    let str = "DELETE FROM PLAYLIST WHERE id=?"
    this.db.run(str,[data.id],(res,err)=>{
      if (err) {
        console.log(err);
        return;
      }
      console.log(res);
      event.reply("delete",res)
    })
  }

  query(event,data){
    if (data.method=="all") {
      console.log("------msg query sql----")
      let str = "SELECT * FROM PLAYLIST";
      this.db.all(str, (err, res) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(res);
        event.reply("query-all",res)
      })
    }
  }

  insert(event,data){
    console.log("------msg insert sql----")
    console.log(data)
    let str = "INSERT INTO PLAYLIST (path,name) VALUES (?,?)";
    this.db.run(str, [data.path, data.name], (res, err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(res);
      this.query(event,{method:"all"})
    });
  }

  init() {
    let str = "CREATE TABLE PLAYLIST (" + "path TEXT," + "name TEXT," + "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT" + ");";

    this.db.run(str, (res, err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(res);
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = {
  MyDB: MyDB,
};
