import { Context, Next } from "koa";
import { secretKey, whiteList } from "../config/constant";

import jwt from "jsonwebtoken";
import { responseStatus } from "../config";

export const verifyToken = async (ctx: Context, next: Next) => {
  try {
    const allowMethod = ctx.method.toLowerCase() === "get";
    const isWhite = whiteList.some((path) => ctx.url.startsWith(path));
    let token = ctx.request.headers["authorization"] || (ctx.query.token as string);
    console.log("token", token);
    if (isWhite || allowMethod) return await next();

    // 移除可能的Bearer前缀
    if (token && token.startsWith("Bearer ")) token = token.replace("Bearer ", "").trim();
    if (!token) {
      // ctx.status = 401;
      return (ctx.body = responseStatus(401, "Token不存在"));
    }
    // 验证token, 不通过会抛出异常
    const decoded = jwt.verify(token, secretKey);
    ctx.state.user = decoded; // 将解码后的用户信息存储在 ctx.state 中
    await next();
  } catch (error) {
    const errorMsg = {
      JsonWebTokenError: "Token无效",
      TokenExpiredError: "Token已过期",
      NotBeforeError: "Token未注册"
    };
    const message = errorMsg[error.name] || "Token认证失败";
    // ctx.status = 401;
    ctx.body = responseStatus(401, message);
  }
};
