// src/main/ipc/user.ts

// import { User, UserModel } from "../server/database";

import { app, desktopCapturer, ipcMain, dialog, shell, webContents } from "electron";
import { childExec, childSpawn, openShell } from "./utils/childProcess";

import { EventName } from "./utils/eventName";
import { runFFmpeg } from "./utils/ffmpeg";
const path = require("path");

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
ipcMain.handle(EventName.WindowCommand, async (event, { command, method, type }) => {
  if (method === "getPath") command = app.getPath(command);
  console.log("[command]:", command);
  return new Promise((resolve, reject) => {
    const cp = {
      shell: openShell
    };
    const exe = cp[type] || childExec;
    exe(command)
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

// 音视频转换
ipcMain.handle("convert", async (_, { input, output, options }) => {
  const args = ["-i", input, ...options, output, "-y"];
  await runFFmpeg(args);
  return args.join(" ");
});

ipcMain.handle("selectDir", async () => {
  const res = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  return res.filePaths[0];
});

ipcMain.handle("openFolder", (_, dir) => {
  shell.openPath(dir);
});

/**
 * 清理某个 webview 页面的 Cookie 或 Storage。
 * 通过 webContentsId 定位到该页面自己的 session，并用 origin 限定清理范围，
 * 因此不会波及其他 AI 页面（同一个 partition 下的其他 origin 不受影响）
 */
ipcMain.handle("webai:clear-site-data", async (_, { webContentsId, scope }: { webContentsId: number; scope: "cookie" | "storage" }) => {
  const target = webContents.fromId(webContentsId);
  if (!target || target.isDestroyed()) return { ok: false, reason: "页面不存在" };

  let origin = "";
  try {
    origin = new URL(target.getURL()).origin;
  } catch {
    return { ok: false, reason: "页面地址无效" };
  }

  const storages = (scope === "cookie"
    ? ["cookies"]
    : ["localstorage", "indexeddb", "websql", "serviceworkers", "cachestorage", "filesystem", "shadercache"]) as Electron.ClearStorageDataOptions["storages"];

  try {
    await target.session.clearStorageData({ origin, storages });
  } catch (err) {
    console.error("[webAI] 清理站点数据失败:", err);
    return { ok: false, reason: "清理失败" };
  }
  // 只刷新这一个页面，让清理结果立即生效
  target.reload();
  return { ok: true, origin };
});
