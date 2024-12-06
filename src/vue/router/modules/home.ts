import Layout from "@/vue/layout/index.vue";

export default {
  path: "/",
  component: Layout,
  redirect: "/home/dashboard",
  meta: { title: "首页", icon: "Monitor", order: 1 },
  children: [
    {
      path: "/home/dashboard",
      name: "HomeDashboard",
      component: () => import("@/vue/views/home/dashboard/index.vue"),
      meta: { title: "仪表盘", icon: "Odometer" }
    },
    {
      path: "/home/user",
      name: "HomeUser",
      component: () => import("@/vue/views/home/user/index.vue"),
      meta: { title: "用户", icon: "User" }
    }
  ]
} as RouteRecordRawType;
