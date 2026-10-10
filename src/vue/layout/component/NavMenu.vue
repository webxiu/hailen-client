<template>
  <div class="flex-co">
    <div v-if="navMenuList.length" class="menu-wrapper">
      <el-menu :default-active="activeMenu" class="slide-menu" :collapse="collapse" :router="true" @open="handleOpen" @close="handleClose">
        <MenuItem v-for="item in navMenuList" :item="item" :index="item.path" :key="item.path" />
      </el-menu>
    </div>
    <div v-else class="empty-menu">
      <el-empty description="暂无菜单数据" :image-size="80" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import MenuItem from "./MenuItem";
import { useAppStoreHook } from "@/vue/store/modules/app";

/** 侧边栏收起状态由父级（layout）通过 v-model:collapse 控制，logo 文字需同步隐藏 */
const collapse = defineModel<boolean>("collapse", { default: false });
const route = useRoute();

const navMenuList = computed(() => useAppStoreHook().getAsyncRoutes);

const activeMenu = computed(() => route.path);

watch(
  () => route.path,
  (newPath) => {
    console.log("路由变化，当前路径:", newPath);
  }
);

const handleOpen = (key: string, keyPath: string[]) => {
  // console.log("菜单展开:", key, keyPath);
};

const handleClose = (key: string, keyPath: string[]) => {
  // console.log("菜单收起:", key, keyPath);
};
</script>

<style lang="scss" scoped>
.menu-wrapper {
  flex: 1;
  overflow-y: auto;
  :deep(.el-menu) {
    background: transparent;
  }
}

.slide-menu:not(.el-menu--collapse) {
  width: 220px;
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
