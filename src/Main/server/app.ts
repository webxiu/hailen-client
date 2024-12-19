import "colors";

import { logger, verifyToken } from "./middlewares";

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import koaStatic from "koa-static";
import { printl } from "./config";
import { registerRouter } from "./routes";
import { uploadDir } from "./config/constant";

function createServer() {
  const app = new Koa();
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
  const port = $$.env.VITE_API_SERVER || 3800;
  app.listen(port, () => {
    printl("服务运行在:", `http://localhost:${port}`);
  });
}

export default createServer;
