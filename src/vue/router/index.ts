import { RouteRecordRaw, createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { getUserInfo, removeUserInfo } from "@/vue/utils/storage";
import { nextTick } from "vue";

import NProgress from "@/vue/utils/progress";
import { useTagStoreHook } from "@/vue/store/modules/tag";
import { initRouter, resetRouterInit } from "@/vue/router/utils";

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
// 动态加载，只加载 home.ts 作为 Layout 路由配置
const modules: Record<string, any> = import.meta.glob(["./modules/home.ts"], { eager: true });

// 路由模块列表
const routeList: Required<RouteRecordRawType>[] = [];
Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const modList = Array.isArray(mod) ? [...mod] : [mod];
  routeList.push(...modList);
});

// 合并路由
export const asyncRoutes = []; // 动态路由
// 只加载 home.ts 作为基础 Layout 路由，动态路由会通过 initRouter 添加到它的 children 中
export const routeCateList = routeList.sort((a, b) => (a.meta?.order || 0) - (b.meta?.order || 0));
export const routes = [...commonRoute, ...routeCateList, ...asyncRoutes] as RouteRecordRaw[];

const router = createRouter({
  history: createWebHashHistory("./"),
  routes: routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
});

// 路由拦截
router.beforeEach(async (to, from, next) => {
  NProgress.start();
  const loginInfo = getUserInfo();
  const title = to.meta?.title as string;
  if (title) document.title = title;

  if (loginInfo.token) {
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else {
      await initRouter(); 

      // 正常情况，继续导航
      addTagPath(to);
      next();
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      removeUserInfo();
      resetRouterInit(); // 重置路由初始化状态
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
  resetRouterInit(); // 重置路由初始化状态
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
