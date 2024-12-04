import Layout from "@/vue/layout/index.vue";

export default {
  path: "/system",
  component: Layout,
  redirect: "/system/menu",
  meta: { title: "系统管理", icon: "Setting", order: 3 },
  children: [
    {
      path: "/system/menu",
      name: "SystemMenu",
      component: () => import("@/vue/views/system/menuManage/index.vue"),
      meta: { title: "菜单管理", icon: "Menu" }
    },
    {
      path: "/system/user",
      name: "SystemUser",
      component: () => import("@/vue/views/system/userManage/index.vue"),
      meta: { title: "用户管理", icon: "UserFilled" }
    }
  ]
} as RouteRecordRawType;
