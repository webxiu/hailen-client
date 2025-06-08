import { app } from "electron";
import createServer from "../server/app";
import { getJsonFiles } from "../utils/fs";

app.whenReady().then(() => {
  const config = { ...$$.appInfo, host: $$.env.VITE_BASE_URL, NODE_ENV: $$.NODE_ENV };
  const pageObj = {
    vue: "src/vue/views",
    react: "src/react/pages"
  };
  const pagePath = $$.JoinCwd(pageObj["vue"]);

  createServer(config).then(() => {
    if (process.env.NODE_ENV === "development") {
      const jsonFiles = getJsonFiles(pagePath, (dir) => dir.endsWith("index.vue"));
      const result = jsonFiles.map((item) => {
        return { path: item.split(pagePath)[1].replace(/\\/g, "/").replace(".vue", "") };
      });
      console.log("=============================result", result);
    }
  });
});
