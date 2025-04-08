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
    },
    {
      path: "/tool/drawTools",
      name: "DrawTools",
      component: () => import("@/vue/views/home/tool/drawTools/index.vue"),
      meta: { title: "画图工具", icon: "SetUp" }
    },
    {
      path: "/tool/screenRecord",
      name: "ScreenRecord",
      component: () => import("@/vue/views/home/tool/screenRecord/index.vue"),
      meta: { title: "屏幕录制", icon: "SetUp" }
    },
    {
      path: "/tool/kimi",
      name: "Kimi",
      component: () => import("@/vue/views/home/tool/kimi/index.vue"),
      meta: { title: "Kimi聊天", icon: "SetUp" }
    }
  ]
} as RouteRecordRawType;
