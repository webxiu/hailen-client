import UserModel, { User } from "../../models/user/user";

import { Context } from "koa";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { responseStatus } from "../../config/index";
import { secretKey } from "../../config/constant";

const userModel = new UserModel();

const login = async (ctx: Context) => {
  const { password, email } = ctx.request.body as User["user"];
  try {
    const user = await userModel.login({ email, password });
    if (!user) return (ctx.body = responseStatus(400, "邮箱不存在"));
    const { password: pwd, ...userWithoutPassword } = user;
    const isPasswordValid = await bcryptjs.compare(password, pwd); // 比较输入密码和数据库哈希密码
    if (!isPasswordValid) return (ctx.body = responseStatus(400, "密码不正确"));
    // 生成token
    const token = jwt.sign({ id: user.email }, secretKey, { expiresIn: "1h" });
    ctx.body = responseStatus(200, { user: userWithoutPassword, token, $$: $$ || {} });
  } catch (error: any) {
    ctx.body = responseStatus(400, "登录失败");
  }
};

const register = async (ctx: Context) => {
  const { username, password, email, phone } = ctx.request.body as User["user"];
  try {
    const pwd = await bcryptjs.hash(password, 10);
    const user = await userModel.register({ username, password: pwd, email, phone });
    ctx.body = responseStatus(200, user);
  } catch (error: any) {
    ctx.body = responseStatus(400, "注册失败");
  }
};

export { login, register };
