// import { EventEmitter } from "events";
// import childProcess from "child_process";
// import config from "./config.js";
// import net from "net";
// import pkg from "../package.json"
// import shell from "shelljs";
const { EventEmitter } = require("events");
const childProcess = require("child_process");
const config = require("./config.js");
const net = require("net");
const pkg = require("../package.json");
const shell = require("shelljs");
const { build } = require("vite");
const { resolve } = require("path");
const Core = require("./core");

class Command extends EventEmitter {
  constructor() {
    super();
    this.AutoOpenApp = new Proxy(
      {
        _RenderProcessDone: false,
        _MainProcessDone: false,
      },
      {
        set: (target, props, value) => {
          const isOk = Reflect.set(target, props, value);
          if (target._MainProcessDone && target._RenderProcessDone) {
            console.log("完成了:", target._MainProcessDone, target._RenderProcessDone);
            this.emit("openApp");
            this.emit("builddone");
          }
          return isOk;
        },
      }
    );
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

  /** Readme */
  childProcessExec(runPath) {
    console.log("runPath", runPath);
    const _childProcess = childProcess.exec(runPath);
    _childProcess.stdout.on("data", console.info);
    _childProcess.stdout.on("error", console.info);
    _childProcess.stderr.on("data", console.info);
    _childProcess.stderr.on("error", console.info);
  }

  /** Readme */
  async RenderProcess() {
    let command = `concurrently "npm run build:vue" "npm run build:react"`;
    if (process.env.NODE_ENV === "development") {
      command = `concurrently "npm run dev:vue" "npm run dev:react"`;
    }

    console.log("启动渲染进程:", command);
    const tsc = childProcess.exec(command);
    tsc.stdout.on("data", (data) => {
      console.log(`输出: ${data}`);
      // 检查输出中是否包含特定的启动完成消息
      if (data.includes("Server is running") || data.includes("Listening on")) {
        resolve(); // 服务已启动，解析 Promise
      }
    });
    tsc.stdout.on("close", (data) => {
      console.log("===渲染进程, 打包完成", data);
      if (Core.isPro()) {
        if (!this.AutoOpenApp._RenderProcessDone) this.AutoOpenApp._RenderProcessDone = true;
      } else {
        console.error("主进程退出:", data);
      }
    });
    if (!Core.isPro()) {
      console.log("===渲染进程, 启动服务");
      if (!this.AutoOpenApp._RenderProcessDone) this.AutoOpenApp._RenderProcessDone = true;
    }
    this.portIsOccupied(config.port, (err, checkPort) => {
      // new WebpackDevServer(compiler, devServerOptions).listen(checkPort + 1);
    });
  }

  /** Readme */
  async MainProcess() {
    // 使用 TypeScript 编译器编译代码，并指定输出目录
    // const dir = `tsc ${resolve(process.cwd(), "src/Main/index.ts")} --outFile ${resolve(process.cwd(), "dist/mainProcess2.js")} --module commonjs`
    const dir = `tsc --project ${resolve(process.cwd(), "tsconfig.main.json")} --outDir ${resolve(process.cwd(), "dist")} --rootDir ${resolve(
      process.cwd(),
      "src/Main"
    )} --module commonjs --target esnext --strict --esModuleInterop --watch`;
    console.log("主进程命令:", dir);
    const tsc = childProcess.exec(dir);

    tsc.stdout.on("data", (data) => {
      console.log("==================>2110", data, "_MainProcessDone:", this.AutoOpenApp._MainProcessDone);
      if (!this.AutoOpenApp._MainProcessDone) this.AutoOpenApp._MainProcessDone = true;
    });

    tsc.stderr.on("data", (data) => {
      console.error(2112, data);
    });
    tsc.stderr.on("error", (data) => {
      console.error("2113错误", data);
    });

    tsc.on("close", (code) => {
      console.log(`====主进程完成:`, code);
      if (code === 0) {
        if (!this.AutoOpenApp._MainProcessDone) this.AutoOpenApp._MainProcessDone = true;
      } else {
        console.error("主进程退出:", code);
      }
    });
  }

  /** Readme */
  start() {
    process.env.NODE_ENV = "development";
    this.once("openApp", () => {
      this.app();
      if (config.tslint) this.childProcessExec(`tsc -w`);
    });
    this.MainProcess();
    this.RenderProcess();
  }

  /** Readme */
  app() {
    if (config.nodemon) {
      this.childProcessExec(`nodemon -e js,ts,tsx -w dist -w package.json -w src/Main -w index.js --exec electron . --inspect`);
    } else {
      this.childProcessExec(`electron . --inspect`);
    }
  }

  /** Readme */
  build() {
    process.env.NODE_ENV = "production";
    this.autoVersion();
    this.MainProcess();
    this.RenderProcess();
    this.once("builddone", () => {
      this.builder();
    });
  }

  /** Readme */
  builder() {
    console.log("====开始打包:", process.platform);
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

  /** Readme */
  help() {
    console.log(`
    Command:    node electron-cli-service

    Options:    [start, build, kill]
    `);
  }

  /** Readme */
  kill() {
    shell.exec(`taskkill /f /t /im electron.exe`);
    shell.exec(`taskkill /f /t /im ${pkg.build.productName}.exe`);
  }

  /** Extends */
  autoVersion() {
    // require("../run/auto-version");
  }

  /** Extends */
  autoService() {
    // require("../run/auto-service");
  }
}

// export default Command;
module.exports = Command;
