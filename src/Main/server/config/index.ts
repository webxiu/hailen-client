import { BaseResponseType } from "../types/index";

export { tables } from "./tables";

type StatusCode = 200 | 400 | 401 | 403 | 405 | 500;

/** 接口响应函数实现 */
export function responseStatus<T = unknown>(status: StatusCode, data?: T, message?: string): BaseResponseType<T> {
  const msg = status === 200 ? message || "操作成功" : (data as string) || "操作失败";
  const _data = status === 200 ? data : null;
  return { status, data: _data, message: msg };
}

/** 输出打印颜色 */
export function printl(s1, s2, ...rest) {
  console.log(s1.bgYellow, s2.magenta, ...rest, "\n");
}
