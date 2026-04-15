<!--
 * @Author: Hailen
 * @Date: 2026-04-02 11:29:18
 * @LastEditors: Hailen
 * @LastEditTime: 2026-04-02 11:33:57
 * @Description: 
-->
<template>
  <div class="flex-col flex-1 ui-ov-h">
    <div class="slider-box flex-col flex-center">
      <el-slider v-model="scale" :min="0.1" :max="5" :step="0.1" />
    </div>
    <div class="ui-h-100 flex-center ui-p-r">
      <img
        src="https://gips3.baidu.com/it/u=1039279337,1441343044&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f1024_1024"
        mode="aspectFit"
        class="ui-w-100 ui-h-100 no-select"
        :style="moveStyle"
        @mousedown="onMouseDown"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, reactive, computed } from "vue";

defineOptions({ name: "MovePlayer" });

type Props = {};

const props = withDefaults(defineProps<Props>(), {});

const emits = defineEmits(["close"]);

// 状态
const scale = ref(0.5);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);

let lastX = 0,
  lastY = 0;

const moveStyle = computed(() => {
  return {
    transform: `scale(${scale.value}) translate(${translateX.value}px, ${translateY.value}px)`,
    transition: isDragging.value ? "none" : "transform 0.2s",
    cursor: isDragging.value ? "move" : "grab"
  };
});
function onMouseDown(e: MouseEvent) {
  e.preventDefault();
  // 只有左键点击才触发
  if (e.button !== 0) return;
  lastX = e.pageX;
  lastY = e.pageY;
  isDragging.value = true;

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const dx = e.pageX - lastX;
  const dy = e.pageY - lastY;
  lastX = e.pageX;
  lastY = e.pageY;

  translateX.value += dx;
  translateY.value += dy;
}

function onMouseUp() {
  isDragging.value = false;
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
}
</script>
