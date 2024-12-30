import { Context } from "koa";
import WebSocket from "ws";
import { responseStatus } from "../../config/index";

type MessageType = "connect" | "close" | "message" | "pong";
interface WSMessageType {
  message: MessageType;
  deviceId: string;
  data: any;
}

const clients = new Map();
let socketServe: WebSocket;

/** 发送给指定设备 */
function sendMessageToDevice(params: WSMessageType) {
  const client = clients.get(params.deviceId);
  console.log("发送消息:", params);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(params));
  } else {
    console.log("设备离线");
  }
}

export const startServer = async (ctx: Context) => {
  const wss = new WebSocket.Server({ port: 8080 });
  wss.on("connection", function connection(ws, req: any) {
    socketServe = ws;
    const urlObj = new URL(req.url, `http://${req.headers.host}`);
    const deviceId = urlObj.searchParams.get("device");
    console.log("成功连接客户:", deviceId);
    if (deviceId) {
      clients.set(deviceId, ws);
      let index = 1;
      sendMessageToDevice({ message: "connect", deviceId, data: index++ });
    }

    ws.on("message", function incoming(data: any) {
      const msgInfo = JSON.parse(data);
      console.log("收到消息:", msgInfo.message, msgInfo);
      if (msgInfo.message === "ping") {
        sendMessageToDevice({ message: "pong", deviceId, data: null });
      } else if (msgInfo.message === "message") {
        sendMessageToDevice({ message: "message", deviceId, data: msgInfo.data });
      }
    });
    ws.on("close", () => {
      socketServe = null;
      console.log("客户端断开连接");
      clients.delete(deviceId);
      sendMessageToDevice({ message: "close", deviceId, data: "客户端断开连接" });
    });
  });

  // 获取服务器地址
  const url = `ws://${ctx.hostname}:${wss.options.port}`;
  console.log(`WS服务启动在: ${url}`);
  ctx.body = responseStatus(200, url);
};

// 关闭服务
export const closeServer = async (ctx: Context) => {
  const { deviceId } = ctx.request.body as any;
  console.log("关闭设备ID:", deviceId);
  if (deviceId) {
    if (socketServe) {
      socketServe.close();
      clients.delete(deviceId);
      ctx.body = responseStatus(200, "WS服务器关闭");
    } else {
      ctx.body = responseStatus(400, "WS服务器未启动");
    }
  } else {
    ctx.body = responseStatus(400, "未接收到设备ID");
  }
};
