const colors = require("colors");
const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const minimist = require("minimist");
const dotenv = require("dotenv");
const { spawn, execSync } = require("child_process");
const pkg = require("../package.json");

const argv = minimist(process.argv.slice(2));
const cwd = process.cwd();
const isWin = process.platform === "win32";
/** 渲染端目标: --vue / --react 单选, 默认全部 */
const hasSingle = Boolean(argv.vue || argv.react);
const targets = { vue: Boolean(argv.vue) || !hasSingle, react: Boolean(argv.react) || !hasSingle };
/** 传给 electron 的额外参数(默认 --inspect 便于调试主进程) */
const electronArgs = (argv["--"] || []).filter(Boolean);
const finalElectronArgs = electronArgs.length ? electronArgs : ["--inspect"];

process.on("unhandledRejection", (error) => {
  console.error(`\n💥 执行失败: ${error?.message || error}`.red);
  process.exit(1);
});

class Command {
  constructor() {
    this.mode = "development";
    /** 存活的子进程(tsc -w 等), 退出时统一清理 */
    this.children = new Set();
    this.electronChild = null;
    this.distWatcher = null;
    this.restartTimer = null;
    process.on("SIGINT", () => this.dispose(0));
    process.on("SIGTERM", () => this.dispose(0));
  }

  /** 本地 node_modules/.bin 命令(兼容 Windows .cmd) */
  bin(name) {
    return path.join(cwd, "node_modules", ".bin", isWin ? `${name}.cmd` : name);
  }

  /** 按需加载 vite ESM API(CJS require 已被弃用) */
  async viteApi() {
    if (!this._vite) this._vite = await import("vite");
    return this._vite;
  }

  /** 加载 .env.[mode] 注入 process.env(不覆盖已有变量), 供主进程 $$ 环境读取 */
  loadEnv() {
    const envPath = path.join(cwd, `.env.${this.mode}`);
    const parsed = fs.existsSync(envPath) ? dotenv.parse(fs.readFileSync(envPath)) : {};
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
    return parsed;
  }

  /** vite 渲染端配置(vue/react 独立入口、独立预构建缓存, 见 vite.com.ts cacheDir; 端口占用时 vite 自动 +1) */
  viteConfigs(env) {
    const configs = [];
    if (targets.vue) {
      configs.push({
        name: "Vue",
        envKey: "VITE_VUE_PORT",
        configFile: path.join(cwd, "vite.vue.ts"),
        mode: this.mode,
        server: { port: Number(env.VITE_VUE_PORT || process.env.VITE_VUE_PORT || 8500) }
      });
    }
    if (targets.react) {
      configs.push({
        name: "React",
        envKey: "VITE_REACT_PORT",
        configFile: path.join(cwd, "vite.react.ts"),
        mode: this.mode,
        server: { port: Number(env.VITE_REACT_PORT || process.env.VITE_REACT_PORT || 8600) }
      });
    }
    return configs;
  }

  /** 启动 vite dev server(端口被占用时自动 +1, 实际端口回写环境变量供 electron 加载) */
  async startServer(options) {
    const { createServer } = await this.viteApi();
    const server = await createServer(options);
    await server.listen();
    const expectPort = options.server?.port;
    const actualPort = server.httpServer.address().port;
    if (actualPort !== expectPort) {
      console.log(`⚠️  端口 ${expectPort} 被占用, ${options.name} 自动改用端口 ${actualPort}`.yellow);
    }
    // electron 主进程按 process.env.VITE_*_PORT 加载页面, 必须回写实际端口
    process.env[options.envKey] = String(actualPort);
    return { name: options.name, urls: server.resolvedUrls, port: actualPort };
  }

  /** 打包单个渲染端 */
  async buildServer(options) {
    const { build } = await this.viteApi();
    await build(options);
    return { name: options.name };
  }

  /** 全量编译主进程 TS -> dist */
  compileMain() {
    console.log("🛠️  编译 Electron 主进程...".green);
    execSync(`"${this.bin("tsc")}" -p tsconfig.main.json`, { stdio: "inherit", cwd });
  }

  /** 监听主进程源码, 增量编译到 dist */
  watchMain() {
    const child = shell.exec(`"${this.bin("tsc")}" -p tsconfig.main.json -w --preserveWatchOutput`, { async: true, cwd });
    this.children.add(child);
    child.on?.("close", () => this.children.delete(child));
  }

