import { getJsonFiles, readFile } from "../utils/fs";

import { app } from "electron";
import axios from "axios";
import createServer from "../server/app";

function post(data, host) {
  axios.defaults.baseURL = host;
  axios
    .post("/system/menu/create", data)
    .then((response) => {
      console.log(8888, response.data);
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
      const jsonFiles = getJsonFiles(pagePath, (dir) => dir.endsWith("index.vue") && dir.indexOf("component") === -1);
      const result = jsonFiles.map((item) => {
        const code = readFile(item);
        const path = item.split(pagePath)[1].replace(/\\/g, "/").replace(".vue", "");
        const match = code.match(/defineOptions\s*\(\s*({[^}]*})\s*\)/);
        let option = {};
        if (match) {
          const optionsObject = match[1];
          try {
            option = eval(`(${optionsObject})`);
          } catch (e) {
            console.error("解析对象出错:", e);
          }
        }
        return { path, ...option };
      });
      post({ menus: result }, config.host);
      console.log("__filename:\n", __filename);
      console.log("====项目菜单路径:\n", result);
    }
  });
});
