<template>
  <div>
    <el-button @click="isCollapse = !isCollapse">切换</el-button>
    <div>
      <el-menu :default-active="route.path" class="slide-menu" :collapse="isCollapse" @open="handleOpen" @close="handleClose">
        <MenuItem v-for="item in routeCateList" :item="item" :index="item.path" :key="item.path" />
      </el-menu>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { routeCateList } from "@/vue/router";
import MenuItem from "./MenuItem";
const isCollapse = ref(false);
const route = useRoute();
const handleOpen = (key: string, keyPath: string[]) => {
  // console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
</script>

<style>
.slide-menu:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
