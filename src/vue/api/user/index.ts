import { LoginInfoType, UserInfoType } from "./types";

import { User } from "@/Main/server/models/user/user";
import { http } from "@/vue/utils/http";

export type { LoginInfoType, UserInfoType };

/** 登录 */
export function login(data: Pick<User["user"], "email" | "password">) {
  return http.request<LoginInfoType>("post", "/user/login", { data });
}
/** 注册 */
export function register(data: User["user"]) {
  return http.request<Boolean>("post", "/user/register", { data });
}
