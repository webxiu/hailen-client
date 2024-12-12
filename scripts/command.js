const colors = require('colors');
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
const fs = require("fs-extra");
const path = require("path");


class Command extends EventEmitter {
  constructor() {
    super();
    this.AutoOpenApp = new Proxy(
      {
        RenderProcessDone: false,
        MainProcessDone: false
      },
      {
        set: (target, props, value) => {
          const isOk = Reflect.set(target, props, value);
          if (target.MainProcessDone && target.RenderProcessDone) {
            this.emit("openApp");
            this.emit("builddone");
          }
          return isOk;
        }
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

  /** 主进程 */
  async MainProcess() {
    const project = resolve(process.cwd(), "tsconfig.main.json");
    const outDir = resolve(process.cwd(), "dist");
    const rootDir = resolve(process.cwd(), "src/Main");
    const args = [
      'tsc',
      `--project ${project}`,
      `--rootDir ${rootDir}`,
      `--outDir ${outDir}`,
      `--module commonjs`,
      `--target esnext`,
      `--strict`,
      `--esModuleInterop`
    ]
    const command = args.join(" ");
    console.log(`启动主进程: ${process.env.NODE_ENV}\n${command}`.blue);
    if (Core.isPro()) {
      this.runExec(command, ({ type, data }) => {
        if (["cp_close"].includes(type) || data === 0) {
          if (!this.AutoOpenApp.MainProcessDone) this.AutoOpenApp.MainProcessDone = true;
        }
      });
    } else {
      const { VITE_VUE_PORT, VITE_REACT_PORT } = process.env;
      waitOn({ resources: [`tcp:${VITE_VUE_PORT}`, `tcp:${VITE_REACT_PORT}`], timeout: 30000 }, (err) => {
        if (err) {
          console.error("等待端口时错误:".red, err);
          process.exit(1);
        }
        if (!this.AutoOpenApp.RenderProcessDone) this.AutoOpenApp.RenderProcessDone = true;

        this.runExec(command + ' --watch', ({ type, data }) => {
          if (["data"].includes(type) && data.includes("Watching for file changes")) {
            console.log("监听主进程(开发):".blue, type, data);
            if (!this.AutoOpenApp.MainProcessDone) this.AutoOpenApp.MainProcessDone = true;
          }
        });
      });
    }
  }


  /** 渲染进程 */
  async RenderProcess() {
    const command = {
      development: `concurrently "npm run dev:vue" "npm run dev:react"`,
      production: `concurrently "npm run build:vue" "npm run build:react"`
    }[process.env.NODE_ENV];
    console.log(`启动渲染进程: ${process.env.NODE_ENV}\n`.yellow, command.green);
    this.runExec(command, ({ type, data }) => {
      if (Core.isPro()) {
        if (data === 0 && !this.AutoOpenApp.RenderProcessDone) {
          this.AutoOpenApp.RenderProcessDone = true;
        }
      } else {
        if (["data", "close"].includes(type) && data.includes("8500")) {
          if (!this.AutoOpenApp.RenderProcessDone) this.AutoOpenApp.RenderProcessDone = true;
        }
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
      fs.emptyDirSync(path.join(process.cwd(), "./output"));
      this.builder();
    });
  }

  /** Readme */
  builder() {
    console.log("打包平台:".yellow, process.platform.green);
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
