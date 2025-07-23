import { MenuItemType } from "@/Main/server/controllers/system/model";
import { UserInfoType } from "./types";
import { http } from "@/vue/utils/http";

export type {  UserInfoType, MenuItemType };

/** 获取菜单 */
export function menuList(params: Partial<MenuItemType>) {
  return http.request<MenuItemType[]>("get", "/system/menu/list", { params });
}
/** 修改菜单 */
export function updateMenu(data: Partial<MenuItemType>) {
  return http.request<MenuItemType[]>("post", "/system/menu/update", { data });
}
