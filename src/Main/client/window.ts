import * as path from "node:path";

import { BrowserWindow, Menu, Tray, app, globalShortcut, ipcMain, nativeImage, protocol, screen, shell } from "electron";

import { setupUserIPC } from "./ipc";

interface WindowProp {
  mode: "vue" | "react";
  options?: Electron.BrowserWindowConstructorOptions;
}

const faviconProPath = `/resources/app.asar.unpacked/public/favicon/png/favicon_ch@3x.png`;
const faviconDevPath = `../../public/favicon/png/favicon_ch@3x.png`;

const hostConfig = {
  development: {
    vue: "http://localhost:8500",
    react: "http://localhost:8600"
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

function createWindow(param: WindowProp) {
  const { mode, options = {} } = param;
  // 获取主屏幕
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // 计算窗口大小（例如：屏幕的80%）
  const windowWidth = Math.floor(screenWidth * 0.8);
  const windowHeight = Math.floor(screenHeight * 0.8);

  // 计算窗口位置（居中）
  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = Math.floor((screenHeight - windowHeight) / 2);

  const faviconPath = path.resolve(process.cwd(), process.env.NODE_ENV === "production" ? faviconProPath : faviconDevPath);

  const mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    x: x,
    y: y,
    // 可选：设置最小尺寸
    minWidth: Math.floor(screenWidth * 0.3),
    minHeight: Math.floor(screenHeight * 0.3),
    autoHideMenuBar: true,
    icon: nativeImage.createFromPath(faviconPath),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // 启用上下文隔离
      preload: path.resolve(__dirname, "./preload.js")
    },
    ...options
  });
  // 注册热键
  globalShortcut.register("CommandOrControl+R", () => {
    mainWindow.reload();
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

  //图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  //创建系统托盘图标
  const appTray = new Tray(trayIcon);

  //设置此托盘图标的悬停提示内容
  appTray.setToolTip("海阔天空");

  //设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  // 单点击 1.主窗口显示隐藏切换 2.清除闪烁
  appTray.on("click", function () {
    mainWindow.show();
  });

  printl("主进程trayIcon:", trayIcon);
  printl("主进程process.cwd():", process.cwd());
  printl("主进程__dirname:", __dirname);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(hostConfig.development[mode]).then(() => mainWindow.show());
  } else {
    mainWindow.loadFile(hostConfig.production[mode]);
  }

  mainWindow.on("closed", () => {
    console.log("Window closed");
  });

  mainWindow.webContents.openDevTools();
  return mainWindow;
}

app.whenReady().then(() => {
  let parentWin = createWindow({ mode: "vue", options: {} });
  ipcMain.on("react", () => {
    console.log("react");
    createWindow({ mode: "react", options: { parent: parentWin, modal: true } });
  });
  ipcMain.on("ping", () => {
    console.log("pong");
  });
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      parentWin = createWindow({ mode: "vue", options: {} });
    }
  });
  setupUserIPC();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// 监听应用退出事件
app.on("before-quit", () => {
  globalShortcut.unregisterAll(); // 注销所有热键
});
