/**
 * @notice 注意: 修改"全局声明"必须在模块内部, 所以至少要有 @export{} 字样
 */
import { Dialog } from "electron";
import React from "react";

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

declare global {
  /** 打包选择语言 */
  export const LANGUAGE: string;
  /** 本地配置语言 */
  export const $language: string;
  export type DirPath = string;
  export type FilePath = string;
  // export type OffscreenCanvasRenderingContext2D = OffscreenCanvasRenderingContext2D;
  // export const OffscreenCanvas: OffscreenCanvas;

  namespace NodeJS {
    interface Global {
      /** 退出应用弹窗 */
      globalData: {
        showCloseModal: boolean;
      };
    }
  }

  export namespace $$ {
    const language: "zh-CN" | "en-US" | "ru-RU"; // 打包的全局的语言
    const LANGUAGE_EN_ID: "id_ID"; // 印尼语言常量
    const LANGUAGE_ZH: "zh_CN"; // 中文语言常量
    const LANGUAGE_RU: "ru_RU"; // 俄文语言常量

    const appName: string;
    const isPro: () => boolean;
    const JoinDirWithRoot: (...dir) => string;
    const isString: (arg) => boolean;
    const isNumber: (arg) => boolean;
    const isObject: (arg) => boolean;
    const isUndefined: (arg) => boolean;
    const isNull: (arg) => boolean;
    const isFunction: (arg) => boolean;
    const isAsyncFunction: (arg) => boolean;
    const isPromise: (arg) => boolean;
    const isArray: (arg) => boolean;
    const isboolean: (arg) => boolean;
    const toFixed: (num: number, digits: number) => num;
    /** 判断数值是否为有限 即除了正常的数值为true，其余诸如NaN, Infinity, '15'都为false */
    const isFinite: (arg) => boolean;
    const isNaN: (arg) => boolean;
    /** 系统根目录 */
    const rootPath: string;
    /** 接口服务目录 */
    const serverPath: string;

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
      /** 下载目录 */
      WorkDownloadPath: DirPath;
      /** 软件定制化设置信息存储文件地址 */
      WorkSettingPath: FilePath;
      /** 内置 public 文件夹目录地址, 线上环境和开发环境地址不一致 */
      ResolvePublicDir: () => string;
    }>;

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

declare module "koa" {
  interface Request {
    body?: unknown;
    rawBody: string;
  }
}
export {};
