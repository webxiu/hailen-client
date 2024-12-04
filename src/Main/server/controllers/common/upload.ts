import type { File, Files } from "formidable";

import { Context } from "koa";
import fs from "fs";
import path from "node:path";
import { uploadDir } from "../../config/constant";

export const uploadController = async (ctx: Context) => {
  const newUser = ctx.request.body;
  ctx.status = 201;
  ctx.body = "newUser";
};
/**
 * Uploads an image and returns the URL of the uploaded image.
 *
 * @param {Context} ctx - The Koa context object.
 * @return {Promise<void>} - A promise that resolves when the image is uploaded and the response is sent.
 */

const subPath = "uploads";

export const uploadImg = async (ctx: Context) => {
  const files = ctx.request.files as Files;
  const fileArray = Array.isArray(files?.file) ? files.file : [files.file];
  const fileUrls = fileArray.map((file) => {
    const fileName = file.originalFilename || file.newFilename;
    const outputPath = path.join(uploadDir, subPath, fileName);
    // 接收读出流 创建写入流
    const reader = fs.createReadStream(file?.filepath as string);
    const stream = fs.createWriteStream(outputPath);
    stream.on("error", (err) => {
      console.error("保存出错:", err);
    });
    reader.pipe(stream); // 读取流写入流
    console.log("储存位置==>:", stream.path);
    // ctx.redirect(stream.path.substr(6).replace(/\\/g,'/')) // 5.重定向访问图片
    const fullUrl = `${ctx.protocol}://${ctx.host}/${subPath}/${fileName}`;
    return fullUrl;
  });
  ctx.body = { code: 0, message: "上传成功", data: fileUrls };
};
