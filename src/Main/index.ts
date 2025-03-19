import { BrowserWindow, app } from "electron";

import MountGlobal from "./client";

// import _WorkPath from "./Global/_WorkPath";

const child_process = require("child_process");
const path = require("path");

/**
 *
 * @单例锁
 * @Boolean true  []
 * @Boolean false [可以假设应用程序的另一个实例已经在]
 */
const gotTheLock = app.requestSingleInstanceLock();

const wakeOrCreate = () => {
  MountGlobal();
  /**
   * 当运行第二个实例时,将会聚焦到 {browserWindow} 这个窗口
   * 唤醒已启动的单例 {browserWindow}
   */
  app.on("second-instance", () => {
    // const browserWindow: BrowserWindow | null = Reflect.get(global, "CreateBrowserWindow") || null;
    // if (!browserWindow) return;
    // if (browserWindow.isMinimized()) browserWindow.restore();
    // browserWindow.focus();
  });
  app.on("ready", function () {
    // require("./DataBase/index");
    // require("./Application");
    console.log("app.getLocale==>:", app.getLocale());
  });
  // const voiceFiles = _WorkPath("voiceFiles");
  // const localDBPath = _WorkPath("db");

  // const testapp = child_process.spawn(path.join(rootPath, 'server/testapp.exe'), [
  //   '-addr',
  //   ':5002',
  //   '-db-path',
  //   path.join(localDBPath, './local.db'),
  //   '-file-path',
  //   voiceFiles,
  //   '-export-path',
  //   exportPath,
  //   '-log-path',
  //   path.join(localDBPath, './logs')
  // ]);

  // /** 启动算法服务 */
  // const guoyinlijian = child_process.spawn(
  //   path.join(dirName, 'guoyinlijian.exe'),
  //   [':5002', path.join(localDBPath, './local.db'), voiceFiles, path.join(localDBPath, './logs'), startLanguage[langStr]],
  //   { cwd: path.join(dirName) }
  // );

  // guoyinlijian.stdout.on('data', (data) => {
  //   console.log('guoyinlijian data:', data.toString());
  // });

  // guoyinlijian.on('close', (code) => {
  //   console.error('guoyinlijian log:', '服务关闭');
  //   guoyinlijian.kill('SIGTERM');
  // });
};

gotTheLock ? wakeOrCreate() : app.quit();
