/** ========================= 用户 ========================= */

/** 登录类型 */
export interface LoginInfoType {
  token: string;
  user: UserInfoType;
}
/** 登录类型 */
export interface UserInfoType {
  id: number;
  username: string;
  email: string;
  phone: string;
  created_at: string;
}
