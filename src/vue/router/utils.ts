/*
 * @Author: Hailen
 * @Date: 2025-08-29 09:04:51
 * @LastEditors: Hailen
 * @LastEditTime: 2026-04-16 11:38:53
 * @Description:
 */

import { RouteComponent, RouteRecordRaw, Router, RouterHistory, createWebHashHistory, createWebHistory } from "vue-router";
import { arrayToTree, toCamelCase } from "@/vue/utils/common";
import { isProxy, toRaw } from "vue";

import router from "./index";
import { menuList } from "@/vue/api/system";
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
  const matchKey = Object.keys(modulesRoutes).find((key) => key.endsWith(`${path}.vue`) || key.endsWith(`${path}/index.vue`));
  return matchKey ? modulesRoutes[matchKey] : null;
}

/**
 * 递归清理路由中的 component（移除 dirctory 类型的 component）
 * dirctory 类型不应该有 component，它们只是用来组织菜单结构的
 */
function cleanRouteComponent(route: any): any {
  if (!route) return route;

  const cleanedRoute = { ...route };

  if (cleanedRoute.type === "dirctory" && cleanedRoute.component) {
    delete cleanedRoute.component;
  }
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
        const routeList = data.map((item) => {
          if (item.type === "menu") {
            item.component = getRouteComponent(item.path);
          }
          const { title, icon, createDate, type, ...rest } = item;
          const meta = { title, type, icon: icon || "SetUp", keepAlive: true };
          return { ...rest, meta, redirect: "" };
        });
        const treeList = arrayToTree(routeList);
        const cleanedTreeList = treeList.map((route: any) => cleanRouteComponent(route));
        useAppStoreHook().setAsyncRoutes(cleanedTreeList);
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
  if (routeList.length === 0) return console.warn("没有动态路由需要添加");
  const layoutRoute = router.getRoutes().find((route) => route.path === "/");

  if (layoutRoute && layoutRoute.name) {
    routeList.forEach((v: RouteRecordRaw) => {
      if (v?.name && !router.hasRoute(v.name)) {
        router.addRoute(layoutRoute.name!, v);
      }
    });

    const firstMenuPath = findFirstMenuRoute(routeList as any[]);
    // 更新 Layout 路由的 redirect
    if (firstMenuPath) {
      const updatedLayoutRoute = router.getRoutes().find((route) => route.path === "/");
      if (updatedLayoutRoute) updatedLayoutRoute.redirect = firstMenuPath;
    }
  }
}

/** 获取菜单生产路由 */
function initRouter() {
  if (initRouterPromise) {
    return initRouterPromise;
  }

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
