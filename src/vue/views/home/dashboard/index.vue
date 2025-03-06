<template>
  <div class="dashboard">
    dashboard
    <el-button type="primary" @click="onClick">count is {{ count }}</el-button>
    <el-button type="primary" @click="onReact">React窗口</el-button>
    <el-button type="primary" @click="onPing">ping</el-button>
    <el-button type="primary" @click="onGet">获取数据</el-button>
    <el-button type="primary" @click="logout">退出登录</el-button>
    <Baidu />
    <div>
      <pre>
        <code>
          {{  JSON.stringify(userData, null, 2) }}
        </code>
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { addList, getList } from "@/vue/api/home/dashboard";
import { useUserStore } from "@/vue/store/modules/user";
import Baidu from "../component/Weather/Baidu.vue";

const useStore = useUserStore();
const count = ref(0);
const userData = ref([]);

onMounted(() => {
  onGet();
});

// 累加
function onClick() {
  count.value++;
}

// 创建react窗口
function onReact() {
  window.electronAPI.send("react", "world"); // 向主进程发送消息
}

// 发送消息
function onPing() {
  window.electronAPI.send("ping", "world");
}

// 获取数据
function onGet() {
  getList({ username: "123", email: "123@qq.com" }).then(({ data }) => {
    console.log("data", data);
    userData.value = data;
  });
}

// 退出登录
function logout() {
  useStore.logOut();
}
</script>

<style scoped></style>
