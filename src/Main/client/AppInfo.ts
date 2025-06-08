// import Package from "~/package.json";
// import _WorkPath from './_WorkPath';

import { BrowserWindow, Menu, Tray, app, dialog } from "electron";

import path from "path";

const { appConfig, JoinCwd } = require(path.join(__dirname, "../../scripts/config.js"));

const faviconPath = `/public/favicon/png/favicon_ch@3x.png`;
const trayIconPath = `/public/favicon/png/favicon_ch@2x.png`;

const getSystemPath = (...dir: string[]) => {
  if (app.isPackaged) {
    return $$.JoinCwd("./resources/app.asar.unpacked", ...dir);
  } else {
    return $$.JoinCwd(...dir);
  }
};
/** Electron 启动配置 */
function getStartup() {
  const _faviconPath = getSystemPath(faviconPath);
  const _trayIconPath = getSystemPath(trayIconPath);
  /** 启动路径 */
  const startup = {
    development: {
      vue: `http://localhost:${$$.env.VITE_VUE_PORT}`,
      react: `http://localhost:${$$.env.VITE_REACT_PORT}`,
      faviconPath: _faviconPath,
      trayIconPath: _trayIconPath
    },
    production: {
      vue: path.join(__dirname, "../vue/index.html"),
      react: path.join(__dirname, "../react/index.html"),
      faviconPath: _faviconPath,
      trayIconPath: _trayIconPath
    }
  };
  return startup[$$.NODE_ENV];
}

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

function getProcessEnv() {
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("npm_")) Reflect.deleteProperty(process.env, key);
  });
  const viteEnv = Object.keys(process.env)
    .filter((key) => key.startsWith("VITE_"))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {});
  return viteEnv;
}

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

/** 输出打印颜色 */
function clog(s1, s2, ...rest) {
  console.log("\n", s1.bgBlue, s2.magenta, ...rest);
}

Reflect.set($$, "appInfo", {
  __dirname,
  platform: process.platform,
  ...getAppPath(),
  ...appConfig
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
Reflect.set($$, "clog", clog);
Reflect.set($$, "JoinCwd", JoinCwd);
Reflect.set($$, "env", { ...getProcessEnv() }); // 环境变量通过 scripts/config.js 读文件获取，可以移除这个配置,
Reflect.set($$, "startup", { ...getStartup() });
Reflect.set($$, "isPro", () => app.isPackaged);
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
