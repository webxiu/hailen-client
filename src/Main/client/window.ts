import * as path from "node:path";

import { BrowserWindow, Menu, Tray, app, globalShortcut, ipcMain, nativeImage, protocol, screen, shell } from "electron";

import createServer from "../server/app";
import { exec } from "child_process";
import { getJsonFiles } from "../utils/fs";
import { setupUserIPC } from "./ipc";

interface WindowProp {
  mode: "vue" | "react";
  options?: Electron.BrowserWindowConstructorOptions;
}

const faviconProPath = `/resources/app.asar.unpacked/public/favicon/png/favicon_ch@3x.png`;
const faviconDevPath = `../../public/favicon/png/favicon_ch@3x.png`;

const hostConfig = {
  development: {
    vue: `http://localhost:${$$.env.VITE_VUE_PORT}`,
    react: `http://localhost:${$$.env.VITE_REACT_PORT}`
  },
  production: {
    vue: path.join(__dirname, "../vue/index.html"),
    react: path.join(__dirname, "../react/index.html")
  }
};

function resolve(dir: string) {
  return path.resolve(process.cwd(), dir);
}
export function printl(s1, s2, ...rest) {
  console.log(s1.bgBlue, s2.magenta, ...rest, "\n");
}

function windowSize() {
  // 获取主屏幕
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
  // 计算窗口大小（例如：屏幕的80%）
  const windowWidth = Math.floor(screenWidth * 0.8);
  const windowHeight = Math.floor(screenHeight * 0.8);
  // 计算窗口位置（居中）
  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);
  // 窗口最小尺寸
  const minWidth = Math.floor(screenWidth * 0.3);
  const minHeight = Math.floor(screenHeight * 0.3);
  return { windowWidth, windowHeight, x, y, minWidth, minHeight };
}

function createWindow(param: WindowProp) {
  const { mode, options = {} } = param;
  const { windowWidth, windowHeight, x, y, minWidth, minHeight } = windowSize();
  const faviconPath = path.resolve(process.cwd(), $$.isPro() ? faviconProPath : faviconDevPath);
  const mainWindow = new BrowserWindow({
    x: x,
    y: y,
    width: windowWidth,
    height: windowHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    autoHideMenuBar: true,
    icon: nativeImage.createFromPath(faviconPath),
    webPreferences: {
      webSecurity: false, // 允许加载本地文件
      nodeIntegration: true,
      contextIsolation: true, // 启用上下文隔离
      preload: path.resolve(__dirname, "./preload.js")
    },
    ...options
  });

  // mainWindow.on("ready-to-show", () => {
  //   mainWindow.show();
  // });

  // 拦截新窗口请求
  // mainWindow.webContents.setWindowOpenHandler((details) => {
  //   shell.openExternal(details.url);
  //   // 在这里可以自定义新窗口的行为
  //   console.log("open a new window:", details.url);
  //   // 返回一个对象，指定新窗口的 URL 和其他选项
  //   return { action: "deny" }; // 或者 'allow'，根据需要决定是否允许打开新窗口
  // });

  //系统托盘右键菜单 https://segmentfault.com/q/1010000012390487
  const trayMenuTemplate = [
    { label: "设置app", click: function () {} },
    { label: "意见反馈app", click: function () {} },
    { label: "帮助app", click: function () {} },
    { label: "关于app", click: function () {} },
    {
      label: "退出app",
      click: function () {
        //ipc.send('close-main-window');
        app.quit();
      }
    }
  ];

  //系统托盘图标目录
  let trayIcon = path.resolve(__dirname, "../../public/favicon/png", "favicon_ch@2x.png");
  if (process.platform === "darwin") {
    trayIcon = path.resolve(__dirname, "../../public/favicon/png", "favicon_ch@2x.png");
  }

  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  const appTray = new Tray(trayIcon);
  appTray.setToolTip("海阔天空");
  appTray.setContextMenu(contextMenu);

  // 单点击 1.主窗口显示隐藏切换 2.清除闪烁
  appTray.on("click", function () {
    mainWindow.show();
  });

  //===========自定义file:///协议的解析=======================
  protocol.interceptFileProtocol("file", (req, callback) => {
    const url = req.url.substr(8);
    callback(decodeURI(url));
  });

  printl("主进程trayIcon:", trayIcon);
  printl("主进程process.cwd():", process.cwd());
  printl("主进程__dirname:", __dirname);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(hostConfig.development[mode]).then(() => mainWindow.show());
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(hostConfig.production[mode]);
  }

  mainWindow.on("closed", () => {
    console.log("Window closed");
  });

  return mainWindow;
}

app.whenReady().then(() => {
  let parentWin = createWindow({ mode: "vue", options: {} });
  ipcMain.on("light", (_, value) => {
    console.log("light", value);
  });
  ipcMain.on("react", () => {
    console.log("react");
    // createWindow({ mode: "react", options: { parent: parentWin, modal: true } });
    createWindow({ mode: "react" });
  });
  ipcMain.on("ping", () => {
    console.log("pong");
  });
  ipcMain.on("light", (_, level) => {
    console.log("======light=====>", level);
    // level 是 0-100 的百分比
    exec(`powershell (Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1,${level})`, (error) => {
      if (error) console.error("亮度调节失败:", error);
    });
  });
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      parentWin = createWindow({ mode: "vue", options: {} });
    }
  });
  setupUserIPC();
  createServer({
    platform: process.platform,
    ...$$.env[$$.NODE_ENV],
    NODE_ENV: $$.NODE_ENV
  }).then(() => {
    if(process.env.NODE_ENV === "development"){
      console.log("=============================$$.vuePagePath", $$.AppInfo.vuePagePath);
      const jsonFiles = getJsonFiles($$.AppInfo.vuePagePath, (dir) => dir.endsWith("index.vue"));
      const result = jsonFiles.map((item) => {
        return { path: item.split($$.AppInfo.vuePagePath)[1].replace(/\\/g, "/").replace(".vue", "") };
      });
      console.log("=============================result", result);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
