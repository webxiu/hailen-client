import HomeModel, { User } from "../../models/home";

import { Context } from "koa";
import { responseStatus } from "../../config/index";

const homeModel = new HomeModel();

const getDashboard = async (ctx: Context) => {
  const { username, email } = ctx.query;
  try {
    const user = await homeModel.findAll({ username, email });
    ctx.body = responseStatus(200, user);
  } catch (error: any) {
    ctx.body = responseStatus(400, error, "注册失败");
  }
};

export { getDashboard };
