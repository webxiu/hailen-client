<template>
  <div class="piano-box">
    <KeyBit v-for="(item, index) in keysList" :key="item.key" :item="item" :class="{ pressed: pressKeys.includes(item.key) }" :style="{ left: `${index * 60}px` }" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";
import KeyBit from "./KeyBit.vue";
const audioData = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
// ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"],
// const audio_type_list = ["sine", "square", "sawtooth", "triangle"];
const keys = [
  {
    type: "sine",
    rate: 3,
    keys: [
      { key: "Q", note: "c" },
      { key: "W", note: "d" },
      { key: "E", note: "e" },
      { key: "R", note: "f" },
      { key: "T", note: "g" },
      { key: "Y", note: "a" },
      { key: "U", note: "b" }
    ]
  },
  {
    type: "square",
    rate: 1,
    keys: [
      { key: "A", note: "c1" },
      { key: "S", note: "d2" },
      { key: "D", note: "e3" },
      { key: "F", note: "f4" },
      { key: "G", note: "g5" },
      { key: "H", note: "a6" },
      { key: "J", note: "b7" }
    ]
  }
];

const status = ref(1);
const pressKeyMap = reactive({});
const pressKeys = computed(() => Object.values(pressKeyMap));

const audioButtons = keys.map((m) => m.keys.map((n, i) => ({ type: m.type, rhythm: i, key: n.key, note: n.note, rate: m.rate })));
const keysList = audioButtons.flat();

onMounted(() => {
  window.addEventListener("keypress", onKeypress);
  window.addEventListener("keyup", onKeyUp);
});

function onKeypress(e) {
  const key = e.key.toUpperCase();
  if (pressKeyMap[key]) return;
  pressKeyMap[key] = key;
  const item = keysList.find((item) => item.key.toLowerCase() === key.toLowerCase());
  if (!item) return;
  onPlay(item);
}

function onKeyUp(e) {
  const key = e.key.toUpperCase();
  pressKeyMap[key] = "";
}

function onPlay(item) {
  getAudio(item.type, item.rhythm, status.value);
}

const getAudio = (type: OscillatorType, index: number, rate: number) => {
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
  oscillator.type = type;
  // 设置音调频率
  oscillator.frequency.value = audioData[index] * rate;
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
};
</script>

<style>
.piano-key {
  width: 60px;
  height: 100px;
  cursor: pointer;
  margin-right: 2px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: all 0.1s ease;
  border: 1px solid #ccc;
  background-color: white;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
.piano-key.active {
  background-color: #ddc7c765;
  transform: scale(1, 0.98);
}
/* 钢琴 */
.piano-box {
  width: 800px;
  height: 800px;
  top: 50px;
  left: 50%;
  position: relative;
  perspective: 1500px;
  transform-style: preserve-3d;
  transform: translateX(-50%) translateZ(10px) rotateY(0deg) rotateX(-50deg);
}
</style>
