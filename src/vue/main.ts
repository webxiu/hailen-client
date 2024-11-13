import "element-plus/dist/index.css";
import "./style/index.scss";

import App from "./App.vue";
import ElementPlus from "element-plus";
import { createApp } from "vue";
import router from "@/vue/router";

console.log("router", router);

const app = createApp(App);

app.use(ElementPlus);
app.use(router);

app.mount("#app");
