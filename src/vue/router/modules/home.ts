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
    }
  ]
} as RouteRecordRawType;
