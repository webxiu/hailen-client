<script setup lang="ts">
import { useConfig } from "./utils/hook";

defineOptions({ name: "Mxgraph" });

const { tableRef, columns, dataList } = useConfig();
</script>

<template>
  <div class="ui-h-100 flex-col flex-1 main main-content">
    <HxTable :dataList="dataList" :columns="columns" />
    <div class="ui-h-100">
      <iframe ref="iframeRef" id="iframe" width="100%" height="100%" src="/mxgraph-editor/www/index.html" style="border: 0" />
    </div>
  </div>
</template>
