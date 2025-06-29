<script setup lang="ts">
import { ref, reactive } from "vue";
const tabDom = ref();
const scrollbarDom = ref();
const translateX = ref(0);
const isShowArrow = ref(true);

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

function deleteMenu(item) {
  console.log("删除", item);
}

function moveToView(index) {}

function onMouseenter(index) {}

function onMouseleave(index) {}

function scheduleIsActive(item) {}

function iconIsActive(item, index) {}

function linkIsActive(item) {}

function handleCommand(command) {}

function handleAliveRoute(route) {}

function transformI18n(item) {}

function onRouteClick(item) {
  console.log("跳转", item);
}
</script>

<template>
  <div class="tags-view">
    <span v-show="isShowArrow" class="arrow-left">
      <HxIcon icon="ArrowLeftBold" @click="handleScroll(200)" />
    </span>
    <div ref="scrollbarDom" class="scroll-container">
      <div class="tab select-none" ref="tabDom">
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
    </div>
    <span v-show="isShowArrow" class="arrow-right">
      <HxIcon icon="ArrowRightBold" @click="handleScroll(-200)" />
    </span>
  </div>
</template>

<style lang="scss" scoped>
@import url("./index.scss");
.tags-view {
  border: 1px solid #f60;
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 14px;
  color: var(--el-text-color-primary);
  box-shadow: 0 0 1px #888;
  .scroll-container {
    position: relative;
    flex: 1;
    padding: 5px 0;
    overflow: hidden;
    white-space: nowrap;
  }
}
</style>
