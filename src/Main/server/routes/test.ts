import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { responseStatus } from "../config/index";
import { Context } from "koa";

const testRouter = new Router({ prefix: "/test" });

testRouter.get("/list", bodyParser(), async (ctx: Context) => {
  const data = ctx.query;
  console.log("请求参数", data);
  ctx.body = responseStatus(200, [
    { id: 1, test: "数据1" },
    { id: 2, test: "数据2" }
  ]);
});

testRouter.post("/add", bodyParser(), async (ctx: Context) => {
  const data = ctx.request.body;
  console.log("请求参数", data);
  ctx.body = responseStatus(200, { data: "添加数据成功" });
});

export { testRouter };
