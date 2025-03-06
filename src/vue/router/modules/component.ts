import Layout from "@/vue/layout/index.vue";

export default {
  path: "/component",
  component: Layout,
  redirect: "/component/index",
  meta: { title: "组件", icon: "Operation", order: 3 },
  children: [
    {
      path: "/component/list",
      name: "ComponentList",
      component: () => import("@/vue/views/home/component/index.vue"),
      meta: { title: "组件列表", icon: "biaoge" }
    },
    {
      path: "/component/blendedSearch",
      name: "BlendedSearch",
      component: () => import("@/vue/components/HelloWorld.vue"),
      meta: { title: "组合查询框", icon: "biaoge" }
    },
    {
      path: "/component/hxCalendar",
      name: "HxCalendar",
      component: () => import("@/vue/views/home/component/HxCalendar/index.vue"),
      meta: { title: "日历", icon: "Calendar" }
    }
  ]
} as RouteRecordRawType;
