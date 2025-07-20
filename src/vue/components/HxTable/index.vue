<script lang="tsx">
import { PropType, defineComponent, h, ref, VNode, watch } from "vue";
import { ElPagination, ElTableColumn } from "element-plus";
import type { TableColumnCtx, PaginationProps } from "element-plus";

interface FormatterParams {
  row: any;
  column: TableColumnCtx<any>;
  cellValue: any;
  rowIndex: number;
  columnIndex?: number;
}

const props = {
  title: { type: String, default: "" },
  border: { type: String, default: "" },
  pagination: { type: Object as PropType<PaginationProps>, default: () => ({}) },
  dataList: { type: Array as PropType<any[]>, default: () => [] },
  columns: { type: Array as PropType<TableColumnList[]>, default: () => [] },
  loading: { type: Boolean, default: false },
  onSizeChange: { type: Function, default: () => {} },
  onCurrentChange: { type: Function, default: () => {} }
};

export default defineComponent({
  props: props,
  name: "HxTable",
  emits: ["submit", "reset", "change"],
  setup(props, { slots }) {
    watch(
      () => props,
      () => {
        console.log("props", props);
      },
      { deep: true }
    );

    function renderColumn(col, colIndex) {
      const formatter = (row, column, cellValue, rowIndex) => {
        if (!col.formatter) return h("span", { class: "hx-cell" }, cellValue);
        return col.formatter({ row, column, cellValue, rowIndex, colIndex });
      };
      return h(ElTableColumn, { ...col, key: col.prop, formatter }, slots);
    }

    function renderPagination(): VNode {
      const { onSizeChange, onCurrentChange } = props;
      return h(
        ElPagination,
        {
          ...props.pagination,
          // "current-page": props.pagination.page,
          "v-model:currentPage": props.pagination.page,
          "v-model:pageSize": props.pagination.pageSize,
          pageSize: props.pagination.pageSize,
          pageSizes: props.pagination.pageSizes || [30, 100, 200, 500, 1000],
          layout: "total, sizes, prev, pager, next, jumper",
          onSizeChange,
          onCurrentChange
        },
        slots
      );
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
            {props.columns.map(renderColumn)}
          </el-table>
        </div>
        <div className="hx-footer">
          <div className="hx-footer-left">
            <slot name="footerLeft">提示信息</slot>
          </div>
          <div className="hx-footer-right">
            <slot name="footerRight">{renderPagination() as any}</slot>
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
