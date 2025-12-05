/*
 * @Author: Hailen
 * @Date: 2025-05-26 12:52:52
 * @LastEditors: Hailen
 * @LastEditTime: 2025-12-04 18:50:37
 * @Description:
 */

import { appType } from "./types";
import { defineStore } from "pinia";
import { store } from "@/vue/store";

export const useAppStore = defineStore({
  id: "app",
  state: (): appType => ({
    /** 后端返回的动态路由 */
    asyncRoutes: []
  }),
  getters: {
    getAsyncRoutes(state) {
      return state.asyncRoutes;
    }
  },
  actions: {
    setAsyncRoutes(asyncRoutes) {
      console.log("asyncRoutes", asyncRoutes);
      this.asyncRoutes = asyncRoutes;
    }
  }
});

export function useAppStoreHook() {
  return useAppStore(store);
}
