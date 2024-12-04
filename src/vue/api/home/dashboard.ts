import { http } from "@/vue/utils/http";

/** 获取数据 */
export function getList(params: any) {
  return http.request<any[]>("get", "/home/dashboard", { params });
}
/** 提交数据 */
export function addList(data: any) {
  return http.request<any[]>("post", "/test/add", { data });
}
