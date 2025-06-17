<template>
  <div class="flex-col" ref="pianoRef">
    <div v-for="(item, index) in audioButtons" :key="index" class="flex">
      <div v-for="(m, i) in item" :key="i" @click="onPlay(m)" class="mr-5 piano-key" :class="{ active: m.key === active }">
        <div>
          <div>{{ m.note }}</div>
          <div class="mt-15 color-00f">{{ m.key }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
const audioData = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88];
// ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"],
// const audio_type_list = ["sine", "square", "sawtooth", "triangle"];
const keys = [
  {
    type: "sine",
    rate: 1,
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
const pianoRef = ref();
const active = ref("");

const audioButtons = keys.map((m) => m.keys.map((n, i) => ({ type: m.type, rhythm: i, key: n.key, note: n.note, rate: m.rate })));

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
});

function onKeyDown(e) {
  const key = e.key.toUpperCase();
  active.value = key;
  const item = audioButtons.flat().find((item) => item.key.toLowerCase() === key.toLowerCase());
  console.log("按下", key, item);
  if (!item) return;
  onPlay(item);
}

function onKeyUp(e) {
  active.value = "";
}

function onPlay(item) {
  getAudio(item.type, item.rhythm, item.rate);
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

<style>
.piano-key {
  width: 60px;
  height: 100px;
  background-color: #ffffff7a;
  border: 1px solid #ccc;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-right: 2px;
  transition: all 0.1s ease;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.piano-key.active {
  background-color: #ddc7c765;
  transform: scale(1, 0.98);
}
</style>
