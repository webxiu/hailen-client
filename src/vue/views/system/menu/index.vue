<template>
  <div>
    用户
    <HxTable :dataList="dataList" :columns="columns" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { menuList, UserItemType } from "@/vue/api/system";

const columns = ref<TableColumnList[]>([
  { label: "菜单名称", prop: "title" },
  { label: "菜单路径", prop: "path" },
  { label: "菜单图标", prop: "icon" },
  { label: "创建时间", prop: "create_date" }
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
</script>

<style scoped></style>
