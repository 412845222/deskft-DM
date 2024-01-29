export default {
  hostUrl: "https://blive-deskft.dweb.club",
  sendAjax(url: string, method: string, callback: Function, data?: object) {
    console.log("----开始请求----");
    let xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    if (data) {
      let params = this.serialize(data);

      //{"username":"","password":""}
      //username=xxx&password=xxx
      xhr.send(params);
    }else{
      xhr.send();
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4 && xhr.status == 200) {
        console.log("----请求成功----:"+xhr.responseText);
        let res = JSON.parse(xhr.responseText);
        callback(res);
      }
    };
  },
  serialize(obj: object) {
    let str = "";
    for (let key in obj) {
      str += key + "=" + obj[key] + "&";
    }
    return str.substring(0, str.length - 1);
  },
};
