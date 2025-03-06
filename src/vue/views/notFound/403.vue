<template>
  <div>
    403无权限
    <el-button type="primary" @click="onBack">返回首页</el-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();

function onBack() {
  router.push("/");
}
</script>

<style scoped></style>
