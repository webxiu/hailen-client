<script setup lang="tsx">
import { ref, reactive, onMounted } from "vue";
import { menuList, updateMenu, UserItemType } from "@/vue/api/system";
import { QueryParamsType, SearchOptionType } from "@/vue/components/BlendedSearch/index.vue";

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
const queryParams = reactive({
  page: 1,
  pageSize: 3,
  title: "你看了",
  path: "是否"
});

const pagination = reactive({
  // page: queryParams.page,
  currentPage: queryParams.page,
  pageSize: queryParams.pageSize,
  total: 0
});

const columns = ref<TableColumnList[]>([
  {
    label: "菜单名称",
    prop: "title"
  },
  { label: "菜单路径", prop: "path" },
  { label: "菜单图标", prop: "icon" },
  { label: "创建时间", prop: "create_date" },
  {
    label: "操作",
    prop: "operation",
    formatter: ({ row }) => {
      return (
        <el-link type="primary" onClick={() => onEdit(row)}>
          {row.title}卧槽
        </el-link>
      );
    }
  }
]);
const dataList = ref<UserItemType[]>([]);

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

const onTagSearch = (v) => {
  console.log("v", v);
};
let timer = null;
// 获取数据
function getTableList() {
  menuList({}).then(({ data }) => {
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

function handleSizeChange(val: number) {
  console.log(`${val} items per page`);
}
function handleCurrentChange(val: number) {
  console.log(`current page: ${val}`);
}
</script>

<template>
  <div>
    用户
    <HxTable :dataList="dataList" :columns="columns" :pagination="pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange">
      <template #query>
        <BlendedSearch @tagSearch="onTagSearch" :queryParams="queryParams" :searchOptions="searchOptions" placeholder="请选择" searchField="search" :immediate="false" />
      </template>
      <template #operation> 666 </template>
      <template #footer></template>
    </HxTable>
  </div>
</template>

<style scoped></style>
