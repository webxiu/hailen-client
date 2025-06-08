import { app } from "electron";
import createServer from "../server/app";
import { getJsonFiles } from "../utils/fs";

app.whenReady().then(() => {
  const config = {
    ...$$.AppInfo,
    host: $$.AppInfo.host || $$.env.VITE_BASE_URL,
    NODE_ENV: $$.NODE_ENV
  };

  console.log("===========config", config);
  createServer(config).then(() => {
    if (process.env.NODE_ENV === "development") {
      const jsonFiles = getJsonFiles($$.AppInfo.vuePagePath, (dir) => dir.endsWith("index.vue"));
      const result = jsonFiles.map((item) => {
        return { path: item.split($$.AppInfo.vuePagePath)[1].replace(/\\/g, "/").replace(".vue", "") };
      });
      console.log("=============================result", result);
    }
  });
});
