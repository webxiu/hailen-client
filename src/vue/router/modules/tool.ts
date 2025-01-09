import Layout from "@/vue/layout/index.vue";

export default {
  path: "/tool",
  component: Layout,
  redirect: "/tool/map",
  meta: { title: "工具", icon: "SetUp", order: 1 },
  children: [
    {
      path: "/tool/map",
      name: "ToolMap",
      component: () => import("@/vue/views/home/tool/map/index.vue"),
      meta: { title: "地图", icon: "MapLocation" }
    }
  ]
} as RouteRecordRawType;
