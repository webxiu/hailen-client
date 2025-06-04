/**
 * @Message [Electron Cli Service]
 * @start 开始编译并启动开发环境客户端
 * @build 开始编译并构建打包客户端
 * @StartProcess 启动命令入口
 * @startServer 创建 vite 开发服务
 * @buildServer 创建 vite 生产服务
 * @watchMain   监听主进程变化(ts编译js)
 * @startBuild  构建客户端入口
 * @app         启动客户端
 * @builder     打包客户端
 */

const Command = require("./command.js");
const minimist = require("minimist");
const command = new Command();

const argvs = minimist(process.argv.slice(2))["_"].filter((item) => command[item] && typeof command[item] === "function");
for (const argvItem of argvs) {
  command[argvItem]();
}
