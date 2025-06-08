import { contextBridge, ipcRenderer } from "electron";

import type { User } from "../server/database";

// Custom APIs for renderer
const electronAPI = {
  send: (channel: string, data) => {
    // 只允许特定的通道
    const validChannels = ["ping", "test", "react", "user:create", "light"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel: string, func: (event, ...args) => void) => {
    ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
  },
  test: () => {
    console.log("Test=");
  },
  async create(user: Omit<User, "id">): Promise<User> {
    return ipcRenderer.invoke("user:create", user);
  },

  async getAll(): Promise<User[]> {
    return ipcRenderer.invoke("user:getAll");
  },
  getGlobal: async () => {
    return await ipcRenderer.invoke("xxx-call");
  },
  getScreenSources: () => ipcRenderer.invoke("get-screen-sources")
};

console.log("preload:", process.contextIsolated);
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electronAPI", electronAPI);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electronAPI = electronAPI;
}
