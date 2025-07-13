import { LoginInfoType, UserInfoType } from "./types";
import { User, UserItemType } from "@/Main/server/controllers/user/model";

import { http } from "@/vue/utils/http";

export type { LoginInfoType, UserInfoType, UserItemType };

/** 获取菜单 */
export function menuList(params: Partial<UserItemType>) {
  return http.request<UserItemType[]>("get", "/system/menu/list", { params });
}
/** 修改菜单 */
export function updateMenu(data: Partial<UserItemType>) {
  return http.request<UserItemType[]>("post", "/system/menu/update", { data });
}
