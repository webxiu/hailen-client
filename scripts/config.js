const path = require("path");
const dotenv = require("dotenv");
const diskPath = path.join("hailen", "electron-admin");

// 项目启动配置
class Config {
  static startOption = {
    diskPath: diskPath,
    host: "http://127.0.0.1:3800",
    nodemon: true, // 启用nodemon, 修改主进程文件自动重启
    eslint: false,
    tslint: true,
    smp: false
  };
  static viteConfig() {
    const mode = process.env.NODE_ENV;
    const { VITE_VUE_PORT, VITE_REACT_PORT } = this.getEnvFile();
    return [
      {
        name: "Vue",
        mode: mode,
        server: { port: VITE_VUE_PORT },
        configFile: this.JoinCwd("vite.vue.ts")
      },
      {
        name: "React",
        mode: mode,
        server: { port: VITE_REACT_PORT },
        configFile: this.JoinCwd("vite.react.ts")
      }
    ];
  }
  static getEnvFile() {
    const path = `.env.${process.env.NODE_ENV}`;
    return dotenv.config({ path }).parsed || {};
  }
  static JoinCwd(...dir) {
    if (!dir) return process.cwd();
    return path.join(process.cwd(), ...dir);
  }
  static isPro() {
    return process.env.NODE_ENV === "production";
  }
}

module.exports = Config;
