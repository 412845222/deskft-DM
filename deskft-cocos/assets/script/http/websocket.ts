export default {
  hostUrl:"ws://127.0.0.1:9000/chat/myroom/",
  initWebSocket(url:string,onopen:any,onmessage:any,onerror:any,onclose:any){
    let ws = new WebSocket(url);
    ws.onopen = onopen;
    ws.onmessage = onmessage;
    ws.onerror = onerror;
    ws.onclose = onclose;
    return ws;
  }
}