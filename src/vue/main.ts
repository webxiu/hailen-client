import "element-plus/dist/index.css";
import "./style/index.scss";

import App from "./App.vue";
import ElementPlus from "element-plus";
import { createApp } from "vue";
import { registerComponents } from "@/vue/components";
import router from "@/vue/router";

console.log("router", router);

const app = createApp(App);

registerComponents(app);
app.use(ElementPlus);
app.use(router);

app.mount("#app");
