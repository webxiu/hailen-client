import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import { PropType, defineComponent, h } from "vue";

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
    return () => <el-icon>{h(IconComponent)}</el-icon>;
  }
});
