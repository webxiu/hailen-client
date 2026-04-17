<!--
 * @Author: Hailen
 * @Date: 2025-05-26 12:52:52
 * @LastEditors: Hailen
 * @LastEditTime: 2026-04-16 14:32:36
 * @Description: 
-->
<template>
  <div>
    404
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
