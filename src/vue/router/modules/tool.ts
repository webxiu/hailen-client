import Layout from "@/vue/layout/index.vue";

export default {
  path: "/tool",
  component: Layout,
  redirect: "/tool/canvas",
  meta: { title: "工具", icon: "friends-o", order: 3 },
  children: [
    {
      path: "/tool/canvas",
      name: "ToolCanvas",
      component: () => import("@/vue/views/tool/canvas/index.vue"),
      meta: { title: "画板", icon: "xxx" }
    },
    {
      path: "/tool/transform",
      name: "ToolTransform",
      component: () => import("@/vue/views/tool/transform/index.vue"),
      meta: { title: "转换", icon: "xxx" }
    }
  ]
} as RouteConfigRawType;
