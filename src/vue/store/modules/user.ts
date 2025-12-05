import { LoginInfoType, UserInfoType, login } from "@/vue/api/user";
import { getUserInfo, removeCookie, removeUserInfo, setUserInfo } from "@/vue/utils/storage";

import { defineStore } from "pinia";
import router, { resetRouter } from "@/vue/router";
import { store } from "@/vue/store";
import { userType } from "./types";
import { initRouter } from "@/vue/router/utils";

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
          .then(async ({ data }) => {
            setUserInfo(data);
            this.updateUserInfo(data.user);
            // 等待路由初始化完成后再跳转
            await initRouter();
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
      resetRouter(); // 重置路由
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
