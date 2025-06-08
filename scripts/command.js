const colors = require("colors");
const net = require("net");
const path = require("path");
const fs = require("fs-extra");
const shell = require("shelljs");
const dotenv = require("dotenv");
const Core = require("./core");
const pkg = require("../package.json");
const config = require("./config.js");
const { resolve } = require("path");
const { exec } = require("child_process");
const { EventEmitter } = require("events");
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
    console.log("\n", s1.bgMagenta, s2.magenta, ...rest);
  }

  getEnv() {
    return dotenv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed || {};
  }

  childProcessExec(runPath) {
    this.printl("[command]", runPath);
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

  // Vite 开发服务
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
  // Vite 生产服务
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

  startProcess() {
    const { VITE_VUE_PORT, VITE_REACT_PORT } = this.getEnv();
    const isPro = Core.isPro();
    const viteConfig = [
      {
        name: "Vue",
        mode: process.env.NODE_ENV,
        server: { port: VITE_VUE_PORT },
        configFile: resolve(process.cwd(), "vite.vue.ts")
      },
      {
        name: "React",
        mode: process.env.NODE_ENV,
        server: { port: VITE_REACT_PORT },
        configFile: resolve(process.cwd(), "vite.react.ts")
      }
    ];
    if (!isPro) this.cleanCache();
    const processMethod = isPro ? this.buildServer : this.startServer;
    Promise.all(viteConfig.map((config) => processMethod(config)))
      .then((results) => {
        let resultText = viteConfig.map((c, i) => `✅ ${viteConfig[i].name}启动成功: ${results[i].local}`);
        if (isPro) {
          if (!results.includes(0)) throw new Error("构建失败");
          resultText = viteConfig.map((c) => `✅ ${c.name}打包成功`);
        }
        console.log(`${resultText.join("\n")}`.italic);
        this.watchMain();
      })
      .catch((err) => {
        const errorText = isPro ? "构建" : "启动";
        console.error(`❌ 服务${errorText}失败:`, err);
        process.exit(1);
      });
  }

  // 主进程编译TS为JS
  watchMain() {
    const _isPro = Core.isPro();
    const command = [`tsc --project ${resolve(process.cwd(), "tsconfig.main.json")} --preserveWatchOutput`, _isPro ? "" : "-w"].filter(Boolean).join(" ");

    this.runExec(command, ({ type, data }) => {
      this.printl("[compile main]", command, data);
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
      this.app();
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
    this.startProcess();
  }

  // 构建命令
  build() {
    process.env.NODE_ENV = "production";
    this.autoVersion();
    this.startProcess();
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
