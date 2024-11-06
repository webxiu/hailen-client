import * as path from "node:path";

import {
  BrowserWindow,
  Menu,
  Tray,
  app,
  globalShortcut,
  ipcMain,
  nativeImage,
  protocol,
  shell,
} from "electron";

function resolve(dir: string) {
  return path.resolve(process.cwd(), dir);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      // preload: "./preload/index.js",
      preload: "E:/project/electron/hailen-client/dist/preload/index.js",
    },
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
    {
      label: "设置app",
      click: function () {}, //打开相应页面
    },
    {
      label: "意见反馈app",
      click: function () {},
    },
    {
      label: "帮助app",
      click: function () {},
    },
    {
      label: "关于app",
      click: function () {},
    },
    {
      label: "退出app",
      click: function () {
        //ipc.send('close-main-window');
        app.quit();
      },
    },
  ];
  console.log("__dirname:", __dirname);
  console.log("process.cwd()", process.cwd());
  //系统托盘图标目录
  const trayIcon = path.resolve(
    __dirname,
    "../public/favicon/ico",
    "favicon@4x.ico"
  );

  //图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  //创建系统托盘图标
  const appTray = new Tray(trayIcon);

  //设置此托盘图标的悬停提示内容
  appTray.setToolTip("海阔天空");

  //设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  //单点击 1.主窗口显示隐藏切换 2.清除闪烁
  appTray.on("click", function () {
    mainWindow.show();
  });

  if (process.env.NODE_ENV === "development") {
    // 加载 URL 并在加载完成后显示窗口
    mainWindow.loadURL("http://localhost:8500/").then(() => {
      mainWindow.show(); // 在加载完成后显示窗口
    });
  } else {
    const pathVue = path.resolve(__dirname, "../../../dist-vue/index.html");
    const pathReact = path.resolve(__dirname, "../../../dist-react/index.html");
    // const pathVue2 = path.resolve(app.getAppPath(),"../../dist-vue/index.html");
    mainWindow.loadFile(pathVue);
  }

  //===========自定义file:///协议的解析=======================
  protocol.interceptFileProtocol("file", (req, callback) => {
    const url = req.url.substr(8);
    callback(decodeURI(url));
  });

  mainWindow.on("closed", () => {
    console.log("Window closed");
  });

  mainWindow.webContents.openDevTools(); // 打开开发者工具
}

app.whenReady().then(() => {
  ipcMain.on("ping", () => console.log("pong"));
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
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
