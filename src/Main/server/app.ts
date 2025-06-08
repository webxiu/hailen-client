import "colors";

import { logger, verifyToken } from "./middlewares";

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaStatic from "koa-static";
import { printl } from "./config";
import { uploadDir } from "./config/constant";

async function createServer({ platform, host, NODE_ENV }) {
  const app = new Koa();
  const isDev = NODE_ENV === "development";
  // app.context.isDev = isDev; // 注入到ctx
  global.isDev = isDev; // 动态设置全局变量
  global.platform = platform; // 动态设置全局变量
  const { Database } = await import("./database/db");
  const { registerRouter } = await import("./routes");

  // 使用中间件
  app.use(bodyParser());
  app.use(logger);
  app.use(verifyToken);
  app.use(koaStatic(uploadDir));

  app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    ctx.set("Access-Control-Allow-Credentials", "true");
    if (ctx.method === "OPTIONS") return (ctx.status = 200);
    await next();
  });
  registerRouter(app);
  const prot = host.slice(host.lastIndexOf(":") + 1);
  app.listen(prot, () => {
    printl("服务运行在:", host);
  });
}

export default createServer;
