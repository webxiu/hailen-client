// src/main/ipc/user.ts

// import { User, UserModel } from "../server/database";

import { childExec, childSpawn } from "./utils/childProcess";
import { desktopCapturer, ipcMain } from "electron";

import { EventName } from "./utils/eventName";

// const userModel = new UserModel();
// // 创建用户
// ipcMain.handle("user:create", async (_, user: Omit<User, "id">) => {
//   try {
//     return await userModel.create(user);
//   } catch (error) {
//     console.error("创建用户失败:", error);
//     throw error;
//   }
// });
// // 获取所有用户
// ipcMain.handle("user:getAll", async () => {
//   try {
//     return await userModel.findAll();
//   } catch (error) {
//     console.error("获取用户列表失败:", error);
//     throw error;
//   }
// });
// 其他 IPC 处理...
// 处理同步请求
ipcMain.on("xxx-call", (event) => {
  event.returnValue = {};
});

ipcMain.handle("get-screen-sources", async () => {
  try {
    const sources = await desktopCapturer.getSources({ types: ["screen", "window"] });
    return sources;
  } catch (err) {
    console.error("Error getting screen sources:", err);
    throw err;
  }
});

// 执行命令
ipcMain.handle(EventName.WindowCommand, async (event, { command }) => {
  console.log("[command]:", command);
  return new Promise((resolve, reject) => {
  childExec(command)
    .then((result) => {
      console.log("command result:", result);
      resolve(result);
    })
    .catch((error) => {
      console.error("command error:", error);
      reject(error);
    });
  });
});
