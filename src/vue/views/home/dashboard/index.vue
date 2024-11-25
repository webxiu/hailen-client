<template>
  <div>
    dashboard
    <el-button type="primary" @click="onClick">count is {{ count }}</el-button>
    <el-button type="primary" @click="onClick2">ping</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
const count = ref(0);
function onClick() {
  count.value++;
  // 向主进程发送消息
  // ipcRenderer.send("ping", "world");
  window.api.send("react", "world");
  console.log("window", window);
}
function onClick2() { 
  window.api.send("ping", "world"); 
}
</script>

<style scoped></style>
