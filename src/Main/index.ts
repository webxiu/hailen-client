import {
  BrowserWindow,
  Menu,
  Tray,
  app,
  globalShortcut,
  ipcMain,
  nativeImage,
  shell,
} from "electron";

// import { resolve } from "node:path";

// function createWindow() {
//   const mainWindow = new BrowserWindow({
//     width: 900,
//     height: 670,
//     show: false,
//     autoHideMenuBar: true,
//     // icon: nativeImage.createFromPath(
//     //   resolve(__dirname, "public/assets/favicon/favicon.png")
//     // ),
//     webPreferences: {
//       nodeIntegration: true,
//       // preload: resolve(__dirname, "./preload/index.js"),
//       sandbox: false,
//     },
//   });

//   // 打开调试工具
//   mainWindow.webContents.openDevTools();

//   // 注册热键
//   globalShortcut.register("CommandOrControl+R", () => {
//     mainWindow.reload();
//   });

//   // 创建系统托盘
//   // const tray = new Tray(resolve(__dirname, "../assets/tray-icon.png"));
//   // const contextMenu = Menu.buildFromTemplate([
//   //   { label: "退出", click: () => app.quit() },
//   // ]);
//   // tray.setToolTip("我的应用");
//   // tray.setContextMenu(contextMenu);

//   mainWindow.on("ready-to-show", () => {
//     mainWindow.show();
//   });

//   mainWindow.webContents.setWindowOpenHandler((details) => {
//     shell.openExternal(details.url);
//     return { action: "deny" };
//   });
//   mainWindow.loadURL("http://localhost:5500/");
//   console.log("process.env", process.env);
//   // if (
//   //   process.env.ELECTRON_RENDERER_URL === "development" &&
//   //   process.env["ELECTRON_RENDERER_URL"]
//   // ) {
//   //   mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
//   // } else {
//   //   mainWindow.loadFile(resolve(__dirname, "../renderer/index.html"));
//   // }
// }

// app.whenReady().then(() => {
//   app.on("browser-window-created", (_, window) => {
//     console.log(window);
//   });

//   ipcMain.on("ping", () => console.log("pong"));
//   createWindow();

//   app.on("activate", function () {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow();
//   });
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

// // 监听应用退出事件
// app.on("before-quit", () => {
//   globalShortcut.unregisterAll(); // 注销所有热键
// });

function createWindow() {
  console.log("Creating window...");
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      sandbox: false,
    },
  });

  // 加载 URL 并在加载完成后显示窗口
  mainWindow.loadURL("https://www.baidu.com").then(() => {
    mainWindow.show(); // 在加载完成后显示窗口
  });

  mainWindow.on("closed", () => {
    console.log("Window closed");
  });

  mainWindow.webContents.openDevTools(); // 打开开发者工具
}

app.whenReady().then(() => {
  console.log("App is ready");
  createWindow();
});
