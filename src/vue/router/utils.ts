/*
 * @Author: Hailen
 * @Date: 2025-08-29 09:04:51
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-29 10:22:10
 * @Description:
 */
import { RouteComponent, RouteRecordRaw, Router, RouterHistory, createWebHashHistory, createWebHistory } from "vue-router";
import { isProxy, toRaw } from "vue";

import { menuList } from "@/vue/api/system";
import { arrayToTree, toCamelCase } from "@/vue/utils/common";

import router from "./index";

// 动态路由
// https://cn.vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob("/src/vue/views/**/*.{vue,tsx}");

// 根据菜单地址获取路由组件(.vue文件)
function getRouteComponent(path: string) {
  const modulesRoutesKeys = Object.keys(modulesRoutes);
  console.log("modulesRoutesKeys", modulesRoutesKeys);
  const index = modulesRoutesKeys.findIndex((ev) => ev.includes(path));
  return modulesRoutes[modulesRoutesKeys[index]];
}

/** 获取接口菜单 */
const getAsyncRoutes = () => {
  return new Promise<RouteRecordRaw[]>((resolve) => {
    menuList({})
      .then(({ data }) => {
        console.log("data1", data);
        const routeList = data.map((item) => {
          // 菜单路由添加组件
          if (item.type === "menu") {
            item.component = getRouteComponent(item.path);
          }
          const { title, icon, createDate, ...rest } = item; 
          const meta = { title, icon, keepAlive: true }; 
          return { ...rest, meta, redirect: "" };
        });

        const treeList = arrayToTree(routeList);
        // useAppStoreHook().setAsyncRoutes(treeList); // 设置动态路由
        resolve(treeList);
      })
      .catch(() => {
        resolve([]);
      });
  });
};

/** 初始化路由（`new Promise` 写法防止在异步请求中造成无限循环）*/
function initRouter() {
  return new Promise<{ router: Router; routes: RouteRecordRaw[] }>((resolve) => {
    getAsyncRoutes().then((data) => {
      console.log("data2", data );
      // handleAsyncRoutes(cloneDeep(data));
      // if (cachingEnabled) storageSession().setItem(key, data);
      resolve({ router, routes: data });
    });
  });
}

export { initRouter };
