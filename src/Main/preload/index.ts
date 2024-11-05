import { contextBridge, ipcRenderer } from "electron";

// Custom APIs for renderer
const api = {
  send: (channel, data) => {
    // 只允许特定的通道
    const validChannels = ["ping"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  test: () => {
    console.log("Test");
  },
};

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
