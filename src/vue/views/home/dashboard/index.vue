<template>
  <div class="dashboard">
    dashboard
    <el-button type="primary" @click="onClick">count is {{ count }}</el-button>
    <el-button type="primary" @click="onClick2">ping</el-button>
    <el-button type="primary" @click="onGet">获取数据</el-button>
    <el-button type="primary" @click="logout">退出登录</el-button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
const count = ref(0);
import { addList, getList } from "@/vue/api/home/dashboard";
import { useUserStore } from "@/vue/store/modules/user";

const useStore = useUserStore();

onMounted(() => {
  onGet();
});

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
  getList({ username: "123", email: "123@qq.com" }).then(({ data }) => {
    console.log("data", data);
  });
}

function logout() {
  useStore.logOut();
}
</script>

<style scoped></style>
