<script lang="tsx">
import { PropType, defineComponent, h, ref, VNode, watch, defineEmits, reactive } from "vue";
import { ElPagination, ElTableColumn } from "element-plus";
import type { TableColumnCtx } from "element-plus";
import defaultProps from "element-plus/es/components/table/src/table/defaults";

interface FormatterParams {
  row: any;
  column: TableColumnType;
  cellValue: any;
  rowIndex: number;
  columnIndex?: number;
}

const props = {
  // ...defaultProps, // 添加后就不会存在attrs里面了
  title: { type: String, default: "" },
  size: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<PaginationProp>, default: () => ({}) },
  dataList: { type: Array as PropType<any[]>, default: () => [] },
  columns: { type: Array as PropType<TableColumnType[]>, default: () => [] }
};

export default defineComponent({
  props: props,
  name: "HxTable",
  emits: ["update:page", "update:pageSize", "paginationChange"],
  setup(props, { attrs, slots, emit }) {
    const pagination = reactive({ ...props.pagination });

    watch(
      () => props,
      () => {
        console.log("props", props);
      },
      { deep: true }
    );

    // 改变页码
    function onCurrentChange(page) {
      pagination.page = page;
      emit("paginationChange", pagination);
    }

    // 改变每页条数
    function onSizeChange(pageSize) {
      pagination.pageSize = pageSize;
      emit("paginationChange", pagination);
    }

    // 渲染表格列
    function renderColumn(col: TableColumnType, colIndex) {
      const formatter = (row, column, cellValue, rowIndex) => {
        if (!col.render) return h("span", { class: "hx-cell" }, cellValue);
        return col.render({ row, column, cellValue, rowIndex, colIndex });
      };
      return h(ElTableColumn, { ...col, key: col.prop, formatter }, slots);
    }
    return () => (
      <div className="hx-table">
        <div className="hx-header">
          <div className="hx-header-left">{slots?.query ? (slots.query() as any) : <div>{props.title}</div>}</div>
          <div className="hx-header-right">{slots?.operation ? (slots.operation() as any) : null}</div>
        </div>
        <div className="hx-table">
          <el-table border row-key="id" show-overflow-tooltip {...attrs} data={props.dataList}>
            {props.columns.map(renderColumn)}
          </el-table>
        </div>
        <div className="hx-footer">
          <div className="hx-footer-left">
            <slot name="footerLeft">提示信息</slot>
          </div>
          <div className="hx-footer-right">
            <slot name="footerRight">
              <el-pagination
                {...props.pagination}
                v-model:current-page={pagination.page}
                v-model:page-size={pagination.pageSize}
                page-sizes={[30, 50, 200, 500, 1000]}
                size={props.size}
                layout="sizes, prev, pager, next"
                onSizeChange={onSizeChange}
                onCurrentChange={onCurrentChange}
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
