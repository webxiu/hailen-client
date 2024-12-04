import { Context } from "koa";
import fs from "fs";
import path from "node:path";
import { responseStatus } from "../../config/index";
import { uploadDir } from "../../config/constant";

export const download = async (ctx: Context) => {
  // const newUser = ctx.request.body;
  // ctx.status = 201;
  ctx.body = responseStatus(200, "数据下载成功");
};

// 获取App版本更新信息
export const getVersion = async (ctx: Context) => {
  const data = {
    version: "1.0.4",
    downloadUrl: "https://app.deogra.com/api/static/virtual/files/sys/application/apk/esop_install.apk",
    updateLog: "1.优化表格内容展示 2.指导书标题上方添加版本显示 3.修复断电启动时无法获取指导书!",
    forceUpdate: false, // 是否强制更新
    minTime: 1, // 最小时间
    maxTime: 3, // 最大时间
    timeType: "hour" // 时间单位:  min: 分 hour: 小时 day: 天
  };
  ctx.body = responseStatus(200, data);
};

// 获取Markdown文件内容
export const getMarkdown = async (ctx: Context) => {
  const enterPath = path.join(uploadDir, "README.md");
  const data = fs.readFileSync(enterPath, "utf-8");
  ctx.body = responseStatus(200, data);
};
