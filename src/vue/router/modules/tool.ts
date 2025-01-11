import Layout from "@/vue/layout/index.vue";

export default {
  path: "/tool",
  component: Layout,
  redirect: "/tool/map",
  meta: { title: "工具", icon: "SetUp", order: 1 },
  children: [
    {
      path: "/tool/canvas",
      name: "ToolCanvas",
      component: () => import("@/vue/views/home/tool/canvas/index.vue"),
      meta: { title: "画布", icon: "Picture" }
    },
    {
      path: "/tool/map",
      name: "ToolMap",
      component: () => import("@/vue/views/home/tool/map/index.vue"),
      meta: { title: "地图", icon: "MapLocation" }
    },
    {
      path: "/tool/json2ts",
      name: "Json2TS",
      component: () => import("@/vue/views/home/tool/json2ts/index.vue"),
      meta: { title: "JSON转TS", icon: "SetUp" }
    }
  ]
} as RouteRecordRawType;
