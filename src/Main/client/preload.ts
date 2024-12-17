import { contextBridge, ipcRenderer } from "electron";
import envConf from "./config";

import type { User } from "../server/database";
Reflect.set(global, "$$", { ...process.env, ...envConf });
// Custom APIs for renderer
const api = {
  send: (channel: string, data: any) => {
    // 只允许特定的通道
    const validChannels = ["ping", "test", "react", "user:create"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  test: () => {
    console.log("Test");
  },
  async create(user: Omit<User, "id">): Promise<User> {
    return ipcRenderer.invoke("user:create", user);
  },

  async getAll(): Promise<User[]> {
    return ipcRenderer.invoke("user:getAll");
  }
};

console.log("preload:", process.contextIsolated);
console.log("$$:", global.$$);
console.log("process", process.env);
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
