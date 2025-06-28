/**
 * @name 主进程类型声明
 * @notice 注意: 修改"全局声明"必须在模块内部, 所以至少要有 @export{} 字样
 */
import { Dialog } from "electron";
import { SettingTypes } from "@/Types/SettingTypes";
import { ListenerType, EventMapType } from "@/Main/Global/Event";
import { AppEventNames } from "@/Types/EventTypes";

import type { VNode, FunctionalComponent, PropType as VuePropType, ComponentPublicInstance } from "vue";
import type { ECharts } from "echarts";
import type { IconifyIcon } from "@iconify/vue";
import type { TableColumns } from "@pureadmin/table";
import type { ElOption, UploadProps } from "element-plus";
import { CheckOnlineWebsocket } from "@/hooks/websocketOnline";
import { EventName } from "@/Main/client/utils/eventName";
import React from "react";
const PackageJson = require("~/package.json");
const pkg = JSON.parse(JSON.stringify(PackageJson));

type ValueOf<T> = T[keyof T];

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

interface ElectronAPI {
  getGlobal: () => $$;
  alterMessage: (message: string) => void;
  setUserInfo: (user: any) => void;
  clearCache: () => void;
  send: (channel: string, data: any) => void;
  on: (channel: string, func: (...args: any[]) => void) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
  invoke: (channel: EventName, data: any) => Promise<any>;
}

interface StartupType {
  vue: string;
  react: string;
  faviconPath: string;
  trayIconPath: string;
}

