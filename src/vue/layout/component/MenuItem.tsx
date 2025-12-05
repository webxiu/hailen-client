import { PropType, defineComponent } from "vue";
import { useRouter } from "vue-router";
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
    console.log('item', item)
    const router = useRouter();

    function onToPath(item) {
      router.push({ path: item.path });
    }

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
          <span onClick={() => onToPath(item)}>{item.meta?.title  || item.name}</span>
        </el-menu-item>
      );
    };
  }
});

export default MenuItemComponent;
