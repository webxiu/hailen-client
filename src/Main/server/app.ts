import "colors";

import { logger, verifyToken } from "./middlewares";
import { prefixPath, uploadDir } from "./config/constant";

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaStatic from "koa-static";
import { printl } from "./config";

async function createServer({ platform, host, NODE_ENV }) {
  const app = new Koa();
  const isDev = NODE_ENV === "development";
  // app.context.isDev = isDev; // 注入到ctx
  global.isDev = isDev; // 动态设置全局变量
  global.platform = platform; // 动态设置全局变量
  const { Database } = await import("./database/db");
  const { registerRouter } = await import("./routes");

  // 设置静态资源目录 注意：koa-static默认会处理所有路径，所以需要在其他中间件之前
  app.use((ctx, next) => {
    if (!ctx.path.startsWith(prefixPath)) return next();
    ctx.path = ctx.path.replace(prefixPath, "");
    return koaStatic(uploadDir)(ctx, next);
  });
  // 使用中间件
  app.use(bodyParser());
  app.use(logger);
  app.use(verifyToken);

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
