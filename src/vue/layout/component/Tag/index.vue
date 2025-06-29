<script setup lang="ts">
import HxIcon from "@/vue/components/HxIcon";
import { tr } from "element-plus/es/locale";
import { ref, reactive, unref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
const tabDom = ref();
const scrollbarDom = ref();
const translateX = ref(0);
const isShowArrow = ref(true);
const route = useRoute();
const router = useRouter();

const tagsViews = reactive<Array<any>>([
  { icon: "RefreshRight", text: "重新加载", divided: false, disabled: false, show: true },
  { icon: "Close", text: "关闭当前标签页", divided: false, disabled: false, show: true },
  { icon: "Back", text: "关闭左侧标签页", divided: true, disabled: false, show: true },
  { icon: "Right", text: "关闭右侧标签页", divided: false, disabled: false, show: true },
  { icon: "ScaleToOriginal", text: "关闭其他标签页", divided: true, disabled: false, show: true },
  { icon: "Finished", text: "关闭全部标签页", divided: false, disabled: false, show: true },
  { icon: "FullScreen", text: "全屏", divided: true, disabled: false, show: true },
  { icon: "FullScreen", text: "内容全屏", divided: false, disabled: false, show: true }
]);

const tags = new Array(30).fill(0).map((item, index) => {
  index++;
  return {
    name: `Home${index}`,
    path: `/workbench/home${index}`,
    meta: {
      title: "标题" + index,
      icon: "icon-gongzuotai",
      keepAlive: true
    },
    id: index,
    query: {
      menuCode: "16",
      from: "/productMkCenter",
      menuId: "146",
      menuName: "李会计"
    }
  };
});

const multiTags = ref(tags);

const handleScroll = (offset: number): void => {
  tabDom.value.style.transition = "transform 0.5s ease-in-out";

  const scrollbarDomWidth = scrollbarDom.value ? scrollbarDom.value?.offsetWidth : 0;
  const tabDomWidth = tabDom.value ? tabDom.value.offsetWidth : 0;
  if (offset > 0) {
    translateX.value = Math.min(0, translateX.value + offset);
  } else {
    if (scrollbarDomWidth < tabDomWidth) {
      if (translateX.value >= -(tabDomWidth - scrollbarDomWidth)) {
        translateX.value = Math.max(translateX.value + offset, scrollbarDomWidth - tabDomWidth);
      }
    } else {
      translateX.value = 0;
    }
  }
  tabDom.value.style.transform = `translateX(${translateX.value}px)`;
};

function onWheel(ev) {
  ev.preventDefault();
  const scrollbarDomWidth = scrollbarDom.value ? scrollbarDom.value?.offsetWidth : 0;
  const tabDomWidth = tabDom.value ? tabDom.value.offsetWidth : 0;
  const scrollWidth = tabDomWidth - scrollbarDomWidth;
  const x = ev.deltaY; // 计算鼠标滚动的距离
  tabDom.value.style.transition = "none"; // 消除tabDom的动画
  if (scrollbarDomWidth < tabDomWidth) {
    if (translateX.value >= -scrollWidth) {
      translateX.value = Math.max(translateX.value + x, scrollbarDomWidth - tabDomWidth);
    }
  }
  if (translateX.value >= 0) translateX.value = 0;

  if (translateX.value >= 0 || translateX.value <= -scrollWidth) {
    tabDom.value.style.transition = "transform 0.5s ease-in-out";
  }
  tabDom.value.style.transform = `translateX(${translateX.value}px)`;
}

function openMenu(tag, e) {}

function tagOnClick(item) {}

function moveToView(index) {}

function onMouseenter(index) {}

function onMouseleave(index) {}

function scheduleIsActive(item) {}

function iconIsActive(item, index) {}

function linkIsActive(item) {}

function handleCommand(command) {
  const { key, item } = command;
  onClickDrop(key, item);
}

function onClickDrop(key, item, selectRoute?) {
  if (item && item.disabled) return;

  let selectTagRoute = { path: item.path, meta: item.meta };

  const myObj = {
    0: onFresh,
    1: () => deleteMenu(selectTagRoute),
    2: () => deleteMenu(selectTagRoute, "left"),
    3: () => deleteMenu(selectTagRoute, "right"),
    4: () => deleteMenu(selectTagRoute, "other"),
    5: () => deleteMenu(selectTagRoute, "all"),
    6: onFullScreen,
    7: onFullScreenContent
  };
}
function onFresh() {
  const { fullPath, query } = unref(route);
  router.replace({ path: "/redirect" + fullPath, query });
  handleAliveRoute(route as ToRouteType, "refresh");
}

function deleteMenu(item, tag?: string) {
  console.log("tag, item", tag, item);
  // deleteDynamicTag(item, item.path, tag);
  // handleAliveRoute(route as ToRouteType);
}
function onFullScreen() {
  console.log("222", 222);
}

function onFullScreenContent() {
  console.log("111", 111);
}

function handleAliveRoute(route, type) {}

function transformI18n(item) {}

function onRouteClick(item) {
  console.log("跳转", item);
}

onMounted(() => {
  scrollbarDom.value.addEventListener("mousedown", onMouseDown);
});

const startX = ref(0);
const elementX = ref(0); // 记录元素当前的实际位置

function onMouseDown(ev) {
  startX.value = ev.clientX;
  elementX.value = translateX.value; // 保存元素当前的位置
  tabDom.value.style.transition = "none";

  scrollbarDom.value.addEventListener("mousemove", onMouseMove);
  scrollbarDom.value.addEventListener("mouseup", onMouseUp);
  document.addEventListener("mouseup", onMouseUp); // 防止在元素外释放鼠标
}

function onMouseMove(ev) {
  const distX = ev.clientX - startX.value;
  translateX.value = elementX.value + distX; // 基于原始位置计算新位置
  const minX = scrollbarDom.value.clientWidth - tabDom.value.offsetWidth;

  if (translateX.value > 0) {
    const scale = (scrollbarDom.value.offsetWidth / (scrollbarDom.value.scrollWidth + translateX.value)) * 1.5;
    translateX.value = elementX.value + distX * scale;
  } else if (translateX.value < minX) {
    const scale = (scrollbarDom.value.offsetWidth / (scrollbarDom.value.scrollWidth - translateX.value)) * 1.5;
    translateX.value = elementX.value + distX * scale;
  }
  tabDom.value.style.transform = `translateX(${translateX.value}px)`;
}

function onMouseUp() {
  tabDom.value.style.transition = "transform 0.3s ease-in-out";
  const minX = scrollbarDom.value.clientWidth - tabDom.value.offsetWidth;
  if (translateX.value > 0) {
    translateX.value = 0;
    tabDom.value.style.transform = `translateX(${translateX.value}px)`;
  } else if (translateX.value < minX) {
    translateX.value = minX;
    tabDom.value.style.transform = `translateX(${translateX.value}px)`;
  }

  scrollbarDom.value.removeEventListener("mousemove", onMouseMove);
  scrollbarDom.value.removeEventListener("mouseup", onMouseUp);
  document.removeEventListener("mouseup", onMouseUp);
}
</script>

<template>
  <div class="tags-view">
    <span v-show="isShowArrow" class="arrow-left">
      <HxIcon icon="ArrowLeftBold" @click="handleScroll(200)" />
    </span>
    <div ref="scrollbarDom" class="scroll-container">
      <div class="tab select-none" ref="tabDom" @wheel.prevent="onWheel($event)">
        <div
          :ref="'dynamic' + index"
          v-for="(item, index) in multiTags"
          :key="index"
          :class="['scroll-item is-closable', 'card']"
          @contextmenu.prevent="openMenu(item, $event)"
          @mouseenter.prevent="onMouseenter(index)"
          @mouseleave.prevent="onMouseleave(index)"
          @click="tagOnClick(item)"
        >
          <span @click="onRouteClick(item)">{{ item.meta.title }}</span>
          <span class="el-icon-close" @click.stop="deleteMenu(item)">
            <HxIcon icon="CloseBold" />
          </span>
          <!-- <div :ref="'schedule' + index" v-if="showModel !== 'card'" :class="[scheduleIsActive(item)]" /> -->
        </div>
      </div>
    </div>
    <span v-show="isShowArrow" class="arrow-right">
      <HxIcon icon="ArrowRightBold" @click="handleScroll(-200)" />
    </span>

    <!-- 右侧功能按钮 -->
    <el-dropdown trigger="click" placement="bottom-end" @command="handleCommand">
      <span class="arrow-down">
        <HxIcon icon="ArrowDownBold" />
      </span>
      <template #dropdown>
        <el-dropdown-menu class="ui-h-100">
          <el-dropdown-item v-for="(item, key) in tagsViews" :key="key" :command="{ key, item }" :divided="item.divided" :disabled="item.disabled">
            <HxIcon :icon="item.icon" />
            {{ item.text }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<style lang="scss" scoped>
// @import url("./index.scss");
.tags-view {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 0 1px #888;

  .scroll-item {
    position: relative;
    display: inline-block;
    height: 28px;
    padding: 0 6px;
    margin-right: 4px;
    line-height: 28px;
    cursor: pointer;
    border-radius: 3px 3px 0 0;
    box-shadow: 0 0 1px #888;
    transition: all 0.4s;

    .el-icon-close {
      position: absolute;
      top: 50%;
      font-size: 10px;
      color: var(--el-color-primary);
      cursor: pointer;
      transition: font-size 0.2s;
      transform: translate(-50%, -50%);

      &:hover {
        font-size: 13px;
        color: #fff;
        border-radius: 50%;
      }
    }

    &.is-closable:not(:first-child) {
      // &:hover {
      //   padding-right: 18px;

      //   &:not(.is-active) {
      //     .el-icon-close {
      //       animation: close 200ms ease-in forwards;
      //     }
      //   }
      // }
    }
  }

  a {
    padding: 0 4px;
    color: var(--el-text-color-primary);
    text-decoration: none;
  }

  .scroll-container {
    position: relative;
    flex: 1;
    padding: 5px 0;
    overflow: hidden;
    white-space: nowrap;

    .tab {
      position: relative;
      float: left;
      overflow: visible;
      white-space: nowrap;
      list-style: none;
      transition: transform 0.5s ease-in-out;

      .scroll-item {
        transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
        user-select: none;
      }
    }
  }

  /* 右键菜单 */
  .contextmenu {
    position: absolute;
    padding: 5px 0;
    margin: 0;
    font-size: 13px;
    font-weight: normal;
    color: var(--el-text-color-primary);
    white-space: nowrap;
    list-style-type: none;
    background: #f60;
    border-radius: 4px;
    outline: 0;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);

    li {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 7px 12px;
      margin: 0;
      cursor: pointer;

      &:hover {
        color: var(--el-color-primary);
      }

      svg {
        display: block;
        margin-right: 0.5em;
      }
    }
  }

  .arrow-left,
  .arrow-right,
  .arrow-down {
    position: relative;
    width: 40px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-primary);
    box-shadow: 0px 0px 1px #888;

    svg {
      position: absolute;
      left: 50%;
      width: 20px;
      height: 20px;
      transform: translate(-50%, 50%);
    }
  }
}
</style>
