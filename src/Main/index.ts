import { BrowserWindow, app } from "electron";

import path from "path";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: true,
      // preload: path.join(process.cwd(), "dist/preload.cjs"), // 如果需要预加载脚本
    },
  });

  console.log("======NODE_ENV", process.env.NODE_ENV);
  console.log("======process.cwd", process.cwd());

  // 在开发环境中使用 Vite 的开发服务器
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // 在生产环境中加载构建后的文件
    mainWindow.loadFile(path.join(process.cwd(), "./dist/index.html"));
  }

  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
