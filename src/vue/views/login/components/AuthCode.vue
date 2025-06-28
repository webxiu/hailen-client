<template>
  <canvas ref="codeRef" class="auth-code" @click="drawPic" :width="width" :height="height"></canvas>
</template>
<script lang="ts" setup>
import { onMounted, ref, withDefaults } from "vue";
interface Props {
  codeNum: number;
  width: number;
  height: number;
  fontSizeMin: number;
  fontSizeMax: number;
  backgroundColorMin: number;
  backgroundColorMax: number;
  colorMin: number;
  colorMax: number;
  lineColorMin: number;
  lineColorMax: number;
  lineCount: number;
  dotColorMin: number;
  dotColorMax: number;
  dotCount: number;
  getCode: Function;
}

const props = withDefaults(defineProps<Partial<Props>>(), {
  codeNum: 4,
  width: 100,
  height: 32,
  fontSizeMin: 16,
  fontSizeMax: 40,
  backgroundColorMin: 180,
  backgroundColorMax: 240,
  colorMin: 50,
  colorMax: 160,
  lineColorMin: 40,
  lineColorMax: 180,
  lineCount: 8,
  dotColorMin: 0,
  dotColorMax: 255,
  dotCount: 40,
  getCode: () => {}
});
const codeRef = ref(null);

onMounted(() => {
  drawPic();
});
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
// 生成一个随机的颜色
function randomColor(min, max) {
  let r = randomNum(min, max);
  let g = randomNum(min, max);
  let b = randomNum(min, max);
  return `rgb(${r},${g},${b})`;
}
function drawPic() {
  let canvas = codeRef.value!;
  let ctx = canvas.getContext("2d");
  ctx.textBaseline = "bottom";
  // 绘制背景
  ctx.fillStyle = randomColor(props.backgroundColorMin, props.backgroundColorMax);
  ctx.fillRect(0, 0, props.width, props.height);
  // 绘制文字
  drawText(ctx);
  drawLine(ctx);
  drawDot(ctx);
}
function drawText(ctx) {
  let res = "";
  for (let i = 0; i < props.codeNum; i++) {
    ctx.fillStyle = randomColor(props.colorMin, props.colorMax);
    ctx.font = `bold ${randomNum(props.fontSizeMin, props.fontSizeMax)}px 微软雅黑`;
    const sCode = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    const len = sCode.length;
    const txt = sCode[randomNum(0, len)];
    // let x = (i + 0.5) * (props.width / (props.codeNum + 1));
    // let y =  randomNum(props.fontSizeMax, props.height);
    // let deg = Math.random() - 0.5;
    let x = i * 20 + 15;
    let y = Math.random() * 8 + 30;
    let deg = randomNum(-30, 30);
    const size = randomNum(18, 40);
    ctx.save();
    ctx.translate(x, y);
    // ctx.font = size + "px SimHei";
    ctx.rotate((deg * Math.PI) / 180);
    // ctx.textBaseline = "bottom";
    ctx.fillText(txt, 0, 0);
    ctx.restore();
    res += txt;
  }
  props.getCode(res);
}
function drawLine(ctx) {
  // 绘制干扰线
  for (let i = 0; i < props.lineCount; i++) {
    ctx.strokeStyle = randomColor(props.lineColorMin, props.lineColorMax);
    ctx.beginPath();
    ctx.moveTo(randomNum(0, props.width), randomNum(0, props.height));
    ctx.lineTo(randomNum(0, props.width), randomNum(0, props.height));
    ctx.stroke();
  }
}
function drawDot(ctx) {
  // 绘制干扰点
  for (let i = 0; i < props.dotCount; i++) {
    ctx.fillStyle = randomColor(0, 255);
    ctx.beginPath();
    ctx.arc(randomNum(0, props.width), randomNum(0, props.height), 1, 0, 2 * Math.PI);
    ctx.fill();
  }
}
</script>
<style lang="scss" scoped>
.auth-code {
  cursor: pointer;
  margin-left: 8px;
  border-radius: 4px;
  box-shadow: 0px 0px 1px 1px #dcdfe6;
}
</style>
