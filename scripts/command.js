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
          console.log('99999', target._MainProcessDone)
          const isOk = Reflect.set(target, props, value);
          if (target._MainProcessDone && target._RenderProcessDone) {
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
    _childProcess.stdout.on('data', console.info);
    _childProcess.stdout.on('error', console.info);
    _childProcess.stderr.on('data', console.info);
    _childProcess.stderr.on('error', console.info);
  }

  /** Readme */
  async RenderProcess() {
    console.log('666', 666)
    if (!this.AutoOpenApp._RenderProcessDone) this.AutoOpenApp._RenderProcessDone = true;

    // const compiler = webpack(RenderProcessWebpackConfig);
    // compiler.hooks &&
    //   compiler.hooks.done.tapAsync({ name: 'CompiledRenderProcessOnce' }, (compilation, callback) => {
    //     if (!this.AutoOpenApp._RenderProcessDone) this.AutoOpenApp._RenderProcessDone = true;
    //     callback();
    //   });
    // if (Core.isPro()) return compiler.run(Core.RenderProcessPro);
    // const userDevServer = config.devServer || {};
    // const devServerOptions = {
    //   hot: true,
    //   open: false,
    //   hotOnly: true,
    //   noInfo: true,
    //   stats: 'errors-only',
    //   clientLogLevel: 'error',
    //   overlay: { errors: true, warnings: true },
    //   ...userDevServer
    // };

    this.portIsOccupied(config.port, (err, checkPort) => {
      // new WebpackDevServer(compiler, devServerOptions).listen(checkPort + 1);
    });
  }

  /** Readme */
  async MainProcess() {
    // const compiler = webpack(MainProcessWebpackConfig);
    // compiler.hooks.done.tapAsync({ name: 'CompiledMainProcessOnce' }, (compilation, callback) => {
    //   if (!this.AutoOpenApp._MainProcessDone) this.AutoOpenApp._MainProcessDone = true;
    //   callback();
    // });
    // if (Core.isPro()) return compiler.run(Core.MainProcessPro);
    // const watchOptions = { ignored: /(node_modules|Render|package\.json)/ };

    // compiler.watch(watchOptions, Core.MainProcessDev);


    // 使用 TypeScript 编译器编译代码，并指定输出目录
    // const dir = `tsc ${resolve(process.cwd(), "src/Main/index.ts")} --outFile ${resolve(process.cwd(), "dist/mainProcess2.js")} --module commonjs`
    const dir = `tsc ${resolve(process.cwd(), "src/Main/index.ts")} --outDir ${resolve(process.cwd(), "dist")} --rootDir ${resolve(process.cwd(), "src/Main")} --module commonjs`
    console.log('dir', dir)
    const tsc = childProcess.exec(dir);

    tsc.stdout.on('data', (data) => {
      console.log(1210, data);
    });

    tsc.stderr.on('data', (data) => {
      console.error(1211, data);
    });
    tsc.stderr.on('error', (data) => {
      console.error('错误', data);
    });

    tsc.on('close', (code) => {
      console.log(`==== finished with code ${code}`);
      if (code === 0) {
        console.log('Compilation successful, output in ./dist');
        // 继续执行其他操作，例如构建 Electron 应用
        // this.builder(); // 如果需要，可以继续执行 builder 
        if (!this.AutoOpenApp._MainProcessDone) this.AutoOpenApp._MainProcessDone = true;

      } else {
        console.error('==== failed.');
      }
    });

    // try {
    //   console.log("Building...", __dirname, resolve(process.cwd(), "src"));
    //   await build({
    //     root: resolve(process.cwd(), "src"), // 指定项目根目录
    //     build: {
    //       outDir: resolve(process.cwd(), "dist"), // 输出目录
    //       sourcemap: true, // 启用源映射文件生成
    //       rollupOptions: {
    //         input: {
    //           main: resolve(process.cwd(), "src/Main/index.ts"), // 入口文件
    //         },
    //         output: {
    //           entryFileNames: "mainProcess.js", // 设置输出文件名格式
    //           assetFileNames: "[name][extname]", // 直接输出到 dist 目录
    //           // dir: resolve(__dirname, 'dist'), // 指定输出目录
    //         },
    //       },
    //     },
    //   });
    //   console.log("Build completed successfully!");
    // } catch (error) {
    //   console.error("Build failed:", error);
    // }
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
  start() {
    process.env.NODE_ENV = "development";

    this.once('openApp', () => {
      console.log('77777', 77777)
      this.app();
      if (config.tslint) this.childProcessExec(`tsc -w`);
    });
    this.MainProcess();
    this.RenderProcess();
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

  /** Readme */
  app() {
    console.log('888888888888', 888888888888)
    if (config.nodemon) {
      this.childProcessExec(
        `nodemon -e js,ts,tsx -w dist -w package.json -w index.js --exec electron . --inspect`
      );
    } else {
      this.childProcessExec(`electron . --inspect`);
    }
  }

  /** Extends */
  autoVersion() {
    require("../run/auto-version");
  }

  /** Extends */
  autoService() {
    require("../run/auto-service");
  }
}

// export default Command;
module.exports = Command;
