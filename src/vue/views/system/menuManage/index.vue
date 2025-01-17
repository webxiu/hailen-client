<template>
  <div>
    menuManage
    <HxTable :dataList="dataList" :columns="columns" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const columns = ref<TableColumnList[]>([
  { label: "Date", prop: "date" },
  { label: "Name", prop: "name", align: "center" }
]);
const dataList = ref<any[]>([
  { date: "2016-05-03", name: "Tom" },
  { date: "2016-05-01", name: "Tom" }
]);
</script>

<style scoped></style>
