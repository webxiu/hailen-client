import { downloadRouter, indexRouter, toolRouter, uploadRouter, userRouter, websocketRouter } from "./routes/userRoutes";

import Koa from "koa";
import bodyParser from "koa-bodyparser";
import { kimiRouter } from "./routes/aiRoutes";
import koaStatic from "koa-static";
import logger from "./middlewares/logger";
import path from "node:path";

console.log("logger", logger);

const app = new Koa();

// 设置上传文件的目录
export const uploadDir = path.join(__dirname, "../static");

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
app.use(indexRouter.routes()).use(indexRouter.allowedMethods());
// app.use(userRouter.routes()).use(userRouter.allowedMethods());
// app.use(uploadRouter.routes()).use(uploadRouter.allowedMethods());
// app.use(websocketRouter.routes()).use(websocketRouter.allowedMethods());
// app.use(downloadRouter.routes()).use(downloadRouter.allowedMethods());
// app.use(toolRouter.routes()).use(toolRouter.allowedMethods());
// app.use(kimiRouter.routes()).use(kimiRouter.allowedMethods());

app.listen(3800, () => {
  console.log("服务运行在: http://localhost:3800");
});
