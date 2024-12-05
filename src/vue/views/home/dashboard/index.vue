<template>
  <div class="dashboard">
    dashboard
    <el-button type="primary" @click="onClick">count is {{ count }}</el-button>
    <el-button type="primary" @click="onReact">React窗口</el-button>
    <el-button type="primary" @click="onPing">ping</el-button>
    <el-button type="primary" @click="onGet">获取数据</el-button>
    <el-button type="primary" @click="logout">退出登录</el-button>
    <div id="tmap" style="width: 100%; height: 500px"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
const count = ref(0);
import { addList, getList } from "@/vue/api/home/dashboard";
import { useUserStore } from "@/vue/store/modules/user";
import { initMap } from "@/lib/map";

const useStore = useUserStore();

onMounted(() => {
  onGet();
  initMap();
});

// 累加
function onClick() {
  count.value++;
}

// 创建react窗口
function onReact() {
  window.api.send("react", "world"); // 向主进程发送消息
}

// 发送消息
function onPing() {
  window.api.send("ping", "world");
}

// 获取数据
function onGet() {
  getList({ username: "123", email: "123@qq.com" }).then(({ data }) => {
    console.log("data", data);
  });
}

// 退出登录
function logout() {
  useStore.logOut();
}
</script>

<style scoped></style>
