<template>
  <div id="types">
    <el-button v-for="(v, i) in audio_type_list" :key="v" @click="setType(i)" class="mr-5">{{ v }}</el-button>
    <span>{{ audio_type_list[typeIndex] }}</span>
  </div>
  <el-button @click="create()">{{ title }}</el-button>
</template>

<script setup lang="ts">
import { ref } from "vue";
const audio_data_list = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 261.63 * 2].map((v) => v);
const audio_type_list = ["sine", "square", "sawtooth", "triangle"];
let typeIndex = ref(0);
let index = ref(0);
const title = ref("开始播放");

function setType(i) {
  index.value = 0;
  title.value = "开始播放";
  typeIndex.value = i;
}
function create() {
  title.value = `基础音：${index.value === 7 ? "+1" : index.value + 1}`;
  // 创建音频上下文
  const audioCtx = new AudioContext();
  // 创建音调控制对象
  const oscillator = audioCtx.createOscillator();
  // 创建音量控制对象
  const gainNode = audioCtx.createGain();
  // 音调音量关联
  oscillator.connect(gainNode);
  // 音量和设备关联
  gainNode.connect(audioCtx.destination);
  // 音调类型指定为正弦波
  oscillator.type = audio_type_list[typeIndex.value] as OscillatorType;
  // 设置音调频率
  oscillator.frequency.value = audio_data_list[index.value];
  // 先把当前音量设为0
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  // 0.01秒时间内音量从刚刚的0变成1，线性变化
  gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
  // 声音走起
  oscillator.start(audioCtx.currentTime);
  // 1秒时间内音量从刚刚的1变成0.001，指数变化
  gainNode.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 1);
  // 1秒后停止声音
  oscillator.stop(audioCtx.currentTime + 1);
  if (index.value >= audio_data_list.length - 1) {
    index.value = 0;
  } else {
    index.value++;
  }
}
</script>
