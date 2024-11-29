import { Context } from "koa";
import CryptoJS from "crypto-js";
import fs from "fs";
import path from "node:path";
import { responseStatus } from "../../config/index";
import { uploadDir } from "../../app";

const { exec, spawn } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

// MD5加密函数
function md5Encrypt(data) {
  return CryptoJS.MD5(data).toString();
}

// 接口数据转换
function getJsonData(body, outputPath) {
  const { apiUrl, baseURL, query, method, href, data } = body;
  const uniId = md5Encrypt(apiUrl);
  try {
    const localData = fs.readFileSync(outputPath, "utf-8") || "{}";
    const obj = JSON.parse(localData);
    const key = `${apiUrl}_${method}`;

    // start:分页格式数据判断(接口无数据, 返回本地)
    const data1 = data.data;
    if (Array.isArray(data1) && !data1.length) {
      const data2 = obj[key]?.data.data || [];
      data.data = data1.length >= data2.length ? data1 : data2;
    } else if (Array.isArray(data1.records) && !data1.records.length) {
      const data2 = obj[key]?.data?.data?.records || [];
      data.data.records = data1.records.length >= data2.length ? data1.records : data2;
    }
    // end

    // 需要返回空输入的接口
    const apiKeys = ["/sys/sys/menucolumngroup/select", "/sys/sys/usermenucolumn/select"];
    if (typeof data1 === "string" && !data1) {
      console.log("\n数据不存在:\n==接口地址:", apiUrl, "页面地址:", href, "\n");
      return {}; // 无数据不存储
    }
    if (apiKeys.includes(apiUrl)) data.data = []; // 返回空数组
    return { ...obj, [key]: { method, apiUrl, query, href, data } };
  } catch (error) {
    console.log("文件读取失败:", error);
    // 判断文件是否存在，不存在则创建
    if (!fs.existsSync(outputPath)) fs.writeFileSync(outputPath, "{}", "utf-8");
    return {};
  }
}

// /** ========== 获取接口数据 start ========== */
// (function (res) {
//   const { data, config } = res;
//   const { baseURL, url, method } = config;
//   const query = getUrlParameters(location.href);
//   const param = JSON.stringify({ apiUrl: url, baseURL, query, method, href: location.href, data: data });
//   fetch("http://192.168.2.202:3000/tool/getApiJsonData", { method: "POST", headers: { "Content-Type": "application/json" }, body: param })
//     .then((res) => res.json())
//     .then((res) => {
//       console.log("🏀响应拦截:", res);
//     })
//     .catch(console.log);
// })(response);
// /** ========== 获取接口数据 end ========== */

// 1.获取接口数据Json
export const getApiJsonData = async (ctx: Context) => {
  const body = ctx.request.body;
  const outputPath = path.join(uploadDir, "uploads", "api.json");
  const obj2 = getJsonData(body, outputPath);
  if (Object.keys(obj2).length === 0) {
    return (ctx.body = responseStatus(200, "暂无数据"));
  }
  fs.writeFileSync(outputPath, JSON.stringify(obj2, null, 2), "utf-8");
  ctx.body = responseStatus(200, `共${Object.keys(obj2).length}条接口数据`);
};

// 1.1获取移动端接口数据Json
export const getMobileApiJsonData = async (ctx: Context) => {
  const body = ctx.request.body;
  const outputPath = path.join(uploadDir, "uploads", "mobile.json");
  const obj2 = getJsonData(body, outputPath);
  if (Object.keys(obj2).length === 0) {
    return (ctx.body = responseStatus(200, "暂无数据"));
  }
  fs.writeFileSync(outputPath, JSON.stringify(obj2, null, 2), "utf-8");
  ctx.body = responseStatus(200, `共${Object.keys(obj2).length}条接口数据`);
};

// 2.打包项目(不能实时显示输出)
export const buildWeb = async (ctx: Context) => {
  const body = ctx.request.body;
  console.log("body", body);
  // 1.nginx 执行打包命令
  // exec("pnpm build", { cwd: "E:\\workspace\\workspace.web", encoding: "utf8" }, (error, stdout, stderr) => {
  //   console.log("error", error);
  //   if (error) {
  //     ctx.body = responseStatus(400, `打包失败: ${stderr}`);
  //     return;
  //   }
  //   ctx.body = responseStatus(200, `打包成功: ${stdout}`);
  // });

  // const sleep = (time) => new Promise((resolve) => setTimeout(resolve, time));
  // await sleep(1000 * 5);
  // ctx.body = responseStatus(200, "200");
  // return;
  // 2.windows 执行打包命令
  try {
    const { stdout, stderr } = await execAsync('"D:\\nodejs\\pnpm.cmd" build', { cwd: "E:\\workspace\\workspace.web", encoding: "utf8" });
    console.log(`成功输出: ${stdout}`);
    console.error(`失败输出: ${stderr}`);
    ctx.body = responseStatus(200, "打包成功", stdout);
  } catch (error) {
    console.error(`失败: ${error}`);
    ctx.body = responseStatus(400, "打包失败", error);
  }
};

const getRunningProcess = () => {
  return new Promise<string>((resolve, reject) => {
    const child = spawn("D:\\nodejs\\pnpm.cmd", ["build"], { cwd: "E:\\workspace\\workspace.web", encoding: "utf8" });
    child.stdout.on("data", (data) => {
      console.log(`实时输出: ${data}`);
      // ctx.body = responseStatus(200, "打包中", data); // 可以根据需要更新 ctx.body
    });

    child.stderr.on("data", (data) => {
      console.error(`错误输出: ${data}`);
    });

    child.on("close", (code) => {
      console.log(`子进程退出，代码: ${code}`);
      if (code === 0) {
        resolve("打包成功");
      } else {
        reject("打包失败" + code);
      }
    });
  });
};

let isBuild = false;
// 3.打包项目(不能实时显示输出)
export const buildWebProgress = async (ctx: Context) => {
  const body = ctx.request.body;
  console.log("body2", body);

  if (isBuild) {
    ctx.body = responseStatus(200, "项目打包中, 请稍后再试...", true);
    return;
  }

  try {
    isBuild = true;
    const code = await getRunningProcess();
    ctx.body = responseStatus(200, "打包成功", code); // 成功时的响应
  } catch (error) {
    ctx.body = responseStatus(400, "打包失败", `退出代码: ${error}`);
  } finally {
    isBuild = false;
  }
};
