import DbModel, { MenuItemType } from "./model";

import { Context } from "koa";
import { responseStatus } from "../../config/index";

const dbModel = new DbModel();

const createMenu = async (ctx: Context) => {
  const { menus } = ctx.request.body;
  try {
    const res = await dbModel.createMenu(menus);
    if (!res) return (ctx.body = responseStatus(400, "创建失败"));
    ctx.body = responseStatus(200, "创建成功");
  } catch (error: any) {
    ctx.body = responseStatus(400, "创建失败!");
  }
};

async function getMenu(ctx: Context) {
  try {
    const res = await dbModel.getMenu();
    if (!res) return (ctx.body = responseStatus(400, "获取失败"));
    ctx.body = responseStatus(200, res);
  } catch (error: any) {
    ctx.body = responseStatus(400, "获取失败!");
  }
}

async function updateMenu(ctx: Context) {
  try {
    const res = await dbModel.updateMenu(ctx.request.body);
    if (!res) return (ctx.body = responseStatus(400, "操作失败"));
    ctx.body = responseStatus(200, res, "操作成功");
  } catch (error) {
    error = error.toString();
    ctx.body = responseStatus(400, error || "操作失败!");
  }
}
export { createMenu, getMenu, updateMenu };
