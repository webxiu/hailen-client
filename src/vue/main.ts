import "element-plus/dist/index.css";
import "./style/index.scss";
import "./assets/iconfont/iconfont.js";

import App from "./App.vue";
import ElementPlus from "element-plus";
import { createApp } from "vue";
import { registerComponents } from "@/vue/components";
import router from "@/vue/router";
import { setupStore } from "@/vue/store";

const app = createApp(App);

function setGlobalVariables() {
  return new Promise<typeof $$>((resolve) => {
    window.onload = function () {
      window.$$ = window.electronAPI?.getGlobal();
      resolve(window.$$);
    };
  });
}

setGlobalVariables().then((res) => {
  app.config.globalProperties.$$ = res;
  registerComponents(app);
  setupStore(app);
  app.use(ElementPlus);
  app.use(router);
  app.mount("#app");
});
