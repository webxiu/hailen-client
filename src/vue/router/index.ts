import { RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { getLoginInfo, removeLoginInfo } from "@/vue/utils/storage";

import NProgress from "@/vue/utils/progress";

const Layout = () => import("@/vue/layout/index.vue");
/** 路由白名单 */
export const whiteList = ["/login", "/404"];

// 公共全局路由
const commonRoute: RouteRecordRawType[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/vue/views/login/index.vue"),
    meta: { title: "用户登录" }
  },
  {
    path: "/403",
    name: "Error403",
    component: () => import("@/vue/views/notFound/403.vue"),
    meta: { title: "无访问权限" }
  },
  {
    path: "/:pathMatch(.*)",
    name: "Error404",
    component: () => import("@/vue/views/notFound/404.vue"),
    meta: { title: "页面找不到" }
  }
];
// 动态加载
const modules: Record<string, any> = import.meta.glob(["./modules/**/*.ts", "!./modules/**/test.ts"], { eager: true });

// 路由模块列表
const routeList: RouteRecordRawType[] = [];
Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeList.push(...modList);
});

// 动态路由
export const asyncRoutes = [];
export const routeCateList = [...routeList].sort((a: any, b: any) => a.meta?.order - b.meta?.order);

export const routes = [...commonRoute, ...routeList, ...asyncRoutes] as RouteRecordRaw[];

const router = createRouter({
  history: createWebHistory("./"),
  routes: routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
});

// 路由拦截
router.beforeEach((to, from, next) => {
  NProgress.start();
  const title = to.meta?.title as string;
  const loginInfo = getLoginInfo();
  console.log("loginInfo", loginInfo);

  if (loginInfo.token) {
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else {
      next();
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      removeLoginInfo();
      next("/login");
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

// 重置路由
export function resetRouter() {
  const WHITE_NAME_LIST = ["Login"];
  router.getRoutes().forEach((route) => {
    const { name } = route;
    if (name && !WHITE_NAME_LIST.includes(name as string)) {
      router.hasRoute(name) && router.removeRoute(name);
    }
  });
}

export default router;