declare global {
  export const LANGUAGE: string;
  export type DirPath = string;
  export type FilePath = string;
  type JSXElement = JSX.Element | string;
  /** 项目根目录 */
  const __ROOT__: string;
  /** 平台的名称、版本、依赖、最后构建时间的类型提示 */
  const __APP_INFO__: {
    pkg: {
      name: string;
      version: string;
      dependencies: Recordable<string>;
      devDependencies: Recordable<string>;
    };
    lastBuildTime: string;
  };
  export const electronAPI: ElectronAPI;

  module NodeJS {
    interface Global {
      globalData: {
        showCloseModal: boolean;
      };
    }
  }

  /* 天地图T类型 */
  namespace T {
    class Map {
      constructor(containerId: string);
      centerAndZoom(lngLat: LngLat, zoom: number): void;
      addEventListener(event: string, callback: Function): void;
    }

    class LngLat {
      constructor(lng: number, lat: number);
    }
  }

  /** 全局变量$$ */
  export namespace $$ {
    // 全局的语言变量
    const language: string;

    const NODE_ENV: string;
    const env: ViteEnv;
    const clog: (...args) => void;
    const JoinCwd: (...dir) => string;
    const startup: StartupType;
    const isPro: () => boolean;
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
    const appInfo: Readonly<{
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
      /** 系统目录 */
      cwd: string;
      __dirname: string;
      appPath: string;
      rootPath: string;
      sourcePath: string;
      buildPath: string;

      // config.js
      host: string; // 本地服务
      diskPath: string;
      nodemon?: boolean;
      eslint?: boolean;
      tslint?: boolean;
      smp?: boolean;
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

  /** Window 上添加的类型 */
  interface Window {
    $$: $$;
    electronAPI: ElectronAPI;
    // 企业微信
    wxlogin: Function;
    webkitCancelAnimationFrame: (handle: number) => void;
    mozCancelAnimationFrame: (handle: number) => void;
    oCancelAnimationFrame: (handle: number) => void;
    msCancelAnimationFrame: (handle: number) => void;
    webkitRequestAnimationFrame: (callback: FrameRequestCallback) => number;
    mozRequestAnimationFrame: (callback: FrameRequestCallback) => number;
    oRequestAnimationFrame: (callback: FrameRequestCallback) => number;
    msRequestAnimationFrame: (callback: FrameRequestCallback) => number;

    bpmnInstances: {
      modeler: any;
      modeling: any;
      moddle: any;
      eventBus: any;
      bpmnFactory: any;
      elementFactory: any;
      elementRegistry: any;
      replace: any;
      selection: any;
      bpmnElement: any;
    };
  }

  /**
   * 接口请求数据响应类型
   */
  interface BaseResponseType<T> {
    data: T;
    status: number;
    message: string;
    timestamp: number;
  }

  /**
   * 打包压缩格式的类型声明
   */
  type ViteCompression = "none" | "gzip" | "brotli" | "both" | "gzip-clear" | "brotli-clear" | "both-clear";

  /**
   * 全局自定义环境变量的类型声明
   * @see {@link https://yiming_chang.gitee.io/pure-admin-doc/pages/config/#%E5%85%B7%E4%BD%93%E9%85%8D%E7%BD%AE}
   */
  interface ViteEnv {
    VITE_PORT: number;
    VITE_PUBLIC_PATH: string;
    VITE_ROUTER_HISTORY: string;
    VITE_CDN: boolean;
    VITE_HIDE_HOME: string;
    VITE_COMPRESSION: ViteCompression;
    VITE_BASE_API: string;
    VITE_BASE_URL: string;
    VITE_VUE_PORT: number;
    VITE_REACT_PORT: number;
  }

  /**
   *  继承 `@pureadmin/table` 的 `TableColumns` ，方便全局直接调用
   */
  interface TableColumnList extends TableColumns {
    /** 表格行编辑表单网格占比 */
    span?: number;
    /** 禁止编辑 */
    disabled?: boolean;
    /** 输入提示 */
    placeholder?: string;
    /** 下拉选项列表 */
    options?: Array<ElOption>;
    /** 导出时间格式 (yyyy-MM-dd HH:mm:ss) */
    format?: string;
    /** 格式化处理方式(json字符串) */
    formatType?: string;

    id?: string;
    menuId?: number;
    sortable?: boolean;
    minWidth?: number | string;
    width?: number | string;
    seq?: number;
    className?: string;
    columnname?: string;
    tablename?: string;
    groupCode?: string;
    groupName?: string;
    columnGroupId?: string;
    // type?: string;
    // align?: string;
    // fixed?: string;
    // headerAlign?: string;
    /** 是否新建 */
    isNew?: boolean;
  }

  type LayoutStyle = "horizontal" | "vertical" | "mix";
  /**
   * 对应 `public/serverConfig.json` 文件的类型声明
   * @see {@link https://yiming_chang.gitee.io/pure-admin-doc/pages/config/#serverconfig-json}
   */
  interface ServerConfigs {
    Version?: string;
    Title?: string;
    Logo?: string;
    FixedHeader?: boolean;
    HiddenSideBar?: boolean;
    MultiTagsCache?: boolean;
    KeepAlive?: boolean;
    Locale?: string;
    Layout?: LayoutStyle;
    Theme?: string;
    DarkMode?: boolean;
    Grey?: boolean;
    HideTabs?: boolean;
    SidebarStatus?: boolean;
    EpThemeColor?: string;
    ShowLogo?: boolean;
    ShowModel?: string;
    MenuArrowIconNoTransition?: boolean;
    CachingAsyncRoutes?: boolean;
    TooltipEffect?: Effect;
    ResponsiveStorageNameSpace?: string;
  }

  /**
   * 与 `ServerConfigs` 类型不同，这里是缓存到浏览器本地存储的类型声明
   * @see {@link https://yiming_chang.gitee.io/pure-admin-doc/pages/config/#serverconfig-json}
   */
  interface StorageConfigs {
    version?: string;
    title?: string;
    orgName?: string;
    logo?: string;
    fixedHeader?: boolean;
    hiddenSideBar?: boolean;
    multiTagsCache?: boolean;
    keepAlive?: boolean;
    locale?: string;
    layout?: string;
    theme?: string;
    darkMode?: boolean;
    grey?: boolean;
    hideTabs?: boolean;
    sidebarStatus?: boolean;
    epThemeColor?: string;
    showLogo?: boolean;
    showModel?: string;
    username?: string;
  }

  /**
   * 平台里所有组件实例都能访问到的全局属性对象的类型声明
   */
  interface GlobalPropertiesApi {
    $echarts: ECharts;
    $storage: ResponsiveStorage;
    $config: ServerConfigs;
  }

  /** 分页表格响应类型 */
  export interface TablePagingResType<T> {
    records: T[];
    total: number;
    size: number;
    current: number;
    orders: number[];
    optimizeCountSql: boolean;
    searchCount: boolean;
    countId: number;
    maxLimit: number;
    pages: number;
  }

  export interface ButtonItemType {
    loading?: boolean;
    disabled?: boolean;
    dark?: boolean;
    icon?: any;
    width?: string;
    color?: string;
    circle?: boolean;
    round?: boolean;
    type?: any;
    size?: any;
    /** 配置此属性则显示为上传按钮, 默认为普通按钮 */
    uploadProp?: Partial<UploadProps>;
    /** 必传项 */
    text: string;
    /** 点击选择事件 */
    clickHandler?: (item: ButtonItemType) => void;
    /** 是否显示在下拉按钮中 */
    isDropDown?: boolean;
  }

  export interface BaseServeResponse<T> {
    hasError: boolean;
    errorId: string;
    errorDesc: string;
    data: T;
  }
}

export {};
