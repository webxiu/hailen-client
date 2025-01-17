import { PropType, defineComponent, h } from "vue";

const props = {
  border: { type: String, default: "" },
  dataList: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] }
};

export default defineComponent({
  props: props,
  name: "HxTable",
  emits: ["submit", "reset", "change"],
  setup(props, {}) {
    const { border } = props;
    return () => (
      <el-table data={props.dataList} border>
        {props.columns.map((item) => {
          return <el-table-column {...item} />;
        })}
      </el-table>
    );
  }
});
