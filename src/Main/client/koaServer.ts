/*
 * @Author: Hailen
 * @Date: 2025-07-14 09:08:05
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-27 10:06:11
 * @Description:
 */
import { getRoutePaths } from "../utils/fs";

import { app } from "electron";
import axios from "axios";
import createServer from "../server/app";

function post(data, host) {
  axios.defaults.baseURL = host;
  axios
    .post("/system/menu/create", data)
    .then((response) => {
      console.log("保存路由:", response.data);
    })
    .catch((error) => {
      console.error("axios请求失败");
    });
}

app.whenReady().then(() => {
  const config = { ...$$.appInfo, host: $$.appInfo.host, NODE_ENV: $$.NODE_ENV };
  const pageObj = {
    vue: "src/vue/views",
    react: "src/react/pages"
  };
  const pagePath = $$.JoinCwd(pageObj["vue"]);

  createServer(config).then(() => {
    if (process.env.NODE_ENV === "development") {
      const excludes = ["notFound", "component", "components", "utils"]; // 排除目录
      const result = getRoutePaths(pagePath, excludes, (item) => item.endsWith("index.vue"));
      post({ menus: result }, config.host); 
    }
  });
});
