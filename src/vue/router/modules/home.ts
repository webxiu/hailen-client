/*
 * @Author: Hailen
 * @Date: 2025-09-05 13:52:55
 * @LastEditors: Hailen
 * @LastEditTime: 2025-09-05 14:05:56
 * @Description: 
 */
import Layout from "@/vue/layout/index.vue";

export default {
  path: "/",
  component: Layout,
  redirect: "/home/dashboard/index",
  meta: { title: "首页", icon: "Monitor", order: 1 },
  children: [
    // {
    //   path: "/home/dashboard/index",
    //   name: "HomeDashboard",
    //   component: () => import("@/vue/views/home/dashboard/index.vue"),
    //   meta: { title: "仪表盘", icon: "Odometer" }
    // }
  ]
} as RouteRecordRawType;
