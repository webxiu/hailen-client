/*
 * @Author: Hailen
 * @Date: 2025-08-29 09:04:51
 * @LastEditors: Hailen
 * @LastEditTime: 2025-12-05 11:15:58
 * @Description:
 */

import { RouteComponent, RouteRecordRaw, Router, RouterHistory, createWebHashHistory, createWebHistory } from "vue-router";
import { arrayToTree, toCamelCase } from "@/vue/utils/common";
import { isProxy, toRaw } from "vue";

import { menuList } from "@/vue/api/system";
import router from "./index";
import { useAppStoreHook } from "@/vue/store/modules/app";

// 动态路由
// https://cn.vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob("/src/vue/views/**/*.{vue,tsx}");

// 加载 home.ts 模块，获取 Layout 路由配置
const homeModule: Record<string, any> = import.meta.glob("./modules/home.ts", { eager: true });
const homeRouteConfig = homeModule["./modules/home.ts"]?.default as RouteRecordRaw;

// 路由初始化标志，防止重复初始化
let isRouterInitialized = false;
let initRouterPromise: Promise<{ router: Router; routes: RouteRecordRaw[] }> | null = null;

// 根据菜单地址获取路由组件(.vue文件)
function getRouteComponent(path: string) {
  const modulesRoutesKeys = Object.keys(modulesRoutes);
  const index = modulesRoutesKeys.findIndex((ev) => ev.includes(path));
  return modulesRoutes[modulesRoutesKeys[index]];
}

/**
 * 递归清理路由中的 component（移除 dirctory 类型的 component）
 * dirctory 类型不应该有 component，它们只是用来组织菜单结构的
 */
function cleanRouteComponent(route: any): any {
  if (!route) return route;

  const cleanedRoute = { ...route };

  // 如果是 dirctory 类型，移除 component
  if (cleanedRoute.type === "dirctory" && cleanedRoute.component) {
    delete cleanedRoute.component;
  }

  // 递归处理 children
  if (cleanedRoute.children && Array.isArray(cleanedRoute.children)) {
    cleanedRoute.children = cleanedRoute.children.map((child: any) => cleanRouteComponent(child));
  }

  return cleanedRoute;
}

/**
 * 递归查找第一个 menu 类型的路由
 */
function findFirstMenuRoute(routes: any[]): string | null {
  for (const route of routes) {
    if (route.type === "menu" && route.path) {
      return route.path;
    }
    if (route.children && route.children.length > 0) {
      const childPath = findFirstMenuRoute(route.children);
      if (childPath) {
        return childPath;
      }
    }
  }
  return null;
}

/** 获取接口菜单 */
const getAsyncRoutes = () => {
  return new Promise<RouteRecordRaw[]>((resolve) => {
    menuList({})
      .then(({ data }) => {
        console.log("接口返回的菜单数据:", data);
        const routeList = data.map((item) => {
          // 只给 menu 类型的路由添加组件
          // dirctory 类型不添加 component，避免页面递归嵌套
          if (item.type === "menu") {
            item.component = getRouteComponent(item.path);
          }
          // dirctory 类型不设置 component
          const { title, icon, createDate, ...rest } = item;
          const meta = { title, icon, keepAlive: true };
          return { ...rest, meta, redirect: "" };
        });

        const treeList = arrayToTree(routeList);

        // 清理所有 dirctory 类型的 component
        const cleanedTreeList = treeList.map((route: any) => cleanRouteComponent(route));

        // 设置动态路由到 store，供菜单组件使用
        useAppStoreHook().setAsyncRoutes(cleanedTreeList);
        console.log("处理后的路由树:", cleanedTreeList);
        resolve(cleanedTreeList);
      })
      .catch((error) => {
        console.error("获取菜单失败:", error);
        resolve([]);
      });
  });
};

/** 处理动态路由（后端返回的路由） */
function handleAsyncRoutes(routeList: RouteRecordRaw[]) {
  if (routeList.length === 0) {
    console.warn("没有动态路由需要添加");
    return;
  }

  // 查找 home.ts 定义的 Layout 路由（path 为 "/" 或 name 为 "Layout"）
  const layoutRoute = router.getRoutes().find((route) => (route.path === "/" && route.name === "Layout") || route.name === "Layout");

  if (layoutRoute && layoutRoute.name) {
    // 如果 Layout 路由存在，将所有动态路由添加到它的 children 中
    routeList.forEach((v: RouteRecordRaw) => {
      if (v?.name && !router.hasRoute(v.name)) {
        // 将动态路由添加到 Layout 路由的 children 中
        router.addRoute(layoutRoute.name!, v);
        console.log(
          "添加子路由到 Layout:",
          v.name,
          v.path,
          "children:",
          v.children?.map((c: any) => c.path)
        );
      }
    });

    // 更新 Layout 路由的 redirect 为第一个 menu 路由
    const firstMenuPath = findFirstMenuRoute(routeList as any[]);
    if (firstMenuPath) {
      // 更新 Layout 路由的 redirect
      const updatedLayoutRoute = router.getRoutes().find((route) => route.name === "Layout");
      if (updatedLayoutRoute) {
        updatedLayoutRoute.redirect = firstMenuPath;
        console.log("更新 Layout 路由的 redirect 为:", firstMenuPath);
      }
    }
  } else {
    // 如果 Layout 路由不存在，尝试从 home.ts 配置创建
    if (homeRouteConfig) {
      // 查找第一个 menu 路由作为默认 redirect
      const firstMenuPath = findFirstMenuRoute(routeList as any[]);

      // 将动态路由添加到 homeRouteConfig 的 children 中
      const layoutRouteWithChildren: RouteRecordRaw = {
        ...homeRouteConfig,
        name: homeRouteConfig.name || "Layout",
        redirect: firstMenuPath || homeRouteConfig.redirect || "/home/dashboard/index",
        children: [...(homeRouteConfig.children || []), ...routeList]
      };

      router.addRoute(layoutRouteWithChildren);
      console.log("创建 Layout 路由并添加子路由:", routeList.length, "个", "默认redirect:", layoutRouteWithChildren.redirect);
    } else {
      // 如果 home.ts 配置也不存在，作为顶级路由添加（不推荐）
      console.warn("未找到 Layout 路由配置，将动态路由作为顶级路由添加");
      routeList.forEach((v: RouteRecordRaw) => {
        if (v?.name && !router.hasRoute(v.name)) {
          router.addRoute(v);
          console.log("添加路由（顶级）:", v.name, v.path);
        }
      });
    }
  }
}

/** 初始化路由（`new Promise` 写法防止在异步请求中造成无限循环）*/
function initRouter() {
  // 如果正在初始化，返回同一个 Promise
  if (initRouterPromise) {
    return initRouterPromise;
  }

  // 如果已经初始化过，直接返回
  if (isRouterInitialized) {
    return Promise.resolve({ router, routes: useAppStoreHook().getAsyncRoutes });
  }

  initRouterPromise = new Promise<{ router: Router; routes: RouteRecordRaw[] }>((resolve) => {
    getAsyncRoutes().then((data) => {
      handleAsyncRoutes(data);
      isRouterInitialized = true;
      initRouterPromise = null;
      resolve({ router, routes: data });
    });
  });

  return initRouterPromise;
}

/** 重置路由初始化状态（用于退出登录等场景） */
function resetRouterInit() {
  isRouterInitialized = false;
  initRouterPromise = null;
}

export { initRouter, resetRouterInit };
