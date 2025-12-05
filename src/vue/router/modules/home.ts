/*
 * @Author: Hailen
 * @Date: 2025-09-25 09:53:24
 * @LastEditors: Hailen
 * @LastEditTime: 2025-12-04 18:31:23
 * @Description: 
 */
import Layout from "@/vue/layout/index.vue";

export default {
  path: "/",
  name: "Layout",
  component: Layout,
  redirect: "/home/dashboard/index",
  meta: { title: "首页", icon: "Monitor", order: 1 },
  children: [
    // 动态路由会通过 initRouter 添加到这里的 children 中
  ]
} as RouteRecordRawType;
