<script setup lang="tsx">
import { ref, reactive, onMounted, watch } from "vue";
import { menuList, updateMenu, MenuItemType } from "@/vue/api/system";
import { arrayToTree } from "@/vue/utils/common";
import { QueryParamsType, SearchOptionType } from "@/vue/components/BlendedSearch/index.vue";

const formData = reactive({
  page: 1,
  pageSize: 30,
  name: "",
  title: "",
  path: "",
  createDate: ""
});

const queryParams = reactive({
  title: "Mac指令"
  // path: ""
});

const pagination = reactive<PaginationProp>({
  page: formData.page,
  pageSize: formData.pageSize,
  total: 0
});

const searchOptions = reactive<SearchOptionType[]>([
  { label: "标题", value: "title" },
  { label: "名称", value: "name" },
  { label: "路径", value: "path" },
  { label: "类型", value: "type" },
  { label: "创建时间", value: "createDate", type: "year", format: "YYYY" },
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
  { label: "名称", prop: "title" },
  { label: "名称", prop: "name" },
  { label: "路径", prop: "path" },
  { label: "图标", prop: "icon" },
  { label: "类型", prop: "type" }, 
  { label: "创建时间", prop: "createDate" },
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

const onTagSearch = (values) => {
  Object.assign(formData, values);
  console.log("搜索:", values);
  console.log("最新表单formData:", formData);
  getTableList();
};

// 获取数据
function getTableList() {
  menuList(formData).then(({ data }) => {
    pagination.total = data.length;
    console.log("data", data);
    const res = arrayToTree(data);
    dataList.value = res;
    console.log("res", res);

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
  formData.page = page;
  formData.pageSize = pageSize;
  getTableList();
}
</script>

<template>
  <div>
    用户
    <HxTable
      :dataList="dataList"
      v-model:page="formData.page"
      v-model:pageSize="formData.pageSize"
      row-key="id"
      :columns="columns"
      :pagination="pagination"
      @paginationChange="onPaginationChange"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
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
