<script setup lang="ts">
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import en from "element-plus/es/locale/lang/en";
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
  <el-config-provider :locale="zhCn" :message="{ max: 1 }">
    <router-view />
  </el-config-provider>
</template>

<style scoped></style>
