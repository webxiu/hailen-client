<template>
  <div ref="hackerRef" style="min-height: 400px">
    <canvas ref="cvsRef"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { getRandomChar, getRandomColor } from "@/vue/utils/common";
import { onMounted, ref } from "vue";
import { canvasResize } from "./hook";
import { reactive } from "vue";

let timer;
const dpr = window.devicePixelRatio;
const cvsRef = ref<HTMLCanvasElement>();
const hackerRef = ref<HTMLDivElement>();
const cvsOption = reactive({ width: 400 * dpr, height: 200 * dpr });

onMounted(() => {
  const canvas = cvsRef.value!;
  const wrapDom = hackerRef.value!;
  const width = cvsOption.width;
  const height = cvsOption.height;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  canvasResize({ canvas, wrapDom, immediate: true }, (res) => {
    cvsOption.width = res.width;
    cvsOption.height = res.height;
    draw(ctx);
  });
});

function draw(ctx: CanvasRenderingContext2D) {
  const { width, height } = cvsOption;
  const fontSize = 16 * dpr;
  const columnWidth = fontSize;
  const columnCount = Math.floor(width / columnWidth);
  const charArr = new Array(columnCount).fill(0);

  if (timer) clearInterval(timer);
  function render() {
    ctx.fillStyle = "rgb(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < charArr.length; i++) {
      const char = getRandomChar();
      const color = getRandomColor();
      ctx!.font = `${fontSize}px Roboto Mono`;
      ctx!.fillStyle = color;
      const index = charArr[i];
      const x = i * columnWidth;
      const y = (index + 1) * fontSize;
      ctx!.fillText(char, x, y);
      if (y > height && Math.random() > 0.9) {
        charArr[i] = 0;
      } else {
        charArr[i]++;
      }
    }
  }
  timer = setInterval(render, 120);
}
</script>
