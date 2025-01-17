import { Delete, Edit, Plus } from "@element-plus/icons-vue";
import { h, onMounted, reactive, ref } from "vue";

export const useConfig = () => {
  const tableRef = ref();
  const loading = ref<boolean>(false);
  const columns = ref<TableColumnList[]>([
    { label: "Date", prop: "date" },
    { label: "Name", prop: "name", align: "center" }
  ]);
  const dataList = ref<any[]>([
    { date: "2016-05-03", name: "Tom" },
    { date: "2016-05-02", name: "Tom" },
    { date: "2016-05-04", name: "Tom" },
    { date: "2016-05-01", name: "Tom" }
  ]);
  return {
    tableRef,
    columns,
    dataList,
    loading
  };
};
