import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import { PropType, defineComponent, h } from "vue";

import IconFont from "./IconFont.vue";

const props = {
  icon: { type: String as PropType<keyof typeof ElementPlusIconsVue>, required: true, default: "" }
};

export default defineComponent({
  props: props,
  name: "HxIcon",
  emits: ["submit", "reset", "change"],
  setup(props, {}) {
    const { icon } = props;
    const IconComponent = ElementPlusIconsVue[icon];
    return () => (IconComponent ? <el-icon>{h(IconComponent)}</el-icon> : h(IconFont, { iconClass: icon, style: { margin: "0 10px 0 5px", fontSize: "16px" } }));
  }
});
