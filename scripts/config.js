/**
 * @Message Electron 主进程启动配置
 * @Notice 此文件被 dist/client/appInfo.js 以 CommonJS 方式 require, 请勿改成 ESM
 */
const path = require("path");

/** 拼接进程工作目录下的绝对路径 */
const JoinCwd = (...dir) => path.join(process.cwd(), ...dir);

/** 主进程启动配置, 展开挂载到 $$.appInfo */
const startOption = {
  /** 本地 koa 服务完整地址(主进程内嵌服务监听地址, 渲染端代理目标, 与 .env 的 VITE_BASE_URL 一致) */
  host: "http://127.0.0.1:3800",
  /** 软件外部资源目录 */
  diskPath: JoinCwd("source"),
  /** 是否监听主进程自动重启 */
  nodemon: true,
  /** 启动时是否执行 eslint */
  eslint: false,
  tslint: false,
  smp: false
};

module.exports = { startOption, JoinCwd };