  /** 启动 electron(require("electron") 直接解析二进制路径, 不依赖 PATH) */
  launchElectron() {
    if (this.electronChild) {
      this.electronChild.removeAllListeners("close");
      this.electronChild.kill();
      this.electronChild = null;
    }
    const electronBin = require("electron");
    // stdio 用 pipe 转发而非 inherit: Windows 控制台代码页(GBK)下 electron 直接写控制台会把中文按 UTF-8 字节输出导致乱码,
    // 经本进程 stdout(UTF-8) 转发后由 Node 统一编码, 中文正常
    this.electronChild = spawn(electronBin, [".", ...finalElectronArgs], {
      cwd,
      stdio: ["inherit", "pipe", "pipe"],
      env: { ...process.env, NODE_ENV: this.mode }
    });
    this.electronChild.stdout.on("data", (chunk) => process.stdout.write(chunk));
    this.electronChild.stderr.on("data", (chunk) => process.stderr.write(chunk));
    this.electronChild.on("close", (code) => {
      this.electronChild = null;
      console.log(`\n👋 Electron 已退出(code=${code})`.yellow);
      this.dispose(code || 0);
    });
  }

  /** 监听主进程产物, 自动重启 electron */
  watchMainOut() {
    try {
      this.distWatcher = fs.watch(path.join(cwd, "dist"), { recursive: true }, () => {
        clearTimeout(this.restartTimer);
        this.restartTimer = setTimeout(() => {
          console.log("♻️  主进程产物已更新, 重启 Electron...".cyan);
          this.launchElectron();
        }, 600);
      });
      this.distWatcher.on("error", () => {});
    } catch {
      console.log("⚠️  当前平台不支持递归目录监听, 主进程改动后请手动重启".yellow);
    }
  }

  /** 统一清理并退出 */
  dispose(code = 0) {
    clearTimeout(this.restartTimer);
    if (this.distWatcher) {
      try { this.distWatcher.close(); } catch {}
    }
    if (this.electronChild) {
      try { this.electronChild.kill(); } catch {}
    }
    for (const child of this.children) {
      try { child.kill(); } catch {}
    }
    process.exit(code);
  }

  /** 开发: vite dev(vue/react) + tsc watch(主进程) + electron */
  async start() {
    this.mode = "development";
    process.env.NODE_ENV = "development";
    const env = this.loadEnv();
    const targetText = [targets.vue && "Vue", targets.react && "React"].filter(Boolean).join(" + ");
    console.log(`🚀 启动渲染端开发服务(${targetText})...`.green);
    const servers = await Promise.all(this.viteConfigs(env).map((cfg) => this.startServer(cfg)));
    for (const { name, urls } of servers) {
      console.log(`✅ ${name} 就绪: ${(urls?.local || [])[0]}`.green);
    }

    this.compileMain();
    this.watchMain();
    this.watchMainOut();
    this.launchElectron();
  }

  /** 打包: tsc(主进程) + vite build(vue/react) + electron-builder */
  async build() {
    this.mode = "production";
    process.env.NODE_ENV = "production";
    const env = this.loadEnv();

    this.compileMain();

    for (const dir of ["vue", "react"]) {
      fs.rmSync(path.join(cwd, "dist", dir), { recursive: true, force: true });
    }

    console.log("📦 打包 Vue / React 渲染端...".green);
    await Promise.all(this.viteConfigs(env).map((cfg) => this.buildServer(cfg)));
    console.log("✅ 渲染端打包完成".green);

    fs.rmSync(path.join(cwd, "output"), { recursive: true, force: true });
    this.builder();
  }

  /** electron-builder 打包安装包(平台与产物格式走 package.json build 配置) */
  builder() {
    const platformFlag = { win32: "--win", darwin: "--mac", linux: "--linux" }[process.platform] || "--win";
    const extra = [...(argv.publish ? ["-p", "always"] : []), ...electronArgs];
    console.log(`🚚 electron-builder ${platformFlag} ${extra.join(" ")}`.green);
    shell.exec(`"${this.bin("electron-builder")}" ${platformFlag} ${extra.join(" ")}`.trim(), { cwd });
  }

  help() {
    console.log(`
  Command: node electron-cli-service <命令> [选项] [-- 透传参数]

  命令:
    start   开发模式: vite dev(vue/react) + tsc watch(主进程) + electron
    build   打包模式: tsc + vite build(vue/react) + electron-builder
    kill    结束所有 electron 进程

  选项:
    --vue / --react   只启动/打包指定渲染端(默认全部)
    --publish         (仅 build) 打包后发布

  示例:
    npm run start              # 启动全部渲染端 + electron
    npm run start:vue          # 只启动 Vue 渲染端
    node electron-cli-service build --publish -- --x64
    `);
  }

  kill() {
    if (isWin) {
      shell.exec(`taskkill /f /t /im electron.exe`);
      shell.exec(`taskkill /f /t /im ${pkg.build.productName}.exe`);
    } else {
      shell.exec(`pkill -f electron || true`);
    }
  }
}

module.exports = Command;
