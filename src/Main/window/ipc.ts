// src/main/ipc/user.ts

// import { User, UserModel } from "../server/database";

import { ipcMain } from "electron";

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
}
