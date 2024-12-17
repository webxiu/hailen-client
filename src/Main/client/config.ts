const path = require("path");

const JoinCwd = (...args) => {
  if (!args.length) {
    return process.cwd();
  }
  return path.join(process.cwd(), ...args);
};

const envConf = {
  /** 公共存储二级目录 */
  diskPath: path.join("speakin", "electron-admin"),
  nodemon: true,
  /** 开发环境 */
  development: {
    vue_port: 8500,
    react_port: 8600,
    server_host: "http://127.0.0.1:3800",
    baseAPI: "/api"
  },
  /** 生产环境 */
  production: {
    vue_port: 7500,
    react_port: 7600,
    server_host: "http://127.0.0.1:3800",
    baseAPI: "http://127.0.0.1:3800"
  }
}[process.env.NODE_ENV];

export default envConf;
