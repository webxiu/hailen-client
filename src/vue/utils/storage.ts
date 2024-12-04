import { LoginInfoType, UserInfoType } from "@/vue/api/user";

import Cookies from "js-cookie";
import { toParse } from "@/vue/utils/common";

const TOKEN_KEY = "Token";
const COOKIE_KEY = "Cookie";
const USER_INFO = "User_Info";

/** ==================================  存储Cookie  ================================== */
/**
 * 获取Cookie
 */
export const getCookie = () => {
  return Cookies.get(COOKIE_KEY) || "";
};

/**
 * 设置Cookie
 * @param cookie cookie
 */
export const setCookie = (cookie: string, days: number) => {
  Cookies.set(COOKIE_KEY, cookie, { expires: days }); // 设置有效期
};

/**
 * 移除Cookie
 */
export const removeCookie = () => {
  Cookies.remove(COOKIE_KEY);
};

/** ==================================  存储用户信息  ================================== */
/**
 * 获取用户信息(包含权限列表)
 */
export const getUserInfo = (): LoginInfoType => {
  return JSON.parse(localStorage.getItem(USER_INFO) || "{}");
};

/**
 * 设置用户信息
 * @param userInfo 用户信息
 */
export const setUserInfo = (userInfo: LoginInfoType) => {
  localStorage.setItem(USER_INFO, JSON.stringify(userInfo));
};

/**
 * 移除用户信息
 */
export const removeUserInfo = () => {
  localStorage.removeItem(USER_INFO);
};

/** ==================================  存储悬浮按钮位置  ================================== */
export interface PositionType {
  top: number;
  left: number;
}
/**
 * 获取悬浮按钮位置
 * @param key 存储Key
 */
export const getSuspendPosition = (key: string): PositionType => {
  return JSON.parse(localStorage.getItem(key) || "{}");
};

/**
 * 设置悬浮按钮位置
 * @param key 存储Key
 * @param position 用户信息
 */
export const setSuspendPosition = (key, position: PositionType) => {
  localStorage.setItem(key, JSON.stringify(position));
};
