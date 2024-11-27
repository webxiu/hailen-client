<template>
  <el-button @click="isCollapse = !isCollapse">切换</el-button>
  <el-menu default-active="2" class="slide-menu" :collapse="isCollapse" @open="handleOpen" @close="handleClose">
    <MenuItem v-for="item in routeCateList" :item="item" :index="item.path" :key="item.path" />
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { routeCateList } from "@/vue/router";
import MenuItem from "./MenuItem";
const isCollapse = ref(false);

console.log("first", routeCateList);
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
</script>

<style>
.slide-menu {
  width: 200px;
}
</style>
