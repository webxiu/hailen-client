<script setup lang="tsx">
import { ref, reactive, onMounted, watch } from "vue";
import { menuList, updateMenu, MenuItemType } from "@/vue/api/system";
import { QueryParamsType, SearchOptionType } from "@/vue/components/BlendedSearch/index.vue";
import type { PaginationProps } from "element-plus";

const formData = reactive({
  page: 1,
  pageSize: 3,
  title: "",
  path: "",
  create_date: ""
});

watch(
  formData,
  (value) => {
    console.log("表单数据:", value);
  },
  { deep: true }
);

const queryParams = reactive({
  title: "Mac指令",
  // path: ""
});

const pagination = reactive<PaginationProp>({
  page: formData.page,
  pageSize: formData.pageSize,
  total: 0
});

const searchOptions = reactive<SearchOptionType[]>([
  { label: "菜单名称", value: "title" },
  { label: "菜单路径", value: "path" },
  { label: "创建时间", value: "create_date", type: "year", format: "YYYY" },
  {
    label: "部门",
    value: "deptName",
    children: [
      { label: "部门名称", value: "deptName" },
      { label: "部门路径", value: "deptPath" }
    ]
  }
]);

const columns = ref<TableColumnType[]>([
  { label: "菜单名称", prop: "title" },
  { label: "菜单路径", prop: "path" },
  { label: "菜单图标", prop: "icon" },
  { label: "创建时间", prop: "create_date" },
  {
    label: "操作",
    prop: "operation",
    render: (data: RenderParamType<MenuItemType>) => {
      const { row } = data;
      return (
        <el-link type="primary" onClick={() => onEdit(row)}>
          {row.title}卧槽
        </el-link>
      );
    }
  }
]);
const dataList = ref<MenuItemType[]>([]);

const formConfigs = () => {
  return [
    { label: "菜单名称", prop: "title" },
    { label: "菜单路径", prop: "path" },
    { label: "菜单图标", prop: "icon" }
  ];
};

onMounted(() => {
  getTableList();
});

const onTagSearch = (values) => {
    Object.assign(formData, values);
  console.log("搜索:", values);
  console.log("最新表单formData:", formData);
  getTableList();
};
let timer = null;
// 获取数据
function getTableList() {
  menuList(formData).then(({ data }) => {
    dataList.value = data;
    pagination.total = data.length;
    // timer && clearInterval(timer);
    // timer = setInterval(() => {
    //   pagination.total++;
    //   pagination.page += 1;
    //   if (pagination.page > 5) pagination.page = 1;
    //   console.log("total", pagination);
    // }, 3000);
  });
}

function onEdit(row) {
  row.title = Date.now().toString().slice(-4);
  updateMenu(row);
}

function onPaginationChange({ page, pageSize }) {
  console.log(page, pageSize);
}
</script>

<template>
  <div>
    用户
    <HxTable
      :dataList="dataList"
      v-model:page="formData.page"
      v-model:pageSize="formData.pageSize"
      :columns="columns"
      :pagination="pagination"
      @paginationChange="onPaginationChange"
    >
      <template #query>
        <BlendedSearch @tagSearch="onTagSearch" :queryParams="queryParams" :searchOptions="searchOptions" placeholder="请选择" searchField="title" :immediate="true" />
      </template>
      <template #operation> 666 </template>
      <template #footer></template>
    </HxTable>
  </div>
</template>

<style scoped></style>
