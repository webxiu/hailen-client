import * as path from "node:path";

import { BrowserWindow, Menu, Tray, app, ipcMain, nativeImage, protocol, screen } from "electron";

import { exec } from "child_process";

interface WindowProp {
  mode: "vue" | "react";
  options?: Electron.BrowserWindowConstructorOptions;
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
  const sysConfig = $$.startup;
  console.log("========$$====>:", {
    isPro: $$.isPro(),
    env: $$.env,
    NODE_ENV: $$.NODE_ENV,
    appInfo: $$.appInfo,
    startup: $$.startup
  });
  const { windowWidth, windowHeight, x, y, minWidth, minHeight } = windowSize();
  const mainWindow = new BrowserWindow({
    x: x,
    y: y,
    width: windowWidth,
    height: windowHeight,
    minWidth: minWidth,
    minHeight: minHeight,
    autoHideMenuBar: true,
    icon: nativeImage.createFromPath(sysConfig.faviconPath),
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
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  const appTray = new Tray(sysConfig.trayIconPath);
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

  $$.clog("主进程process.cwd():", process.cwd());
  $$.clog("主进程__dirname:", __dirname);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(sysConfig[mode]).then(() => mainWindow.show());
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(sysConfig[mode]);
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
    console.log("======light====>", level);
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
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
