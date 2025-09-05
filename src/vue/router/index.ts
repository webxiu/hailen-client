import { RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { getUserInfo, removeUserInfo } from "@/vue/utils/storage";

import NProgress from "@/vue/utils/progress";
import { useTagStoreHook } from "@/vue/store/modules/tag";
import { initRouter } from "@/vue/router/utils";

/** 路由白名单 */
export const whiteList = ["/login", "/404"];

/** 公共全局路由 */
const commonRoute: RouteRecordRawType[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/vue/views/login/index.vue"),
    meta: { title: "用户登录", icon: "User", order: 0 }
  },
  {
    path: "/403",
    name: "Error403",
    component: () => import("@/vue/views/notFound/403.vue"),
    meta: { title: "无访问权限", icon: "Orange", order: 0 }
  },
  {
    path: "/:pathMatch(.*)",
    name: "Error404",
    component: () => import("@/vue/views/notFound/404.vue"),
    meta: { title: "页面找不到", icon: "Grape", order: 0 }
  }
];
// 动态加载
const modules: Record<string, any> = import.meta.glob(["./modules/home.ts", "!./modules/**/test.ts"], { eager: true });

// 路由模块列表
const routeList: Required<RouteRecordRawType>[] = [];
Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeList.push(...modList);
});

// 合并路由
export const asyncRoutes = []; // 动态路由
export const routeCateList = routeList.sort((a, b) => a.meta.order - b.meta.order);
export const routes = [...routeCateList, ...commonRoute, ...asyncRoutes] as RouteRecordRaw[];

const router = createRouter({
  history: createWebHashHistory("./"),
  routes: routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
});

// 路由拦截
router.beforeEach((to, from, next) => {
  NProgress.start();
  const loginInfo = getUserInfo();
  const title = to.meta?.title as string;
  if (title) document.title = title;

  function toCorrectRoute() {
    whiteList.includes(to.path) ? next(from.fullPath) : next();
  }
  if (loginInfo.token) {
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else if (from?.name) {
      console.log("from.name", from.name);
      addTagPath(to);
      next();
    } else {
      initRouter().then(() => {
        console.log("222", to.path);
        toCorrectRoute();
      });
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      removeUserInfo();
      next("/login");
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

function addTagPath(to) {
  useTagStoreHook().addTag(to);
}

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

/** 获取当前页面按钮级别的权限 */
function getAuths(): Array<string> {
  return router.currentRoute.value.meta.auths as Array<string>;
}

/** 是否有按钮级别的权限 */
export function hasAuth(value: string): boolean {
  if (!value) return false;
  /** 从当前路由的`meta`字段里获取按钮级别的所有自定义`code`值 */
  const metaAuths = getAuths();
  if (!metaAuths) return false;
  return metaAuths.includes(value);
}

export default router;
