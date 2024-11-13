<template>
  <el-menu default-active="2" class="el-menu-vertical-demo" :collapse="isCollapse" @open="handleOpen" @close="handleClose">
    <template v-for="item in routeCateList" :index="item.path">
      <template v-if="!item.children">
        <el-sub-menu v-for="cell in item.children" index="1">
          <template #title>
            <el-icon><location /></el-icon>
            <span>Navigator One</span>
          </template>
          <el-menu-item-group>
            <template #title><span>Group One</span></template>
            <el-menu-item index="1-1">item one</el-menu-item>
            <el-menu-item index="1-2">item two</el-menu-item>
          </el-menu-item-group>
          <!-- <el-menu-item-group :title="cell.meta?.title">
            <el-menu-item :index="cell.path">{{ cell.meta?.title }}===</el-menu-item>
          </el-menu-item-group> -->
          <!-- <el-sub-menu index="1-4">
                <template #title><span>item four</span></template>
                <el-menu-item index="1-4-1">item one</el-menu-item>
              </el-sub-menu> -->
        </el-sub-menu>
      </template>
      <el-menu-item v-else :index="item.path">
        <el-icon><setting /></el-icon>
        <template #title>{{ item.meta?.title }}===</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { Document, Menu as IconMenu, Location, Setting } from "@element-plus/icons-vue";
import { routeCateList } from "@/vue/router";

const isCollapse = ref(true);

console.log("first", routeCateList);
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath);
};
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
