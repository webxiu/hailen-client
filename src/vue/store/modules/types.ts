import { RouteRecordName } from "vue-router";
import { UserInfoType } from "@/api/user/types";
import { UserMenuItem } from "@/api/routes";

export type cacheType = {
  mode: string;
  name?: RouteRecordName;
};

export type positionType = {
  startIndex?: number;
  length?: number;
};

export type appType = {
  asyncRoutes: RouteConfigsTable[];
};

export type multiType = {
  path: string;
  name: string;
  meta: any;
  query?: Record<string, any>;
  params?: object;
};

export type setType = {
  title: string;
  fixedHeader: boolean;
  hiddenSideBar: boolean;
  tableConfigMenuRoutes: UserMenuItem[];
};

export type userType = {
  userInfo?: UserInfoType;
  roles?: Array<string>;
  verifyCode?: string;
  currentPage?: number;
};
