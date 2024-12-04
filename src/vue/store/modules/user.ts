import { LoginInfoType, UserInfoType, login } from "@/vue/api/user";
import { getUserInfo, removeCookie, removeUserInfo, setUserInfo } from "@/vue/utils/storage";

import { defineStore } from "pinia";
import router from "@/vue/router";
import { store } from "@/vue/store";
import { userType } from "./types";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    userInfo: getUserInfo()
  }),
  actions: {
    /** 更新用户信息 */
    updateUserInfo(userInfo: UserInfoType) {
      this.userInfo = userInfo;
    },
    /** 登录 */
    async userLogin(data: any) {
      return new Promise<LoginInfoType>((resolve, reject) => {
        login(data)
          .then(({ data }) => {
            setUserInfo(data);
            this.updateUserInfo(data.user);
            router.push({ path: "/" });
            resolve(data);
          })
          .catch((error) => reject(error));
      });
    },
    /** 前端登出（不调用接口） */
    async logOut() {
      router.push("/login?redirect=" + location.href.split("#")[1]);
      removeCookie();
      removeUserInfo();
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
