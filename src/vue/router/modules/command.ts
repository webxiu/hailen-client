import Layout from "@/vue/layout/index.vue";

export default {
  path: "/command",
  component: Layout,
  redirect: "/command/window",
  meta: { title: "快捷命令", icon: "Operation", order: 3 },
  children: [
    {
      path: "/command/window",
      name: "CommandWindow",
      component: () => import("@/vue/views/home/command/windows/index.vue"),
      meta: { title: "windows", icon: "biaoge" }
    }, 
    {
      path: "/command/mac",
      name: "CommandMac",
      component: () => import("@/vue/views/home/command/mac/index.vue"),
      meta: { title: "mac", icon: "biaoge" }
    }
  ]
} as RouteRecordRawType;
