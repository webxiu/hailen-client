import { secretKey, whiteList } from "../config/constant";

import jwt from "jsonwebtoken";
import { responseStatus } from "../config";

export const verifyToken = async (ctx: any, next: any) => {
  try {
    const token = ctx.request.headers["authorization"];
    const isPass = whiteList.some((url) => ctx.url.startsWith(url));
    if (isPass) return await next();
    if (!token) return (ctx.body = responseStatus(401, "Token已过期"));
    const decoded = jwt.verify(token, secretKey);
    ctx.state.user = decoded; // 将解码后的用户信息存储在 ctx.state 中
    await next(); // 继续执行下一个中间件
  } catch (error) {
    ctx.body = responseStatus(401, "无效的Token");
  }
};
