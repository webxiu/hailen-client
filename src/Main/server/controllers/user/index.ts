import UserModel, { User } from "../../models/user/user";

import { Context } from "koa";
import bcrypt from "bcrypt";
import { responseStatus } from "../../config/index";

const userModel = new UserModel();

const login = async (ctx: Context) => {
  const { password, email } = ctx.request.body as User;
  try {
    const user = await userModel.login({ email, password });
    if (!user) return (ctx.body = responseStatus(400, "邮箱不存在"));
    const { password: pwd, ...userWithoutPassword } = user;
    const isPasswordValid = await bcrypt.compare(password, pwd); // 比较输入密码和数据库哈希密码
    if (!isPasswordValid) return (ctx.body = responseStatus(400, "密码不正确"));
    ctx.body = responseStatus(200, userWithoutPassword);
  } catch (error: any) {
    ctx.body = responseStatus(400, "登录失败", error);
  }
};

const register = async (ctx: Context) => {
  const { username, password, email, phone } = ctx.request.body as User;
  try {
    const pwd = await bcrypt.hash(password, 10);
    const user = await userModel.register({ username, password: pwd, email, phone });
    ctx.body = responseStatus(200, user);
  } catch (error: any) {
    ctx.body = responseStatus(400, "注册失败", error);
  }
};

export { login, register };
