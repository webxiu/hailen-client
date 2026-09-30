<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowDown, Link, Monitor, SwitchButton } from "@element-plus/icons-vue";
import NavMenu from "./component/NavMenu.vue";
import HxIcon from "@/vue/components/HxIcon";
import { useRoute } from "vue-router";
// import { routes } from "@/router";
// import BackButton from "@/vue/components/BackButton/index.vue";
import Star from "@/vue/components/Star.vue";
import { useUserStore } from "@/vue/store/modules/user";
import Tag from "./component/Tag/index.vue";

defineOptions({ name: "Layout" });

const route = useRoute();
const useStore = useUserStore();
const names = ref<string[]>([]);
const theme = ref("light");

/** 侧边栏 logo(hash 路由下相对路径以 index.html 所在目录解析, dev 与打包后均指向 public 产物, 不走编译期资源导入) */
const logoSrc = "favicon/png/favicon_ch@2x.png";

/** 当前页面标题(取路由 meta.title) */
const pageTitle = computed(() => (route.meta?.title as string) || "工作台");

/**
 * 在vscode中打开
 */
const openInVScode = () => {
  const path = route.path;
  const codePath = "vscode://file/";
  const urlPath = !path.includes("index") ? `${path}/index` : path;
  const openURL = codePath + $$.appInfo.rootPath + `/src/vue/views${urlPath}.vue`;
  const newWindow = window.open(openURL, "在vscode中打开", "width=480,height=200,menubar=no,toolbar=no,location=no,status=no");
  const timer = setTimeout(() => {
    newWindow.close();
    clearTimeout(timer);
  }, 1500);
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

// 退出登录
function logout() {
  useStore.logOut();
}
</script>

<template>
  <!-- <Star /> -->
  <div class="layout">
    <!-- 侧边栏 -->
    <aside class="main-side flex-col">
      <div class="side-logo flex align-center">
        <img class="logo-img flex-shrink" :src="logoSrc" alt="logo" />
        <div class="logo-info no-wrap">
          <h1 class="logo-name">海阔天空</h1>
          <p class="logo-sub">WORK 办公系统</p>
        </div>
      </div>
      <div class="side-menu flex-1 ui-ovy-a">
        <NavMenu />
      </div>
    </aside>

    <!-- 主体区域 -->
    <div class="flex-col flex-1 ui-vh-100 ui-ov-h">
      <header class="main-header">
        <div class="head-view flex just-between align-center">
          <div class="head-title flex align-center">
            <el-icon :size="18"><Monitor /></el-icon>
            <span class="title-text ellipsis">{{ pageTitle }}</span>
          </div>
          <div class="head-tools flex align-center">
            <el-tooltip :content="theme === 'light' ? '切换深色模式' : '切换浅色模式'" placement="bottom">
              <span class="tool-btn flex just-center align-center pointer" @click="toggleTheme">
                <HxIcon :icon="theme === 'light' ? 'Sunny' : 'Moon'" />
              </span>
            </el-tooltip>
            <el-dropdown trigger="click" placement="bottom-end">
              <span class="head-user flex align-center pointer">
                <SvgIcon icon-class="user" />
                <el-icon class="user-arrow"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="openInVScode()">
                    <el-icon><Link /></el-icon>在VSCode中打开
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <Tag />
      </header>
      <main class="main-content flex-1">
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
      </main>
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

/* ===================== 侧边栏 ===================== */
.main-side {
  gap: 12px;
  padding: 16px 12px;
  border-right: 1px solid var(--el-border-color-light);

  .side-logo {
    gap: 10px;
    padding: 4px 8px;

    .logo-img {
      width: 36px;
      height: 36px;
      border-radius: 8px;
    }

    .logo-name {
      font-size: 16px;
      font-weight: 600;
      line-height: 1.2;
      color: var(--theme-color);
    }

    .logo-sub {
      margin-top: 2px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

/* ===================== 头部 ===================== */
.main-header {
  display: flex;
  flex-direction: column;
  padding: 10px 16px 0;

  .head-view {
    height: 40px;
  }

  .head-title {
    gap: 8px;
    color: var(--el-text-color-primary);

    .title-text {
      max-width: 40vw;
      font-size: 15px;
      font-weight: 600;
    }
  }

  .head-tools {
    gap: 8px;
  }

  .tool-btn {
    width: 32px;
    height: 32px;
    font-size: 17px;
    color: var(--el-text-color-primary);
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }
  }

  .head-user {
    gap: 6px;
    height: 32px;
    padding: 0 10px;
    color: var(--el-text-color-primary);
    border-radius: 16px;
    transition: background-color 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }

    .user-arrow {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

/* ===================== 内容区 ===================== */
.main-content {
  width: 100%;
  overflow-y: auto;
}
</style>
