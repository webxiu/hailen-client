import { closeServer, startServer } from "../controllers/common/websoket";
import { createUser, getUserById, getUsers } from "../controllers/common/user";
import { download, getMarkdown, getVersion } from "../controllers/common/download";
import { login, register } from "../controllers/user/index";
import { uploadController, uploadImg } from "../controllers/common/upload";

import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { getDashboard } from "../controllers/home";
import { index } from "../controllers/common";
import { koaBody } from "koa-body";
import { uploadDir } from "../config/constant";

const userRouter = new Router({ prefix: "/user" });
const indexRouter = new Router({ prefix: "/home" });
/** 1.用户 */
userRouter.post("/login", bodyParser(), login);
userRouter.post("/register", bodyParser(), register);

/** 2.首页 */
indexRouter.get("/dashboard", getDashboard);

// /** 3.上传 */
// const uploadRouter = new Router({ prefix: "/upload" });
// uploadRouter.get("/", uploadController);
// // multipart: true, 启用multipart/form-data支持
// uploadRouter.post("/img", koaBody({ multipart: true, formidable: { uploadDir: uploadDir, keepExtensions: true } }), uploadImg);
// /** 4.上传 */
// const downloadRouter = new Router({ prefix: "/download" });
// downloadRouter.get("/", download);
// downloadRouter.get("/getVersion", getVersion);
// downloadRouter.get("/getMarkdown", getMarkdown);

// /** 5.websoket */
// const websocketRouter = new Router({ prefix: "/websocket" });
// websocketRouter.get("/start", startServer);
// websocketRouter.post("/close", bodyParser(), closeServer);

// 使用路由
function registerRouter(app: Koa) {
  // export { indexRouter, userRouter, uploadRouter, downloadRouter, websocketRouter };
  const routers = [userRouter, indexRouter];
  routers.forEach((r) => app.use(r.routes()).use(r.allowedMethods()));
}

export { registerRouter };
