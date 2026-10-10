/*
 * @Author: Hailen
 * @Date: 2025-09-05 14:02:55
 * @LastEditors: Hailen
 * @LastEditTime: 2025-12-16 11:59:05
 * @Description:
 */
import { PropType, defineComponent } from "vue";
import HxIcon from "@/vue/components/HxIcon";

const props = {
  loading: { type: Boolean, default: false },
  index: { type: String, default: "" },
  item: { type: Object as PropType<any>, default: () => ({}) }
};

// 定义递归组件类型
const MenuItemComponent = defineComponent({
  props: props,
  emits: ["submit", "reset", "change"],
  setup(props, { emit, expose, attrs, slots }) {
    const { index, item } = props;

    // 菜单导航统一由 el-menu 的 router 模式处理(:router="true" 时点击 el-menu-item 自动 push index),
    // 此处不再重复 push, 避免同一次点击触发两次导航(后一次取消前一次, 懒加载页面被重复解析)
    return () => {
      const slots = {
        title: () => (
          <>
            <HxIcon icon={item.meta?.icon} />
            <span class="title">{item.meta?.title || item.name}</span>
          </>
        )
      };
      return item.children && item.children.length > 0 ? (
        <el-sub-menu index={index} v-slots={slots}>
          {item.children.map((cell: any) => (
            <MenuItemComponent key={cell.path} item={cell} index={cell.path} />
          ))}
        </el-sub-menu>
      ) : (
        <el-menu-item index={index}>
          <HxIcon icon={item.meta?.icon} />
          <span>{item.meta?.title || item.name}</span>
        </el-menu-item>
      );
    };
  }
});

export default MenuItemComponent;
