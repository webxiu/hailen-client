<script lang="tsx">
import { Document, Menu as IconMenu, Location, Setting } from "@element-plus/icons-vue";
import MenuItem from "./MenuItem.vue";
import { defineComponent, PropType } from "vue";
import { title } from "process";

interface Props {
  item: any;
  index: string;
}

// const props = defineProps<Props>();

const props = {
  loading: { type: Boolean, default: false },
  index: { type: String, default: "" },
  item: { type: Object as PropType<any>, default: () => ({}) }
};

export default defineComponent({
  props: props,
  emits: ["submit", "reset", "change"],
  setup(props, { emit, expose, attrs, slots }) {
    const { index, item } = props;
    return () => {
      const slots = {
        title: () => (
          <>
            {/* {renderIcon(item[options.icon!])} */}
            <span class="title">{item.meta.title}66</span>
          </>
        )
      };
      return item.children ? (
        <el-sub-menu index={index} v-slots={slots}>
          {/* <span>{item.meta.title}==</span>
          {{ title: () => <span>{item.meta.title}</span> }} */}
          {item.children.map((cell: any) => (
            <MenuItem key={cell.path} item={cell} index={cell.path} />
          ))}
        </el-sub-menu>
      ) : (
        <el-menu-item index={index}>
          {/* <el-icon>
            <setting />
          </el-icon> */}
          <span>{item.meta.title}44</span>
        </el-menu-item>
      );
    };
  }
});
</script>

<style lang="scss" scoped>
.title {
  color: #f60;
}
</style>
