<script lang="tsx">
import { PropType, defineComponent, h, ref } from "vue";

const props = {
  title: { type: String, default: "" },
  border: { type: String, default: "" },
  dataList: { type: Array as PropType<any[]>, default: () => [] },
  columns: { type: Array as PropType<TableColumnList[]>, default: () => [] }
};

export default defineComponent({
  props: props,
  name: "HxTable",
  emits: ["submit", "reset", "change"],
  setup(props, { slots }) {
    const { border } = props;
    const currentPage4 = ref(4);
    const pageSize4 = ref(100);
    const size = ref("small");
    const disabled = ref(false);
    const background = ref(false);
    const showQuickJumper = ref(false);
    const showSizeChanger = ref(false);

    function handleSizeChange(val: number) {
      console.log(`${val} items per page`);
    }
    function handleCurrentChange(val: number) {
      console.log(`current page: ${val}`);
    }

    console.log("slots", slots);

    return () => (
      <div className="hx-table">
        <div className="hx-header">
          <div className="hx-header-left">{slots?.query ? (slots.query() as any) : <div>{props.title}</div>}</div>
          <div className="hx-header-right">{slots?.operation ? (slots.operation() as any) : null}</div>
        </div>
        <div className="hx-table">
          <el-table data={props.dataList} border>
            {props.columns.map((item) => {
              return <el-table-column {...item} />;
            })}
          </el-table>
        </div>
        <div className="hx-footer">
          <div className="hx-footer-left">
            <slot name="footerLeft">提示信息</slot>
          </div>
          <div className="hx-footer-right">
            <slot name="footerRight">
              <el-pagination
                v-model:current-page={currentPage4.value}
                v-model:page-size={pageSize4.value}
                pageSizes={[100, 200, 300, 400]}
                size={size.value}
                disabled={disabled.value}
                background={background.value}
                layout="total, sizes, prev, pager, next, jumper"
                total={400}
                onSizeChange={handleSizeChange}
                onCurrentChange={handleCurrentChange}
              />
            </slot>
          </div>
        </div>
      </div>
    );
  }
});
</script>

<style lang="scss" scoped>
@mixin flex-center() {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hx-table {
  width: 100%;
  .hx-header {
    @include flex-center();
    margin-bottom: 10px;
  }
  .hx-footer {
    @include flex-center();
    margin-top: 10px;
  }
}
</style>
