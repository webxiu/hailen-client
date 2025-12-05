<template>
  <div class="nav-menu-container">
    <el-button @click="isCollapse = !isCollapse" class="collapse-btn">
      {{ isCollapse ? "展开" : "收起" }}
    </el-button>
    <div v-if="navMenuList.length" class="menu-wrapper">
      <el-menu
        :default-active="activeMenu"
        class="slide-menu"
        :collapse="isCollapse"
        :router="true"
        @open="handleOpen"
        @close="handleClose"
      >
        <MenuItem v-for="item in navMenuList" :item="item" :index="item.path" :key="item.path" />
      </el-menu>
    </div>
    <div v-else class="empty-menu">
      <el-empty description="暂无菜单数据" :image-size="80" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import MenuItem from "./MenuItem";
import { useAppStoreHook } from "@/vue/store/modules/app";

const isCollapse = ref(false);
const route = useRoute();

// 从 store 获取动态路由（菜单数据）
const navMenuList = computed(() => useAppStoreHook().getAsyncRoutes);

// 当前激活的菜单项
const activeMenu = computed(() => route.path);

// 监听路由变化，确保菜单高亮正确
watch(
  () => route.path,
  (newPath) => {
    console.log("路由变化，当前路径:", newPath);
  }
);

const handleOpen = (key: string, keyPath: string[]) => {
  console.log("菜单展开:", key, keyPath);
};

const handleClose = (key: string, keyPath: string[]) => {
  console.log("菜单收起:", key, keyPath);
};
</script>

<style scoped>
.nav-menu-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.collapse-btn {
  margin-bottom: 10px;
}

.menu-wrapper {
  flex: 1;
  overflow-y: auto;
}

.slide-menu:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
  border-right: none;
}

.empty-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}
</style>
