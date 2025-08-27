<!--
 * @Author: Hailen
 * @Date: 2025-05-26 12:52:52
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-26 18:10:06
 * @Description: 
-->
<script setup lang="ts">
import { useConfig } from "./utils/hook";
import Mxgraph from "./mxgraph/Iframe.vue";

defineOptions({ name: "Mxgraph" });

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
