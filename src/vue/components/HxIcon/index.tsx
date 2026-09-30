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
    // 在渲染函数内读取 props.icon 并解析图标, 保证 :icon 动态绑定(setup 时解构会断开响应式, 图标不会随 prop 更新)
    return () => {
      const IconComponent = ElementPlusIconsVue[props.icon];
      return IconComponent ? <el-icon>{h(IconComponent)}</el-icon> : h(IconFont, { iconClass: props.icon, style: { margin: "0 10px 0 5px", fontSize: "16px" } });
    };
  }
});
