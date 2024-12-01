import { Context } from "koa";
import { responseStatus } from "../../config/index";

export const index = async (ctx: Context) => {
  // const request = ctx.request.body; // post:需要koa-bodyparser中间件
  // const query = ctx.query; // get
  // const query = ctx.params; // 动态路由参数
  ctx.body = responseStatus(401, "请先登录哦~");
};
