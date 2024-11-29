<template>
  <div class="dashboard">
    dashboard
    <el-button type="primary" @click="onClick">count is {{ count }}</el-button>
    <el-button type="primary" @click="onClick2">ping</el-button>
    <el-button type="primary" @click="onClick3">user:create</el-button>

    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }} ({{ user.email }})</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { User } from "@/Main/database";

const count = ref(0);

const users = ref<User[]>([]);

const loadUsers = async () => {
  try {
    users.value = await api.getAll();
    console.log("users", users.value);
  } catch (error) {
    console.error("加载用户列表失败:", error);
  }
};

const createUser = async (userData: Omit<User, "id">) => {
  try {
    await api.create(userData);
    await loadUsers();
  } catch (error) {
    console.error("创建用户失败:", error);
  }
};

onMounted(loadUsers);

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
function onClick3() {
  // window.api.create("user:create", "world");
  createUser({
    name: "Hailen Doe",
    email: "test@qq.com"
  });
}
</script>

<style scoped></style>
