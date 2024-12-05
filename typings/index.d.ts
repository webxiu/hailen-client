/**
 * @name 主进程类型声明
 * @notice 注意: 修改"全局声明"必须在模块内部, 所以至少要有 @export{} 字样
 */
import { Dialog } from "electron";
import { SettingTypes } from "@/Types/SettingTypes";
import { ListenerType, EventMapType } from "@/Main/Global/Event";
import { AppEventNames } from "@/Types/EventTypes";
import React from "react";
const PackageJson = require("~/package.json");
const pkg = JSON.parse(JSON.stringify(PackageJson));

interface ElectronProcessVersions extends NodeJS.ProcessVersions {
  brotli: string;
  chrome: string;
  electron: string;
  icu: string;
  llhttp: string;
  napi: string;
  nghttp2: string;
  unicode: string;
  build?: string;
  appVersion: string;
}

interface Window {
  api: {
    alterMessage: (message: string) => void;
    setUserInfo: (user: any) => void;
    clearCache: () => void;
  };
}

declare global {
  export const api: object;
  export const LANGUAGE: string;
  export type DirPath = string;
  export type FilePath = string;

  module NodeJS {
    interface Global {
      globalData: {
        showCloseModal: boolean;
      };
    }
  }

  export namespace $$ {
    // 全局的语言变量
    const language: string;
    /** 系统根目录 */
    const rootPath: string;
    const isPro: () => boolean;
    const JoinDirWithRoot: (...dir) => string;
    const isString: (arg) => Boolean;
    const isNumber: (arg) => Boolean;
    const isObject: (arg) => Boolean;
    const isUndefined: (arg) => Boolean;
    const isNull: (arg) => Boolean;
    const isFunction: (arg) => Boolean;
    const isAsyncFunction: (arg) => Boolean;
    const isPromise: (arg) => Boolean;
    const isArray: (arg) => Boolean;
    const isBoolean: (arg) => Boolean;
    /** 判断数值是否为有限 即除了正常的数值为true，其余诸如NaN, Infinity, '15'都为false */
    const isFinite: (arg) => Boolean;
    const isNaN: (arg) => Boolean;
    /** 系统 Dialog 组件只有在主进程才能访问到， 把方法直接挂载到全局提供所有渲染进程访问 */
    const dialog: Dialog;
    const AppInfo: Readonly<{
      platform: NodeJS.Platform;
      versions: ElectronProcessVersions;
      /** 软件外部存储根目录 */
      WorkPath: DirPath;
      /** 日志信息存储目录 */
      WorkLogPath: DirPath;
      /** 数据库存储目录 */
      WorkDBPath: DirPath;
      /** 软件定制化设置信息存储文件地址 */
      WorkSettingPath: FilePath;
      /** 应用窗口信息 */
      window: Electron.BrowserWindowConstructorOptions;
      /** 应用名称 */
      appName: string;
    }>;
    export namespace Settings {
      const read: () => SettingTypes | undefined;
      const write: (settingInner: Partial<SettingTypes>) => boolean;
    }
    export namespace waveVoice {
      const read: (fileName: string) => string;
      const write: (fileName: string, buffer: any) => string;
    }
    export namespace Event {
      const on: (eventName: AppEventNames, listener: ListenerType) => () => void;
      const once: (eventName: AppEventNames, listener: ListenerType) => () => void;
      const emit: (eventName: AppEventNames, args: unknown) => boolean;
      const off: (eventName: AppEventNames, listener?: ListenerType) => boolean;
      const offAll: () => void;
      const listener: () => EventMapType;
    }
    export namespace log {
      const info: (message, ...logs) => void;
      const warn: (message, ...logs) => void;
      const error: (message, ...logs) => void;
    }
  }
}

declare module "react" {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

import Koa from "koa";
declare module "koa" {
  interface Request {
    body?: unknown | any;
    rawBody: string;
  }
}
export {};
