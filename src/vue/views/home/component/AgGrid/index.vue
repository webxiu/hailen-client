<script setup lang="tsx">
import { ref, defineComponent, withModifiers, reactive } from "vue";
import type { ColDef } from "ag-grid-community";
import { PAGE_CONFIG } from "@/vue/config/constant";

interface DataItemType {
  id: string;
  factory: string;
  model: string;
  price: number;
  sale: number;
  electric: string;
}

defineProps<{ msg: string }>();

const gridRef = ref();
const pagination = reactive<any>({ ...PAGE_CONFIG });

function generateCarData(count = 10) {
  // prettier-ignore
  const factories = ["特斯拉", "林肯", "福特", "宝马", "奥迪", "丰田", "奔驰", "大众", "保时捷", "兰博基尼"];
  // prettier-ignore
  const models = ["Model Y", "Model S", "F-Series", "Corolla", "X5", "A4", "GLA", "Passat", "Panamera", "Cayman"];
  // prettier-ignore
  const prices = [240000, 260000, 33850, 29600, 50000, 40000, 50000, 30000, 60000, 70000]; // 示例价格
  // prettier-ignore
  const saleRanges = [500, 1000, 2000, 3000, 4000, 5000, 6000, 70000, 10000, 20000]; // 销售量的范围
  const list = factories.map((_, i) => {
    const factory = factories[i];
    const model = models[i];
    const price = prices[i];
    const sale = saleRanges[i];
    const electric = Math.random() >= 0.5 ? "是" : "否";
    const id = (i + 1).toString();
    return { id, factory, model, price, sale, electric };
  });

  return list;
}

// 生成模拟数据
const mockCarData = generateCarData(10);
const rowData = ref<DataItemType[]>(mockCarData);

const columnDefs = ref<ColDef[]>([
  {
    field: "factory", // 字段
    headerName: "制造商", // 表头名称
    filter: "agSetColumnFilter", // 设置过滤
    enablePivot: true, // 是否开启透视(可在组件上配置)
    pivot: false, // 是否可添加到透视表
    hide: false, // 隐藏
    rowGroup: false, // 自动添加到分组
    enableRowGroup: true, // 是否可以拖拽到分组
    showRowGroup: false, // 是否显示分组标题
    sortable: true, // 是否可以排序
    editable: true, // 单元格是否可编辑
    checkboxSelection: true, // 显示复选框
    headerCheckboxSelection: true, // 标题全选
    headerCheckboxSelectionFilteredOnly: true, // 只选择被过滤的行
    rowDrag: (params) => true, // 可设置某行不拖拽
    valueFormatter: (params) => params.value // 自定义单元格
  },
  {
    field: "price",
    headerName: "价格",
    cellStyle: { textAlign: "left" },
    aggFunc: "sum",
    enableValue: true,
    pivot: true,
    editable: true
  },
  {
    field: "model",
    headerName: "型号",
    cellStyle: { textAlign: "left" },
    enableValue: true,
    enableRowGroup: true,
    // tooltipField: "model",
    maxWidth: 80
  },
  {
    field: "sale",
    headerName: "销量",
    cellStyle: { textAlign: "left" },
    aggFunc: "sum",
    // pivot: true,
    enableValue: true
  },
  { field: "electric", headerName: "纯电动", enableValue: true },
  {
    headerName: "操作",
    headerClass: "center", // left center right
    filter: false,
    hide: false,
    editable: false,
    checkboxSelection: false,
    suppressHeaderContextMenu: true,
    width: 100,
    pinned: "right",
    cellRenderer: defineComponent({
      render: (params) => {
        return (
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <button onClick={withModifiers(() => onRowEdit("edit", params), ["stop"])} style={{ marginRight: "10px" }}>
              修改
            </button>
            <button onClick={withModifiers(() => onRowEdit("delete", params), ["stop"])}>删除</button>
          </div>
        );
      }
    })
  }
]);

function onRowEdit(type, params) {
  console.log(type, params);
}

function getResult() {
  console.log("获取选中行", gridRef.value.getRef().getSelectedRows());
}

const selectAll = () => {
  gridRef.value.getRef().selectAll();
};
const deselectAll = () => {
  gridRef.value.getRef().deselectAll();
};
</script>

<template>
  <div>
    <button @click="getResult">获取数据</button>
    <button @click="selectAll">全选</button>
    <button @click="deselectAll">全不选</button>
    <AgGridTable ref="gridRef" rowKey="id" :rowData="rowData" :columnDefs="columnDefs" :height="300" :paginations="pagination" />
  </div>
</template>

<style scoped></style>
