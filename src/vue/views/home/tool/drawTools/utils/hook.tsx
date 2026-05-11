import { Delete, Edit, Plus } from "@element-plus/icons-vue";
import { h, onMounted, reactive, ref } from "vue";

export const useConfig = () => {
  const tableRef = ref();
  const loading = ref<boolean>(false);
  const columns = ref<TableColumnType[]>([
    { label: "名称", prop: "name" },
    { label: "图片", prop: "url", align: "center" },
    {
      label: "操作",
      prop: "operation",
      render: (data: RenderParamType<Record<string, any>>) => {
        const { row } = data;
        return (
          <span>
            <el-link type="primary" onClick={() => onEdit(row)}>
              修改
            </el-link>
            <el-link type="danger" class="ml-8" onClick={() => onEdit(row)}>
              删除
            </el-link>
          </span>
        );
      }
    }
  ]);
  const dataList = ref<Record<string, any>[]>([
    { name: "2016-05-03", url: "Tom" },
    { name: "2016-05-02", url: "Tom" },
    { name: "2016-05-04", url: "Tom" },
    { name: "2016-05-01", url: "Tom" }
  ]);
  function onEdit(row: Record<string, any>) {
    console.log(row);
  }
  return { tableRef, columns, dataList, loading };
};
