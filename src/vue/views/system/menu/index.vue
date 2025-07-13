<template>
  <div>
    用户
    <HxTable :dataList="dataList" :columns="columns">
      <template #query> 555 </template>
      <template #operation> 666 </template>
      <template #footer></template>
    </HxTable>
  </div>
</template>

<script setup lang="tsx">
import { ref, onMounted } from "vue";
import { menuList, updateMenu, UserItemType } from "@/vue/api/system";

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
    formatter: (data) => {
      console.log("data", data);
      return (
        <el-link type="primary" onClick={() => onEdit(data)}>
          {data.title}卧槽
        </el-link>
      );
    }
  }
]);
const dataList = ref<UserItemType[]>([]);

onMounted(() => {
  getTableList();
});

// 获取数据
function getTableList() {
  menuList({}).then(({ data }) => {
    dataList.value = data;
  });
}

function onEdit(row) {
  row.title = Date.now().toString().slice(-4);
  updateMenu(row);
}
</script>

<style scoped></style>
