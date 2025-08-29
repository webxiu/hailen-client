import { LoginInfoType, UserInfoType } from "./types";
import { User, UserItemType } from "@/Main/server/controllers/user/model";

import { http } from "@/vue/utils/http";

export type { LoginInfoType, UserInfoType, UserItemType };

/** 登录 */
export function login(data: Pick<User["user"], "email" | "password">) {
  return http.request<LoginInfoType>("post", "/user/login", { data });
}
/** 注册 */
export function register(data: User["user"]) {
  return http.request<Boolean>("post", "/user/register", { data });
}
/** 获取用户 */
export function userList(params: Partial<UserItemType>) {
  return http.request<UserItemType[]>("get", "/user/list", { params });
}
