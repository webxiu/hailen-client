<!-- /*
 * @Author: lixiuhai 
 * @Date: 2023-06-23 10:05:14 
 * @Last Modified by:   lixiuhai 
 * @Last Modified time: 2023-06-23 10:05:14 
 */ -->
<template>
  <div ref="ballRef" :style="domStyle" class="my-icon" @touchstart="onTouchstart" @touchmove="onTouchmove" @touchend="onTouchend" @click="handleClickIconBack">
    <SvgIcon v-if="route.meta.pathType" :iconClass="`${route.meta.pathType === 'list' ? 'a-homeliving' : 'liebiaofanhui'}`" class-name="iconClass" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SvgIcon from "@/vue/components/SvgIcon/index.vue";
import { useMove } from "@/vue/hooks/useUtils";

const route = useRoute();
const router = useRouter();
const ballRef = ref<HTMLElement>();

const { onTouchstart, onTouchmove, onTouchend, domStyle } = useMove(ballRef, "_BALL_POSITION");

// 路由跳转
const handleClickIconBack = () => {
  if (getRouteLink()) return;
  if (route.meta.pathType === "list") {
    location.href = "/workspace";
  } else if (route.meta.pathType === "detail") {
    router.back();
  }
};
</script>

<style scoped lang="scss">
.my-icon {
  width: 90px;
  height: 90px;
  right: 69px;
  bottom: 350px;
  position: fixed;
  z-index: 996;
  .iconClass {
    width: 90px;
    height: 90px;
  }
}
</style>
