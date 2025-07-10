import AgGridTable from "@/vue/components/AgGridTable/index.vue";
import { App } from "vue";
import BlendedSearch from "@/vue/components/BlendedSearch/index.vue";
import ButtonList from "@/vue/components/ButtonList/index.vue";
import HxIcon from "@/vue/components/HxIcon";
import HxSearchHighlight from "@/vue/components/HxSearchHighlight/index.vue";
import HxTable from "@/vue/components/HxTable/index.vue";
import HxUploadButton from "@/vue/components/HxUploadButton/index.vue";
import SvgIcon from "@/vue/components/SvgIcon/index.vue";

const components = [
  { name: "HxIcon", component: HxIcon },
  { name: "SvgIcon", component: SvgIcon },
  { name: "HxTable", component: HxTable },
  { name: "ButtonList", component: ButtonList }, // 表格操作按钮
  { name: "HxUploadButton", component: HxUploadButton }, // 上传
  { name: "AgGridTable", component: AgGridTable }, // Ag-Grid表格
  { name: "BlendedSearch", component: BlendedSearch }, // 搜索查询
  { name: "HxSearchHighlight", component: HxSearchHighlight } // 搜索高亮
];

export function registerComponents(app: App) {
  components.forEach((component) => {
    app.component(component.name, component.component);
  });
}
