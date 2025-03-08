import { BrowserWindow, app, globalShortcut } from "electron";

// 注册系统快捷键

const GlobalHotKey = [
  { key: "CmdOrCtrl+F12", active: () => BrowserWindow.getFocusedWindow()?.webContents.openDevTools() },
  { key: "CmdOrCtrl+Shift+I", active: () => BrowserWindow.getFocusedWindow()?.webContents.toggleDevTools() },
  { key: "CmdOrCtrl+R", active: () => BrowserWindow.getFocusedWindow()?.reload() },
  { key: "CmdOrCtrl+W", active: () => BrowserWindow.getFocusedWindow()?.close() },
  {
    key: "CmdOrCtrl+M",
    active: () => {
      BrowserWindow.getFocusedWindow()?.hide();
      BrowserWindow.getFocusedWindow()?.setSkipTaskbar(true);
    }
  },
  {
    key: "CmdOrCtrl+Shift+Delete",
    active: () => {
      //强制清除缓存
      const win = BrowserWindow.getFocusedWindow();
      win.webContents.session.clearStorageData();
      win.webContents.session.clearCache();
      win.webContents.session.clearHostResolverCache();
      win.webContents.session.clearAuthCache();
      win.reload();
    }
  }
];

export const registerGlobalHotKey = () => {
  for (const hotKey of GlobalHotKey) {
    globalShortcut.register(hotKey.key, hotKey.active);
  }
};

export const unregisterGlobalHotKey = () => {
  globalShortcut.unregisterAll();
};

app.on("ready", () => {
  // 注册所有热键
  registerGlobalHotKey();
});

// 监听应用退出事件(可拦截退出操作并确保在所有准备工作完成后应用才退出)
app.on("before-quit", () => {
  // 注销所有热键
  unregisterGlobalHotKey();
});
