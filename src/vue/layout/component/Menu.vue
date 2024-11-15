<template>
  <!-- <el-menu default-active="2" class="el-menu-vertical-demo" :collapse="isCollapse" @open="handleOpen" @close="handleClose">
    <el-sub-menu index="1">
      <template #title>
        <el-icon><location /></el-icon>
        <span>辅导费</span>
      </template>

      <el-sub-menu index="1-4">
        <template #title><span>速度</span></template>
        <el-menu-item index="1-4-1">电风扇</el-menu-item>
      </el-sub-menu>

      <el-menu-item index="22">
        <el-icon><setting /></el-icon>
        <template #title>8888</template>
      </el-menu-item>
      <el-menu-item index="234">
        <el-icon><setting /></el-icon>
        <template #title>8888</template>
      </el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="12">
      <template #title>
        <el-icon><location /></el-icon>
        <span>辅导费</span>
      </template>

      <el-sub-menu index="1-42">
        <template #title><span>速度</span></template>
        <el-menu-item index="1-42-1">电风扇</el-menu-item>
      </el-sub-menu>
      <el-menu-item index="45">
        <el-icon><setting /></el-icon>
        <template #title>好家伙</template>
      </el-menu-item>
    </el-sub-menu>

    <el-menu-item index="4">
      <el-icon><setting /></el-icon>
      <template #title>答复1</template>
    </el-menu-item> 
  </el-menu>-->

  <el-menu default-active="2" class="el-menu-vertical-demo" :collapse="isCollapse" @open="handleOpen" @close="handleClose">
    <MenuItem v-for="item in routeCateList" :item="item" :index="item.path" :key="item.path" />
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Document, Menu as IconMenu, Location, Setting } from "@element-plus/icons-vue";
import { routeCateList } from "@/vue/router";
import MenuItem from "./MenuItem.vue";

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
.el-menu-vertical-demo {
  width: 200px;
}
</style>
