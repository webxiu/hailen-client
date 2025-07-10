<template>
  <div>
    用户
    <HxTable :dataList="dataList" :columns="columns" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { userList, UserItemType } from "@/vue/api/user";

const columns = ref<TableColumnList[]>([
  { label: "用户名", prop: "username" },
  { label: "邮箱", prop: "email" },
  { label: "手机号", prop: "phone" },
  { label: "创建时间", prop: "created_at" }
]);
const dataList = ref<UserItemType[]>([]);

onMounted(() => {
  getTableList();
});

// 获取数据
function getTableList() {
  userList({}).then(({ data }) => {
    dataList.value = data;
  });
}
</script>

<style scoped></style>
