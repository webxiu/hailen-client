/*
 * @Author: Hailen
 * @Date: 2024-09-12 14:34:28
 * @Last Modified by: Hailen
 * @Last Modified time: 2025-01-11 17:43:26
 */

import type { ColProps, RowProps } from "element-plus";
import { PropType, defineComponent, h, useSlots } from "vue";

import { useEleHeight } from "@/vue/hooks";

/** =================== 内容区域自适应布局容器 =================== */
/**
 * 布局容器
 */
export const Container = defineComponent({
  props: {
    height: { type: String, default: "100%" },
    offset: { type: Number, default: -20 }
  },
  setup(props) {
    const slots = useSlots();
    const maxHeight = useEleHeight(".main-content", props.offset);
    return () => (
      <div style={{ width: "100%", height: props.height, minHeight: maxHeight.value + "px", display: "flex", flexDirection: "column" }} {...props}>
        {slots.default?.() as any}
      </div>
    );
  }
});

/**
 * 行布局
 */
export const Row = defineComponent({
  props: {
    gutter: { type: Number, default: 0 },
    align: { type: String as PropType<RowProps["align"]>, default: "start" },
    justify: { type: String as PropType<RowProps["justify"]>, default: "" }
  },
  setup(props) {
    const slots = useSlots();
    const maxHeight = useEleHeight(".main-content");
    return () => (
      <div style={{ minHeight: maxHeight.value + "px" }}>
        <el-row {...props}>{slots.default?.()}</el-row>
      </div>
    );
  }
});

/**
 * 列布局(默认按2列布局)
 * @param xs <768px
 * @param sm ≥768px
 * @param md ≥992px
 * @param lg ≥1200px
 * @param xl ≥1920px
 * :xs="24" :sm="24" :md="12" :lg="12" :xl="12"
 */
export const Col = (props: Partial<ColProps>) => {
  const slots = useSlots();
  return (
    <el-col xs={24} sm={24} md={12} lg={12} xl={12} {...props}>
      {slots.default?.()}
    </el-col>
  );
};
