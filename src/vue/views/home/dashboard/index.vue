<template>
  <div>
    dashboard
    <button type="button" @click="onClick">count is {{ count }}</button>
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
</script>

<style scoped></style>
