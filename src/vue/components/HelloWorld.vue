<script setup lang="ts">
import { ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);

function onClick() {
  count.value++;
  // 向主进程发送消息
  window.api.send("ping", "world");
  console.log("window", window);
}
function onClickReact() {
  // 向主进程发送消息
  window.api.send("react", "world");
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <el-button type="primary" @click="onClick">count is {{ count }}</el-button>
    <el-button type="primary" @click="onClickReact">打开react窗口</el-button>
    <p>555555555555555</p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
