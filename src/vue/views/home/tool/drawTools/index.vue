<!--
 * @Author: Hailen
 * @Date: 2025-05-26 12:52:52
 * @LastEditors: Hailen
 * @LastEditTime: 2025-12-16 10:57:21
 * @Description: 
-->
<script setup lang="ts">
import { useConfig } from "./utils/hook";
import Mxgraph from "./mxgraph/Iframe.vue";

defineOptions({ name: "HomeToolDrawToolsIndex", title: "绘图工具" });

const { tableRef, columns, dataList } = useConfig();
</script>

<template>
  <div class="ui-h-100 flex-col flex-1 main main-content">
    <HxTable :dataList="dataList" :columns="columns" />
    <div class="ui-h-100">
      <Mxgraph />
    </div>
  </div>
</template>
