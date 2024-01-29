import DanmakuWebSocket from "./danmaku-websocket.min.js"

let ws: DanmakuWebSocket

/**
 * 创建socket长连接
 * @param authBody
 * @param wssLinks
 */
function createSocket(authBody: string, wssLinks: string[],onMessageCallBack:Function) {
    const opt = {
        ...getWebSocketConfig(authBody, wssLinks),
        // 收到消息,
        onReceivedMessage: onMessageCallBack,
        // 收到心跳处理回调
        onHeartBeatReply: (data) => {
          console.log("收到心跳处理回调:", data)
        },
        onError: (data) => console.log("error", data),
        onListConnectError: () => {
            console.log("list connect error")
            destroySocket()
        },
    }

    if (!ws) {
        ws = new DanmakuWebSocket(opt)
    }

    return ws
}

/**
 * 获取websocket配置信息
 * @param authBody
 * @param wssLinks
 */
function getWebSocketConfig(authBody: string, wssLinks: string[]) {
    const url = wssLinks[0]
    const urlList = wssLinks
    const auth_body = JSON.parse(authBody)
    return {
        url,
        urlList,
        customAuthParam: [
            {
                key: "key",
                value: auth_body.key,
                type: "string",
            },
            {
                key: "group",
                value: auth_body.group,
                type: "string",
            },
        ],
        rid: auth_body.roomid,
        protover: auth_body.protoover,
        uid: auth_body.uid,
    }
}

/**
 * 销毁websocket
 */
function destroySocket() {
    console.log("destroy1")
    ws && ws.destroy()
    ws = undefined
    console.log("destroy2")
}

/**
 * 获取websocket实例
 */
function getWsClient() {
    return ws
}

export { createSocket, destroySocket, getWebSocketConfig, getWsClient }
