/*
 * @Author: Hailen
 * @Date: 2025-07-14 09:08:05
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-29 10:09:09
 * @Description: 
 */

import { RouteComponent } from "vue-router";
export interface MenuItemType {
  id?: number;
  parentId?: number;
  name: string;
  title: string;
  path: string;
  icon?: string;
  /** 同级排序权重, 小者在前, 缺省 0 按扫描顺序 */
  sort?: number;
  type: string;
  component?: RouteComponent;
  createDate?: string;
}
