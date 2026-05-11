<template>
  <div class="ui-h-100 flex-col flex-1 main main-content">
    <HxTable :dataList="dataList" :columns="columns" />
    <div class="ui-h-100">
      <Mxgraph />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useConfig } from "./utils/hook";
import Mxgraph from "./mxgraph/Iframe.vue";

defineOptions({ name: "HomeToolDrawToolsIndex", title: "绘图工具" });

const { tableRef, columns, dataList } = useConfig();
</script>
