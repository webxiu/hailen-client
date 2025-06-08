const path = require("path");

const JoinCwd = (...args) => {
  if (!args.length) {
    return process.cwd();
  }
  return path.join(process.cwd(), ...args);
};

const diskPath = path.join("speakin", "electron-admin");

module.exports = {
  host: "http://127.0.0.1:3800", // 本地服务地址(不配置使用VITE_BASE_URL环境变量)
  diskPath: diskPath,
  nodemon: true,
  eslint: false,
  tslint: true,
  smp: false
};
