import Layout from "@/vue/layout/index.vue";

export default {
  path: "/component",
  component: Layout,
  redirect: "/component/blendedSearch",
  meta: { title: "组件", icon: "Operation", rank: 3 },
  children: [
    {
      path: "/component/blendedSearch",
      name: "BlendedSearch",
      component: () => import("@/vue/components/HelloWorld.vue"),
      meta: { title: "组合查询框", icon: "Warning" }
    },
    {
      path: "/component/hxCalendar",
      name: "HxCalendar",
      component: () => import("@/vue/views/home/component/HxCalendar/index.vue"),
      meta: { title: "日历", icon: "Calendar" }
    }
  ]
} as RouteRecordRawType;
