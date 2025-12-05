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
      // 登录后跳转到首页，等待路由初始化完成
      await initRouter();
      next({ path: "/" });
      NProgress.done();
    } else {
      // 初始化动态路由（只会在首次调用时执行）
      await initRouter();

      // 等待一个tick，确保路由完全注册
      await nextTick();

      // 额外等待一小段时间，确保路由完全注册到 Vue Router 内部
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 检查是否是动态路由路径（排除根路径和登录页）
      const isDynamicRoutePath = (to.path.startsWith("/home/") || to.path.startsWith("/system/")) && to.path !== "/" && to.path !== "/login";

      if (isDynamicRoutePath) {
        // 使用 router.resolve 来检查路由是否存在
        // 这是最可靠的方式，因为 Vue Router 会自动处理嵌套路由
        try {
          const resolved = router.resolve(to.path);

          // 打印调试信息
          console.log("路由解析结果:", {
            path: to.path,
            resolvedName: resolved.name,
            resolvedPath: resolved.path,
            resolvedMatched: resolved.matched?.map((r) => ({ name: r.name, path: r.path }))
          });

          // 如果解析到的路由是404，说明路由不存在
          if (resolved.name === "Error404") {
            console.warn("动态路由不存在，重定向到首页:", to.path);
            // 打印所有已注册的路由，用于调试
            const allRoutes = router.getRoutes();
            console.log(
              "当前所有路由:",
              allRoutes.map((r) => ({
                name: r.name,
                path: r.path,
                children: r.children?.map((c: any) => ({ name: c.name, path: c.path, children: c.children?.map((cc: any) => ({ name: cc.name, path: cc.path })) }))
              }))
            );
            next({ path: "/", replace: true });
            return;
          }
        } catch (error) {
          // 解析出错，重定向到首页
          console.warn("路由解析出错，重定向到首页:", to.path, error);
          next({ path: "/", replace: true });
          return;
        }
      }

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
