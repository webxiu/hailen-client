// 全局路由类型声明

import type { RouteComponent, RouteRecordRaw, RouteLocationNormalized } from "vue-router";

declare global {
  interface ToRouteType extends RouteLocationNormalized {
    meta: CustomizeRouteMeta;
  }

  /** Meta配置 */
  interface RouteMeta {
    /** 菜单名称 */
    title: string;
    /** 菜单图标 `可选` */
    icon: string | FunctionalComponent | IconifyIcon;
    /** 是否在菜单中显示（默认`true`）`可选` */
    showLink?: boolean;
    /** 菜单升序排序，值越高排的越后（只针对顶级路由）`必填` */
    order: number;
  }

  /**
   * @description 路由列表项类型
   */
  interface RouteRecordRawType extends RouteRecordRaw {
    /** 路由地址 `必填` */
    path: string;
    /** 路由名字（保持唯一）`可选` */
    name?: string;
    /** `Layout`组件 `可选` */
    component?: RouteComponent;
    /** 路由重定向 `可选` */
    redirect?: string;
    meta?: RouteMeta;
    /** 子路由配置项 */
    children?: Array<Omit<RouteRecordRawType, "meta"> & { meta?: Omit<RouteMeta, "order"> }>;
    /** 菜单id */
    id?: number;
  }
}

// https://router.vuejs.org/zh/guide/advanced/meta.html#typescript
declare module "vue-router" {
  interface RouteMeta extends CustomizeRouteMeta {}
}
