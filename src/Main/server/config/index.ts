import { BaseResponseType } from "../types/index";

type StatusCode = 200 | 400 | 401 | 403 | 405 | 500;

// 函数重载声明
export function responseStatus<T = any>(status: StatusCode, message: string, data: T): BaseResponseType<T>;
export function responseStatus<T = any>(status: StatusCode, data: T): BaseResponseType<null>;
export function responseStatus<T = any>(data: T): BaseResponseType<T>;

/** 接口响应函数实现 */
export function responseStatus<T = any>(arg1: StatusCode | T, arg2?: string | T, arg3?: T): BaseResponseType<any> {
  if (typeof arg1 === "number" && typeof arg2 === "string" && arg3) {
    return { status: arg1, message: arg2, data: arg3 };
  } else if (typeof arg1 === "number" && arg2 && arg3 === undefined) {
    return { status: arg1, data: arg2, message: "操作成功" };
  } else if (typeof arg1 && arg2 === undefined) {
    return { status: 200, data: null, message: "操作成功" };
  } else {
    return { status: 400, data: null, message: "操作错误" };
  }
}
