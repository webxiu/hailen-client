<template>
  <div class="dashboard">
    dashboard
    <el-button type="primary" @click="onClick">count is {{ count }}</el-button>
    <el-button type="primary" @click="onClick2">ping</el-button>
    <el-button type="primary" @click="onGet">获取数据</el-button>
    <el-button type="primary" @click="onAdd">添加数据</el-button>
  </div>
</template>

<script setup lang="ts">
import { on } from "events";
import { ref } from "vue";
const count = ref(0);
import { addList, getList } from "@/vue/api/home/dashboard";
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
function onGet() {
  console.log("get");
  getList({ username: "" }).then((res) => {
    console.log("res", res);
  });
}

function onAdd() {
  console.log("add");
  addList({
    username: "张三",
    password: "123",
    email: "123@qq.com",
    phone: "1888888888"
  }).then((res) => {
    console.log("res", res);
  });
}
</script>

<style scoped></style>
