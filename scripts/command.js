const colors = require("colors");
const { EventEmitter } = require("events");
const { exec } = require("child_process");
const config = require("./config.js");
const net = require("net");
const pkg = require("../package.json");
const shell = require("shelljs");
const { resolve, join } = require("path");
const Core = require("./core");
const fs = require("fs-extra");
const dotenv = require("dotenv");
const path = require("path");
const { createServer, build } = require("vite");

class Command extends EventEmitter {
  constructor() {
    super();
    this.renderReady = false;
    this.mainReady = false;
  }

  /** 检测端口占用 */
  portIsOccupied(port, callback) {
    const server = net.createServer().listen(port);
    server.on("listening", () => {
      server.close();
      callback(null, port);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        this.portIsOccupied(port + 1, callback);
      } else {
        callback(err);
      }
    });
  }

  printl(s1, s2, ...rest) {
    console.log(s1.bgMagenta, s2.magenta, ...rest, "\n");
  }

  getEnv() {
    return dotenv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed || {};
  }

  childProcessExec(runPath) {
    this.printl("runPath:", runPath);
    const _childProcess = exec(runPath);
    _childProcess.stdout.on("data", console.info);
    _childProcess.stderr.on("data", console.error);
    return _childProcess;
  }

  runExec(command, callback) {
    const cp = exec(command);
    cp.stdout.on("data", (data) => callback({ type: "data", data }));
    cp.stdout.on("close", (data) => callback({ type: "close", data }));
    cp.on("close", (data) => callback({ type: "cp_close", data }));
    cp.stderr.on("data", console.error);
    return cp;
  }
  cleanCache() {
    const viteCacheDir = resolve(process.cwd(), "node_modules/.vite");
    if (fs.existsSync(viteCacheDir)) {
      try {
        fs.removeSync(viteCacheDir);
        console.log("✅ 已清除 .vite 缓存".green);
      } catch (err) {
        console.error("❌ 清除缓存失败:", err.message.red);
      }
    } else {
      console.log("💡 .vite 缓存不存在，跳过清理".yellow);
    }
  }

  // 创建 vite 开发服务
  startServer(options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const server = await createServer(options);
        const { resolvedUrls } = await server.listen();
        resolve(resolvedUrls);
      } catch (err) {
        reject(err);
      }
    });
  }
  // 创建 vite 生产服务
  buildServer(options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        await build(options);
        resolve(0);
      } catch (err) {
        reject(err);
      }
    });
  }

  StartProcess() {
    if (Core.isPro()) {
      const serverList = [
        { mode: "production", configFile: `${resolve(process.cwd(), "vite.vue.ts")}` },
        { mode: "production", configFile: `${resolve(process.cwd(), "vite.react.ts")}` }
      ];
      Promise.all(serverList.map((item) => this.buildServer(item)))
        .then((res) => {
          console.log("res", res);
          if (res.includes(0)) {
            console.log(`✅ Vue  打包成功`.italic);
            console.log(`✅ React打包成功`.italic);
            this.watchMain();
          }
        })
        .catch((err) => {
          console.error("❌ 有一个服务打包失败:", err);
          process.exit(1);
        });
      return;
    }
    this.cleanCache(); // 👈 新增这一行：开发环境自动清缓存
    const { VITE_VUE_PORT, VITE_REACT_PORT } = this.getEnv();
    const serverList = [
      { server: { port: VITE_VUE_PORT }, configFile: `${resolve(process.cwd(), "vite.vue.ts")}` },
      { server: { port: VITE_REACT_PORT }, configFile: `${resolve(process.cwd(), "vite.react.ts")}` }
    ];
    Promise.all(serverList.map((item) => this.startServer(item)))
      .then((res) => {
        const [vueUrl, reactUrl] = res;
        console.log("res", res);
        console.log(`✅ Vue启动成功: ${vueUrl.local}`.italic, `\n✅ React启动成功: ${reactUrl.local}`.italic);
        this.watchMain();
      })
      .catch((err) => {
        console.error("❌ 有一个服务启动失败:", err);
        process.exit(1);
      });
  }

  // 主进程编译TS为JS
  watchMain() {
    const _isPro = Core.isPro();
    const command = [
      "tsc",
      `--project ${resolve(process.cwd(), "tsconfig.main.json")}`,
      `--rootDir ${resolve(process.cwd(), "src/Main")}`,
      `--outDir ${resolve(process.cwd(), "dist")}`,
      `--module commonjs`,
      `--target esnext`,
      `--strict`,
      `--esModuleInterop`,
      // `--noEmit`, 会导致编译监听失效
      `--skipLibCheck`,
      _isPro ? "" : `--watch`
    ].join(" ");

    this.runExec(command, ({ type, data }) => {
      this.printl("主进程编译ts:", command, type, data);
      const proStatus = ["cp_close"].includes(type) || data === 0;
      const devStatus = ["data"].includes(type) && data.includes("Watching");
      if (_isPro) {
        if (proStatus) this.startBuild();
      } else {
        if (devStatus) this.startBuild();
      }
    });
  }

  startBuild() {
    if (Core.isPro()) {
      fs.emptyDirSync(path.join(process.cwd(), "./output"));
      this.builder();
    } else {
      this.app(); // 在这里触发 Electron 应用启动等后续操作
      if (config.tslint) this.childProcessExec(`tsc -w`);
    }
  }

  /** Readme */
  app() {
    if (config.nodemon) {
      this.childProcessExec(`nodemon -e js,ts,tsx -w dist/client -w package.json -w index.js --exec electron . --inspect`);
    } else {
      this.childProcessExec(`electron . --inspect`);
    }
  }

  // 启动命令
  start() {
    process.env.NODE_ENV = "development";
    this.StartProcess();
  }

  // 构建命令
  build() {
    process.env.NODE_ENV = "production";
    this.autoVersion();
    this.StartProcess();
  }

  // 打包平台
  builder() {
    this.printl("打包平台:", process.platform);
    switch (process.platform) {
      case "win32":
        shell.exec("electron-builder --win --ia32");
        break;
      case "darwin":
        shell.exec("electron-builder --mac --x64");
        break;
      case "linux":
        shell.exec("electron-builder --linux");
        break;
      default:
        shell.exec("electron-builder --win --x64");
        break;
    }
  }

  help() {
    console.log(`
    Command:    node electron-cli-service

    Options:    [start, build, kill]
    `);
  }

  kill() {
    shell.exec(`taskkill /f /t /im electron.exe`);
    shell.exec(`taskkill /f /t /im ${pkg.build.productName}.exe`);
  }

  autoVersion() {
    // require("../run/auto-version");
  }

  autoService() {
    // require("../run/auto-service");
  }
}

module.exports = Command;
