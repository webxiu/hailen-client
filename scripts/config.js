const path = require("path");

const JoinCwd = (...args) => {
  if (!args.length) {
    return process.cwd();
  }
  return path.join(process.cwd(), ...args);
};

const diskPath = path.join("speakin", "electron-admin");

module.exports = {
  development: {
    SERVER_HOST: "http://127.0.0.1",
    SERVER_PORT: 3800
  },
  production: {
    SERVER_HOST: "http://127.0.0.1",
    SERVER_PORT: 4800
  },
  diskPath: diskPath,
  nodemon: true,
  eslint: false,
  tslint: true,
  smp: false,
  port: 10120
};
