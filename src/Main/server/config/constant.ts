import path from "node:path";

/** 设置上传文件的目录 */
export const uploadDir = path.join(__dirname, "../static");

/** Token密钥 */
export const secretKey = "your_secret_key";

/** Token过期时间 */
export const tokenExpireTime = "1h";

/** 不验证Token的白名单 */
export const whiteList = ["/user/login", "/user/register"];
