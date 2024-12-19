import path from "path";

const JoinCwd = (...args) => {
  if (!args.length) {
    return process.cwd();
  }
  return path.join(process.cwd(), ...args);
};
export default {
  /** 开发环境 */
  development: {
    VITE_PUBLIC_PATH: "./", //  开发环境读取配置文件路径
    VITE_VUE_PORT: 8500, //  平台本地运行端口号
    VITE_REACT_PORT: 8600,
    VITE_BASE_API: "/api", //  接口代理路由前缀
    VITE_API_SERVER: "http://127.0.0.1:3800", // 本地接口地址
    VITE_BASE_URL: "http://127.0.0.1:3800", // 请求接口地址
    //  开发环境路由历史模式（Hash模式传"hash"、HTML5模式传"h5"、Hash模式带base参数传"hash,base参数"、HTML5模式带base参数传"h5,base参数"）
    VITE_ROUTER_HISTORY: "hash",
    VITE_KIMI_API_KEY: "c2stRzM3dGRaWkJoYVh1a0ZZdlZrTXZ4Z1B0UlRCNHhPUzV0eTNqZU1heThJT0ZPbU9l",
    VITE_OPEN_IN_VSCODE: "vscode://file/", // vscode打开文件的前缀
    diskPath: path.join("speakin", "electron-admin")
  },
  /** 生产环境 */
  production: {
    VITE_PUBLIC_PATH: "./", // 线上环境平台打包路径
    VITE_VUE_PORT: 7500, // 打包本地运行端口号
    VITE_REACT_PORT: 7600,
    VITE_API_SERVER: "http://127.0.0.1:4800", // 本地接口地址
    VITE_BASE_API: "http://127.0.0.1:4800", // 请求接口地址
    VITE_ROUTER_HISTORY: "hash",
    // Kimi ApiKey: sk-G37tdZZBhaXukFYvVkMvxgPtRTB4xOS5ty3jeMay8IOFOmOe
    VITE_KIMI_API_KEY: "c2stRzM3dGRaWkJoYVh1a0ZZdlZrTXZ4Z1B0UlRCNHhPUzV0eTNqZU1heThJT0ZPbU9l",
    diskPath: path.join("speakin", "electron-admin")
  }
};
