/*
 * @Author: Hailen
 * @Date: 2023-07-24 08:41:09
 * @Last Modified by: Hailen
 * @Last Modified time: 2024-10-16 14:34:48
 */

import { ElMessage, ElMessageBox, FormRules, dayjs } from "element-plus";
import { h, reactive, ref } from "vue";

// import { Sheet2JSONOpts, read, readFile, utils } from "xlsx";

/** JSON字符串转换对象 */
export function toParse(str: string) {
  try {
    const parsed = JSON.parse(str || "{}");
    return parsed;
  } catch (e) {
    return {};
  }
}

/** 获取数据类型 */
export function getType(data: any) {
  return Object.prototype.toString.call(data).slice(8, -1).toLowerCase();
}

/** 路由地址转驼峰 */
export function toCamelCase(url: string) {
  return url
    .split("/")
    .filter(Boolean)
    .map((dir) => dir.charAt(0).toUpperCase() + dir.slice(1))
    .join("");
}

/** 时间格日期 */
export function formatDate(date: string | number, fmt = "YYYY-MM-DD HH:mm:ss") {
  return date ? dayjs(date).format(fmt) : "";
}

/**
 * 函数防抖
 * @param fn 处理函数
 * @param wait 等待时间
 */
export const debounce = (fn: Function, wait = 300) => {
  let timeout: NodeJS.Timeout;
  return (...arg: any) => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(fn.bind(null, ...arg), wait);
  };
};

/**
 * 函数节流
 * @param fn 处理函数
 * @param delay 间隔时间
 */
export const throttle = (fn: Function, delay = 300) => {
  let prev = Date.now();
  return (...args: any) => {
    const now = Date.now();
    if (now - prev >= delay) {
      fn.call(null, ...args);
      prev = Date.now();
    }
  };
};
