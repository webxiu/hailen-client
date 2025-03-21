// src/main/ipc/user.ts

// import { User, UserModel } from "../server/database";

import { desktopCapturer, ipcMain } from "electron";

export enum EventName {
  CreateWindow = "createWindow"
}

export function setupUserIPC() {
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
  ipcMain.on("my-global", (event) => {
    const { AppInfo, env, NODE_ENV } = $$;
    event.returnValue = { AppInfo, env, NODE_ENV }; // 只返回可序列化的属性
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
}
