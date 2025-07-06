<script setup lang="ts">
import HxIcon from "@/vue/components/HxIcon";
import { useMoveEvent } from "@/vue/hooks/event";
import { ref, reactive, unref, onMounted, computed, watch, getCurrentInstance } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTagStore } from "@/vue/store/modules/tag";

const instance = getCurrentInstance();
const wrapRef = ref();
const scrollRef = ref();
const isShowArrow = ref(true);
const route = useRoute();
const router = useRouter();
const { translateX, onWheel, onStepMove, moveToView } = useMoveEvent({ wrapRef, scrollRef });

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
const tags = computed(() => useTagStore().getTagList);
console.log("useTagStore", useTagStore().getTagList);
const linkIsActive = computed(() => {
  return (item, previous, next) => {
    // 判断路由及参数来激活当前Tag标签
    const routeQuery = JSON.stringify(route.query);
    const itemQuery = JSON.stringify(item.query);
    if (Object.keys(item.query || {}).length > 0) {
      return route.path + routeQuery === item.path + itemQuery ? previous : next;
    }
    return route.path === item.path ? previous : next;
  };
});

// 5-10随即索引

const tags2 = new Array(30).fill(0).map((item, index) => {
  const randomIndex = Math.floor(Math.random() * 5 + 5);
  index++;
  return {
    name: `Home${index}`,
    path: `/workbench/home${index}`,
    meta: {
      title: "标题很累空间四六级".slice(0, randomIndex) + index,
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

onMounted(() => {
  getScrollTagPosition();
});

watch(route, () => {
  getScrollTagPosition();
});

function getScrollTagPosition() {
  // 找到当前高亮的路由
  const index = tags.value.findIndex((item) => linkIsActive.value(item, true, false));
  const activeRef = instance.refs["dynamic" + index];
  console.log("============route", activeRef, route);
  if (!activeRef) return;
  const activeTabEl = activeRef[0];
  const tabItemElOffsetLeft = (activeTabEl as HTMLElement)?.offsetLeft;
  const tabItemOffsetWidth = (activeTabEl as HTMLElement)?.offsetWidth;
  // 标签页导航栏可视长度（不包含溢出部分）
  const scrollbarDomWidth = wrapRef.value ? wrapRef.value?.offsetWidth : 0;

  // 已有标签页总长度（包含溢出部分）
  const tabDomWidth = scrollRef.value ? scrollRef.value?.offsetWidth : 0;

  scrollbarDomWidth <= tabDomWidth ? (isShowArrow.value = true) : (isShowArrow.value = false);

  const tabNavPadding = 20;
  let position = translateX.value;

  if (tabDomWidth < scrollbarDomWidth || tabItemElOffsetLeft === 0) {
    position = 0;
  } else if (tabItemElOffsetLeft < -translateX.value) {
    // 标签在可视区域左侧
    position = -tabItemElOffsetLeft + tabNavPadding;
  } else if (tabItemElOffsetLeft > -translateX.value && tabItemElOffsetLeft + tabItemOffsetWidth < -translateX.value + scrollbarDomWidth) {
    // 标签在可视区域
    position = Math.min(0, scrollbarDomWidth - tabItemOffsetWidth - tabItemElOffsetLeft - tabNavPadding);
  } else {
    // 标签在可视区域右侧
    position = -(tabItemElOffsetLeft - (scrollbarDomWidth - tabNavPadding - tabItemOffsetWidth));
  }
  moveToView(position);
}

const multiTags = ref(tags);

function openMenu(tag, e) {}

function tagOnClick(ev, item) {}

function onMouseenter(index) {}

function onMouseleave(index) {}

function scheduleIsActive(item) {}

function iconIsActive(item, index) {}

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

function deleteMenu(ev, item) {
  ev.stopPropagation();
  ev.preventDefault();
  useTagStore().removeTag(item);
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
</script>

<template>
  <div class="tags-view">
    <span v-show="isShowArrow" class="arrow-left">
      <HxIcon icon="ArrowLeftBold" @click="onStepMove(400)" />
    </span>
    <div ref="wrapRef" class="wrap-container">
      <div class="scroll-area select-none" ref="scrollRef" @wheel.prevent="onWheel($event)">
        <div
          :ref="'dynamic' + index"
          v-for="(item, index) in multiTags"
          :key="index"
          :class="['scroll-item is-closable', linkIsActive(item, 'is-active', ''), 'card']"
          @contextmenu.prevent="openMenu(item, $event)"
          @mouseenter.prevent="onMouseenter(index)"
          @mouseleave.prevent="onMouseleave(index)"
          @click="tagOnClick($event, item)"
        >
          <span @click="onRouteClick(item)">{{ item.meta.title }}</span>
          <span class="tag-close" @click.stop="deleteMenu($event, item)">
            <HxIcon icon="CloseBold" />
          </span>
          <!-- <div :ref="'schedule' + index" v-if="showModel !== 'card'" :class="[scheduleIsActive(item)]" /> -->
        </div>
      </div>
    </div>
    <span v-show="isShowArrow" class="arrow-right">
      <HxIcon icon="ArrowRightBold" @click="onStepMove(-400)" />
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

  .wrap-container {
    position: relative;
    flex: 1;
    padding: 5px 0;
    overflow: hidden;
    white-space: nowrap;

    .scroll-area {
      position: relative;
      float: left;
      overflow: visible;
      white-space: nowrap;
      list-style: none;
      transition: transform 0.5s ease-in-out;
    }
  }

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
    user-select: none;

    .tag-close {
      position: absolute;
      top: 50%;
      font-size: 10px;
      color: var(--el-color-primary);
      cursor: pointer;
      transform-origin: center center;
      transition: font-size 0.2s, transform 0.3s;
      transform: translate(3px, -50%) scale(0);
      line-height: 7px;
      text-align: center;

      &:hover {
        font-size: 13px;
        color: #fff;
        border-radius: 50%;
        transform: translate(3px, -50%) scale(0);
      }
    }
    &.is-closable:not(:first-child) {
      &.is-active,
      &:hover {
        padding-right: 18px;
        .tag-close {
          transform: translate(3px, -50%) scale(1);
        }
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
