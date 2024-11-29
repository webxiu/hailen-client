import { buildWeb, buildWebProgress, getApiJsonData, getMobileApiJsonData } from "../controllers/common/tool";
import { closeServer, startServer } from "../controllers/common/websoket";
import { createUser, getUserById, getUsers } from "../controllers/common/user";
import { download, getMarkdown, getVersion } from "../controllers/common/download";
import { uploadController, uploadImg } from "../controllers/common/upload";

import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { index } from "../controllers/common";
import { koaBody } from "koa-body";
import { uploadDir } from "../app";

const indexRouter = new Router({ prefix: "/" });
const userRouter = new Router({ prefix: "/users" });
/** 1.首页 */
indexRouter.get("/", index);
/** 2.用户 */
userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.post("/", createUser);

/** 3.上传 */
const uploadRouter = new Router({ prefix: "/upload" });
uploadRouter.get("/", uploadController);
// multipart: true, 启用multipart/form-data支持
uploadRouter.post("/img", koaBody({ multipart: true, formidable: { uploadDir: uploadDir, keepExtensions: true } }), uploadImg);
/** 4.上传 */
const downloadRouter = new Router({ prefix: "/download" });
downloadRouter.get("/", download);
downloadRouter.get("/getVersion", getVersion);
downloadRouter.get("/getMarkdown", getMarkdown);

/** 5.websoket */
const websocketRouter = new Router({ prefix: "/websocket" });
websocketRouter.get("/start", startServer);
websocketRouter.post("/close", bodyParser(), closeServer);
/** 6.tool */
const toolRouter = new Router({ prefix: "/tool" });
toolRouter.post("/getApiJsonData", getApiJsonData); // 获取接口数据
toolRouter.post("/getMobileApiJsonData", getMobileApiJsonData); // 获取移动端接口数据
toolRouter.post("/buildWeb", buildWeb); // 打包前端项目
toolRouter.post("/buildWebProgress", buildWebProgress); // 打包前端项目 node 版本18.18.2

export { indexRouter, userRouter, uploadRouter, downloadRouter, websocketRouter, toolRouter };
