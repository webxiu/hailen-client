// import Package from "~/package.json";
// import _WorkPath from './_WorkPath';

import { app, dialog } from "electron";

import path from "path";

// const Build = {
//   appVersion: Package.version.split("-")[0],
//   /** 开发环境为 undefined， 生产环境为 CI 打包的 {打包号} */
//   build: Package.version.split("-")[1]
// };

Reflect.set($$, "AppInfo", {
  platform: process.platform
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
Reflect.set($$, "env", JSON.parse(JSON.stringify(process.env)));
Reflect.set($$, "NODE_ENV", app.isPackaged ? "production" : "development");
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
