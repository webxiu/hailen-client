const { EventEmitter } = require("events");
const { exec } = require("child_process");
const config = require("./config.js");
const net = require("net");
const pkg = require("../package.json");
const shell = require("shelljs");
const { build } = require("vite");
const { resolve } = require("path");
const Core = require("./core");
const waitOn = require("wait-on");
const fs = require('fs-extra');
const path = require('path');

class Command extends EventEmitter {
  constructor() {
    super();
    this.AutoOpenApp = new Proxy(
      {
        RenderProcessDone: false,
        MainProcessDone: false,
      },
      {
        set: (target, props, value) => {
          const isOk = Reflect.set(target, props, value);
          if (target.MainProcessDone && target.RenderProcessDone) {
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
    const _childProcess = exec(runPath);
    _childProcess.stdout.on("data", console.info);
    _childProcess.stdout.on("error", console.info);
    _childProcess.stderr.on("data", console.info);
    _childProcess.stderr.on("error", console.info);
  }

  runExec(command, callback) {
    const cp = exec(command);
    cp.stdout.on("data", (data) => callback({ type: "data", data }));
    cp.stdout.on("close", (data) => callback({ type: "close", data }));
    cp.on("close", (data) => callback({ type: "cp_close", data }));
    cp.stdout.on("error", console.info);
    cp.stderr.on("data", console.info);
    cp.stderr.on("error", console.info);
  }

  /** Readme */
  async RenderProcess() {
    const command = {
      production: `concurrently "npm run build:vue" "npm run build:react"`,
      development: `concurrently "npm run dev:vue" "npm run dev:react"`,
    }[process.env.NODE_ENV];
    console.log("启动渲染进程:", command);

    this.runExec(command, ({ type, data }) => {
      console.log("===监听渲染进程", data);
      if (Core.isPro()) {
        if (data === 0) {
          if (!this.AutoOpenApp.RenderProcessDone) this.AutoOpenApp.RenderProcessDone = true;
        }
      } else {
        if (["data", "close"].includes(type) && !Core.isPro() && data.includes("8500")) {
          if (!this.AutoOpenApp.RenderProcessDone) this.AutoOpenApp.RenderProcessDone = true;
        }
      }
    });
  }

  /** Readme */
  async MainProcess() {
    // const dir = `tsc ${resolve(process.cwd(), "src/Main/index.ts")} --outFile ${resolve(process.cwd(), "dist/mainProcess2.js")} --module commonjs`
    const project = resolve(process.cwd(), "tsconfig.main.json");
    const outDir = resolve(process.cwd(), "dist");
    const rootDir = resolve(process.cwd(), "src/Main");
    const command = `tsc --project ${project} --rootDir ${rootDir} --outDir ${outDir} --module commonjs --target esnext --strict --esModuleInterop --watch`;
    console.log("启动主进程:", command);

    if (Core.isPro()) {
      if (!this.AutoOpenApp.MainProcessDone) this.AutoOpenApp.MainProcessDone = true;
    } else {
      waitOn({ resources: ["tcp:8500", "tcp:8600"], timeout: 30000, }, (err) => {
        if (err) {
          console.error("等待端口时错误:", err);
          process.exit(1);
        }
        if (!this.AutoOpenApp.RenderProcessDone) this.AutoOpenApp.RenderProcessDone = true;

        this.runExec(command, ({ type, data }) => {
          console.log("=====监听主进程", type, data);
          if (["data"].includes(type) && data.includes("Watching for file changes")
          ) {
            if (!this.AutoOpenApp.MainProcessDone) this.AutoOpenApp.MainProcessDone = true;
          }
          if (["cp_close"].includes(type) && data === 0) {
            if (!this.AutoOpenApp.MainProcessDone) this.AutoOpenApp.MainProcessDone = true;
          }
        });
      });
    }
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
      this.childProcessExec(
        `nodemon -e js,ts,tsx -w dist -w package.json -w src/Main -w index.js --exec electron . --inspect`
      );
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
      fs.emptyDirSync(path.join(process.cwd(), './output'));
      this.builder();
    });
  }

  /** Readme */
  builder() {
    console.log("====打包开始 平台:", process.platform);
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
