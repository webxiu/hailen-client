import { User } from "@/Main/server/models/user/user";
import { http } from "@/vue/utils/http";

/** 登录 */
export function login(data: Pick<User, "email" | "password">) {
  return http.request<User[]>("post", "/user/login", { data });
}
/** 注册 */
export function register(data: User) {
  return http.request<User[]>("post", "/user/register", { data });
}
