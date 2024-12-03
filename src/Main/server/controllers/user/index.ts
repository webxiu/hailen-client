import UserModel, { User } from "../../models/user/user";

import { Context } from "koa";
import { responseStatus } from "../../config/index";

const userModel = new UserModel();

export const login = async (ctx: Context) => {
  const { password, email } = ctx.request.body as User;
  try {
    const user = await userModel.login({ email, password });
    if (!user) return (ctx.body = responseStatus(400, "用户不存在"));
    ctx.body = responseStatus(200, user);
  } catch (error: any) {
    ctx.body = responseStatus(400, "登录失败", error);
  }
};

export const register = async (ctx: Context) => {
  const { username, password, email, phone } = ctx.request.body as User;
  try {
    const user = await userModel.register({ username, password, email, phone });
    ctx.body = responseStatus(200, user);
  } catch (error: any) {
    ctx.body = responseStatus(400, "注册失败", error);
  }
};

// export { login, register };
