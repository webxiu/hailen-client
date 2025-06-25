import "element-plus/dist/index.css";
import "@/vue/style/index.scss";
import "@/vue/assets/iconfont/iconfont.js";
import "virtual:svg-icons-register";

import App from "./App.vue";
import ElementPlus from "element-plus";
import { createApp } from "vue";
import { registerComponents } from "@/vue/components";
import { registerDirective } from "@/vue/directives";
import router from "@/vue/router";
import { setupStore } from "@/vue/store";

const app = createApp(App);

function setGlobalVariables(callback) {
  electronAPI.on("Init_Event", (event, data) => {
    Reflect.set(window, "$$", data);
    callback(data);
  });
}

setGlobalVariables((res) => {
  app.config.globalProperties.$$ = res;
  registerComponents(app);
  registerDirective(app);
  setupStore(app);
  app.use(ElementPlus);
  app.use(router);
  app.mount("#app");
});
