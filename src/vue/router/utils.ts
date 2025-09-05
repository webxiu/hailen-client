/*
 * @Author: Hailen
 * @Date: 2025-08-29 09:04:51
 * @LastEditors: Hailen
 * @LastEditTime: 2025-09-05 14:01:33
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
  const routeKeys = Object.keys(modulesRoutes);
  const index = routeKeys.findIndex((ev) => ev.includes(path));
  return modulesRoutes[routeKeys[index]];
}

/** 获取接口菜单 */
const getAsyncRoutes = () => {
  return new Promise<RouteRecordRaw[]>((resolve) => {
    menuList({})
      .then(({ data }) => { 
        const routeList = data.map((item) => {
          // 菜单路由添加组件
          if (item.type === "menu") {
            item.component = getRouteComponent(item.path) ;
          }
          const { title, icon,name, createDate, ...rest } = item;
          const meta = { title: title || name, icon: icon || 'Monitor', keepAlive: true };
          return { ...rest, meta, redirect: "" };
        });

        const treeList = arrayToTree(routeList);
        // useAppStoreHook().setAsyncRoutes(treeList); // 设置动态路由
        resolve(routeList);
      })
      .catch(() => {
        resolve([]);
      });
  });
};

/** 1.处理动态路由（后端返回的路由） */
function handleAsyncRoutes(routeList: RouteRecordRaw[]) {
  const fullRoutes = [...routeList];
  console.log("router", router.options.routes);
  fullRoutes.map((v: RouteRecordRaw) => {
    // 防止重复添加路由
    if (router.options.routes[0].children.findIndex((value) => value.path === v.path) !== -1) {
      return;
    } else { 
      router.options.routes[0].children.push(v);
      // ascending(router.options.routes[0].children); // 最终路由进行升序
      if (!router.hasRoute(v?.name)) router.addRoute(v); 
    }
  });
  console.log("结果", router.getRoutes());
}

/** 初始化路由（`new Promise` 写法防止在异步请求中造成无限循环）*/
function initRouter() {
  return new Promise<{ router: Router; routes: RouteRecordRaw[] }>((resolve) => {
    getAsyncRoutes().then((data) => {
      handleAsyncRoutes(data);
      // if (cachingEnabled) storageSession().setItem(key, data);
      resolve({ router, routes: data });
    });
  });
}

export { initRouter };
