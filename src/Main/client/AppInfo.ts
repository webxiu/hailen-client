// import Package from "~/package.json";
// import _WorkPath from './_WorkPath';

import { BrowserWindow, Menu, Tray, app, dialog } from "electron";

import path from "path";

const serverConfig = require(path.join(__dirname, "../../scripts/config.js"));

// const Build = {
//   appVersion: Package.version.split("-")[0],
//   /** 开发环境为 undefined， 生产环境为 CI 打包的 {打包号} */
//   build: Package.version.split("-")[1]
// };
function getAppPath() {
  const cwd = process.cwd();
  const appPath = app.getAppPath();
  let rootPath = cwd; // 根目录
  let sourcePath = path.join(cwd, "./source"); // 资源目录
  let buildPath = path.join(cwd, "./"); // 打包构建目录
  if (appPath.includes("app.asar") || appPath.includes("app")) {
    buildPath = path.join(cwd, "resources", "app.asar.unpacked");
  }
  return { appPath, rootPath, sourcePath, buildPath };
}

function getEnv() {
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("npm_")) Reflect.deleteProperty(process.env, key);
  });
  return process.env;
}
const { appPath, rootPath, sourcePath, buildPath } = getAppPath();

/*
# 安装环境
{
    "__dirname": "D:\\hailen\\hailen-client\\resources\\app.asar\\dist\\client",
    "appPath": "D:\\hailen\\hailen-client\\resources\\app.asar",
    "rootPath": "D:\\hailen\\hailen-client",
    "sourcePath": "D:\\hailen\\hailen-client\\source",
    "buildPath": "D:\\hailen\\hailen-client\\resources\\app.asar.unpacked",
    "platform": "win32"
}
# 测试环境
{
    "__dirname": "E:\\project\\electron\\hailen-client\\dist\\client",
    "appPath": "E:\\project\\electron\\hailen-client",
    "rootPath": "E:\\project\\electron\\hailen-client",
    "sourcePath": "E:\\project\\electron\\hailen-client\\source",
    "buildPath": "E:\\project\\electron\\hailen-client\\",
    "platform": "win32"
} 
*/

Reflect.set($$, "AppInfo", {
  __dirname,
  appPath,
  rootPath,
  sourcePath,
  buildPath,
  platform: process.platform,
  vuePagePath: path.join(rootPath, "src", "vue", "views"),
  reactPagePath: path.join(rootPath, "src", "react", "pages")
  // versions: { ...process.versions, ...Build },
  // /** 软件外部存储根目录 */
  // WorkPath: _WorkPath(),
  // /** 日志信息存储目录 */
  // WorkLogPath: _WorkPath('logs'),
  // /** 数据库存储目录 */
  // WorkDBPath: _WorkPath('db'),
  // /** 软件定制化设置信息存储文件地址 */
  // WorkSettingPath: _WorkPath('setting.json', true),
  /** 应用窗口信息 */
  // window: Package.window,
  /** 应用名称 */
  // appName: Package.build.productName,

  /** 程序名称 */
});

Reflect.set($$, "NODE_ENV", app.isPackaged ? "production" : "development");
Reflect.set($$, "env", { ...getEnv(), ...serverConfig });
Reflect.set($$, "isPro", () => app.isPackaged);
Reflect.set($$, "JoinDirWithRoot", (...dir) => path.join(process.cwd(), ...dir));
Reflect.set($$, "isString", (arg) => Reflect.toString.call(arg) === "[object String]");
Reflect.set($$, "isNumber", (arg) => Reflect.toString.call(arg) === "[object Number]");
Reflect.set($$, "isObject", (arg) => Reflect.toString.call(arg) === "[object Object]");
Reflect.set($$, "isUndefined", (arg) => Reflect.toString.call(arg) === "[object Undefined]");
Reflect.set($$, "isNull", (arg) => Reflect.toString.call(arg) === "[object Null]");
Reflect.set($$, "isFunction", (arg) => Reflect.toString.call(arg) === "[object Function]");
Reflect.set($$, "isAsyncFunction", (arg) => Reflect.toString.call(arg) === "[object AsyncFunction]");
Reflect.set($$, "isPromise", (arg) => Reflect.toString.call(arg) === "[object Promise]");
Reflect.set($$, "isArray", (arg) => Reflect.toString.call(arg) === "[object Array]");
Reflect.set($$, "isBoolean", (arg) => Reflect.toString.call(arg) === "[object Boolean]");
/** 判断数值是否为有限 即除了正常的数值为true，其余诸如NaN, Infinity, '15'都为false */
Reflect.set($$, "isFinite", (arg) => Number.isFinite(arg));
Reflect.set($$, "isNaN", (arg) => Number.isNaN(arg));
Reflect.set($$, "dialog", dialog);
