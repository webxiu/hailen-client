<script setup lang="ts">
import { Transition, computed, reactive, ref } from "vue";
import NavMenu from "./component/NavMenu.vue";
import HxIcon from "@/vue/components/HxIcon";
// import { routes } from "@/router";
// import BackButton from "@/vue/components/BackButton/index.vue";
import Star from "@/vue/components/Star.vue";
import { useUserStore } from "@/vue/store/modules/user";
import Tag from "./component/Tag/index.vue";

const useStore = useUserStore();
const names = ref<string[]>([]);
const theme = ref("light");
const themeConfig = reactive([
  { label: "light", value: "light" },
  { label: "dark", value: "dark" }
]);

/**
 * 在vscode中打开
 */
const openInVScode = (path = "/system/menuManage/index") => {
  const codePath = "vscode://file/";
  const urlPath = !path.includes("index") ? `${path}/index` : path;
  const openURL = codePath + $$.appInfo.rootPath + `/src/vue/views${urlPath}.vue`;
  const newWindow = window.open(openURL, "在vscode中打开", "width=480,height=200,resizable=yes");
  const timer = setTimeout(() => {
    newWindow.close();
    clearTimeout(timer);
  }, 3000);
};

// 设置主题
function setTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  document.documentElement.setAttribute("class", themeName);
  theme.value = themeName;
  localStorage.setItem("theme", themeName);
}

// 切换主题
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(newTheme);
}

// 初始化主题（从localStorage读取或设置默认值）
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
}

initTheme();

function onChange(value) {
  setTheme(value);
}

// 退出登录
function logout() {
  useStore.logOut();
}
</script>

<template>
  <Star />
  <div class="layout">
    <div class="flex-col p-4">
      <div>logo <HxIcon icon="Setting" /></div>
      <div>
        <NavMenu />
      </div>
    </div>
    <div class="flex-col flex-1 ui-h-100 ui-ov-h">
      <div class="main-header">
        <div class="head-view">
          <div class="left">
            <SvgIcon icon-class="user" />
            <el-button type="primary" @click="openInVScode()">在VSCode中打开</el-button>
          </div>
          <div class="right">
            <el-select v-model="theme" @change="onChange" style="width: 140px">
              <el-option v-for="item in themeConfig" :key="item.value" :value="item.value">{{ item.label }}</el-option>
            </el-select>
            <el-button type="primary" @click="logout">退出登录</el-button>
          </div>
        </div>
        <Tag />
      </div>
      <div class="main-content flex-1">
        <router-view>
          <template #default="{ Component, route }">
            <!-- <BackButton /> -->
            <transition name="fade-transform" mode="out-in">
              <KeepAlive :exclude="names">
                <component :is="Component" :key="route.fullPath" />
              </KeepAlive>
            </transition>
          </template>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}
.main-header {
  padding: 10px;
  display: flex;
  flex-direction: column;
  .head-view {
    display: flex;
    justify-content: space-between;
  }
}
.main-content {
  width: 100%;
  overflow-y: auto;
}
</style>
