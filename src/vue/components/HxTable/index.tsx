import { PropType, defineComponent, h } from "vue";

const props = {
  border: { type: String, required: false, default: "" }
};

export default defineComponent({
  props: props,
  name: "HxTable",
  emits: ["submit", "reset", "change"],
  setup(props, {}) {
    const { border } = props;
    const tableData = [
      { date: "2016-05-03", name: "Tom" },
      { date: "2016-05-02", name: "Tom" },
      { date: "2016-05-04", name: "Tom" },
      { date: "2016-05-01", name: "Tom" }
    ];
    const columns = [
      { label: "Date", prop: "date" },
      { label: "Name", prop: "name", align: "center" }
    ];
    return () => (
      <el-table data={tableData} border>
        {columns.map((item) => {
          return <el-table-column {...item} />;
        })}
      </el-table>
    );
  }
});
