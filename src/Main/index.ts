import "colors";

import * as path from "node:path";

import { BrowserWindow, Menu, Tray, app, globalShortcut, ipcMain, nativeImage, protocol, screen, shell } from "electron";

/**
 *
 * @单例锁
 * @Boolean true  []
 * @Boolean false [可以假设应用程序的另一个实例已经在]
 */
const gotTheLock = app.requestSingleInstanceLock();

/**
 * @Message 初始化项目配置
 * @Msg 基于 require 同步导入，可控制导入顺序
 */

Reflect.set(global, "$$", {});

function MountGlobal() {
  /** $$.AppInfo 且 初始化公共函数 */
  // require("./AppInfo");

  /** $$.log 且 初始化 日志存储文件目录 */
  // require("./Log");

  /** $$.Settings 且 初始化 setting.json */
  // require("./Setting");

  /** $$.Event */
  // require("./Event");

  /** 绑定热键 */
  // require("./CreateGlobalShortcut");

  /** 订阅窗口创建 */
  require("./window");

  /** other */
  // require("./AppGuard");

  /** HotUpdater */
  // require("./AutoUpdate");

  /** EventHandle */
  // require("./EventHandle");
}

gotTheLock ? MountGlobal() : app.quit();
