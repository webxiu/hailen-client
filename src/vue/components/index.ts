import { App } from "vue";
import HxIcon from "@/vue/components/HxIcon";

const components = [{ name: "HxIcon", component: HxIcon }];

export function registerComponents(app: App) {
  components.forEach((component) => {
    app.component(component.name, component.component);
  });
}
