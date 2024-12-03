import { downloadRouter, indexRouter, toolRouter, uploadRouter, websocketRouter } from "./routes/demo";

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { kimiRouter } from "./routes/aiRoutes";
import koaStatic from "koa-static";
import logger from "./middlewares/logger";
import path from "node:path";
import { userRouter } from "./routes/userRouter";

export const uploadDir = path.join(__dirname, "../static");
console.log("logger", logger);
function createServer() {
  const app = new Koa();

  // 设置上传文件的目录

  // 使用中间件
  app.use(bodyParser());
  app.use(logger);
  app.use(koaStatic(uploadDir));

  app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    ctx.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    ctx.set("Access-Control-Allow-Credentials", "true");
    if (ctx.method === "OPTIONS") {
      ctx.status = 200;
      return;
    }
    await next();
  });

  // 使用路由
  const routers = [userRouter, indexRouter];
  routers.forEach((r) => app.use(r.routes()).use(r.allowedMethods()));

  app.listen(3800, () => {
    console.log("服务运行在: http://localhost:3800");
  });
}

export default createServer;
