import { App } from "vue";
import HxIcon from "@/vue/components/HxIcon";
import HxTable from "@/vue/components/HxTable";

const components = [
  { name: "HxIcon", component: HxIcon },
  { name: "HxTable", component: HxTable }
];

export function registerComponents(app: App) {
  components.forEach((component) => {
    app.component(component.name, component.component);
  });
}
