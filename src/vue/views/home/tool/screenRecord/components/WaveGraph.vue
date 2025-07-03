<template>
  <div>
    <el-button id="play-btn">播放</el-button>
    <div id="audioTrack"></div>
  </div>
</template>

<script lang="tsx" setup>
import { onMounted } from "vue";

function throttle(fn, delay = 30) {
  var lastTime = 0;
  return function () {
    var nowTime = new Date().getTime();
    if (nowTime - lastTime > delay) {
      fn.apply(this, arguments);
      lastTime = nowTime;
    }
  };
}

interface MusicOption {
  width?: number;
  height?: number;
}
class Music {
  audioUrl: string;
  playBtnDom: HTMLElement | null;
  audioTrack: HTMLElement | null;
  waveCanvas: HTMLCanvasElement | null;
  bgCanvas: HTMLCanvasElement | null;
  waveCtx: CanvasRenderingContext2D | null;
  bgCtx: CanvasRenderingContext2D | null;
  audioWidth: number;
  audioHeight: number;
  channelData: Float32Array | null;
  audio: HTMLAudioElement | null;
  totalMs: number;
  currentTime: number;
  flag: boolean;
  constructor(option: MusicOption = {}) {
    const { width, height } = option;
    this.audioUrl = "http://127.0.0.1:3800/static/premeditate.mp3";  
    this.playBtnDom = document.querySelector("#play-btn");
    this.audioTrack = document.querySelector("#audioTrack");
    if (width && height) {
      this.audioTrack.style = `width: ${width}px;height: ${height}px`;
    }
    const rect = this.audioTrack.getBoundingClientRect();
    console.log("width,height, rect", width, height, rect);
    this.waveCanvas = null;
    this.bgCanvas = null;
    this.waveCtx = null;
    this.audioWidth = width || rect.width;
    this.audioHeight = height || rect.height;
    this.channelData = null;
    this.audio = null;
    this.totalMs = 0;
    this.currentTime = 0;
    this.flag = true;
  }
  init = async () => {
    console.log("111", 111);
    this.createCanvasElement();
    await this.getAudioData();
  };
  createCanvasElement = () => {
    this.waveCanvas = document.createElement("canvas");
    this.bgCanvas = document.createElement("canvas");
    this.waveCtx = this.waveCanvas.getContext("2d");
    this.bgCtx = this.bgCanvas.getContext("2d");
    this.bgCanvas.style = `position: absolute;top: 0;left:0;z-index: 2;`;
    this.bgCanvas.width = this.waveCanvas.width = this.audioWidth;
    this.bgCanvas.height = this.waveCanvas.height = this.audioHeight;
    this.audioTrack.appendChild(this.waveCanvas);
    this.audioTrack.appendChild(this.bgCanvas);
    this.bgCanvas.addEventListener("mousedown", this.onMouseDown);
  };
  getAudioData = async () => {
    // 获取音频文件转成ArrayBuffer，再转成AudioBuffer
    const arrayBuffer = await this.getAudioArrayBuffer(this.audioUrl);
    const audioBuffer = await this.getAudioBuffer(arrayBuffer, new AudioContext());
    this.createAudio(audioBuffer, this.audioUrl);
    // getChannelData()返回一个Float32Array,包含每一个通道的PCM数据,0代表第一个通道
    this.channelData = audioBuffer.getChannelData(0);
    if (this.channelData) this.drawTrack();
  };
  // 音频文件 ArrayBuffer
  getAudioArrayBuffer = async (audioUrl) => {
    const res = await fetch(audioUrl);
    return res.arrayBuffer();
  };
  // 音频对象 AudioBuffer
  getAudioBuffer = async (arrayBuffer, audioContext) => {
    let resolveFn;
    const promise = new Promise((resolve) => (resolveFn = resolve));
    audioContext.decodeAudioData(arrayBuffer, resolveFn);
    return promise;
  };
  // 绘制音频图谱
  drawTrack = () => {
    this.waveCtx.clearRect(0, 0, this.audioWidth, this.audioHeight);
    this.waveCtx.fillStyle = "rgb(0 22 237)";
    // 计算获取音频帧的集合，然后绘出每一帧
    const audioTrackList = this.getAudioTrackList(this.channelData, this.audioWidth);
    audioTrackList.forEach((item, index) => {
      if (index % 2) return;
      const barHeight = Math.max(1, item * this.audioHeight * 0.4);
      const barWidth = 1;
      this.waveCtx.fillRect(index, (this.audioHeight - barHeight) / 2, barWidth, barHeight);
    });
  };
  // 获取音频轨道数据
  getAudioTrackList = (channelData, trackTotalWidth) => {
    let i = 0;
    let min = 1;
    let max = -1;
    const list = [];
    let stepIndex = 0;
    const unitWidth = Math.floor(channelData.length / trackTotalWidth);

    while (stepIndex++ < trackTotalWidth) {
      min = 1;
      max = -1;
      const end = Math.min(stepIndex * unitWidth, channelData.length);
      while (i++ < end) {
        const current = channelData[i];
        if (current > max) max = current;
        if (current < min) min = current;
      }
      list.push(max - min);
    }
    return list;
  };

  // 播放音频
  createAudio = (audioBuffer, audioUrl) => {
    this.totalMs = audioBuffer?.duration;
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.src = audioUrl;
    this.audio.ontimeupdate = (e) => {
      this.drawLine();
    };
    this.playBtnDom.addEventListener("click", this.play);
  };

  play = () => {
    if (!this.audio) {
      return;
    }
    if (this.flag) {
      this.audio.play();
      this.playBtnDom.innerHTML = "暂停";
    } else {
      this.audio.pause();
      this.playBtnDom.innerHTML = "播放";
    }
    this.flag = !this.flag;
  };

  setTime = () => {
    this.audio.currentTime = 160; // 秒
    this.audio.play();
    this.flag = false;
    this.playBtnDom.innerHTML = "暂停";
  };

  onMouseDown = (e) => {
    this.drawLine(e.offsetX);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  };

  onMouseMove = throttle((e) => {
    this.drawLine(e.offsetX);
  }, 20);

  onMouseUp = (e) => {
    document.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mousemove", this.onMouseMove);
  };

  drawLine = (pos) => {
    let x = pos;
    if (pos) {
      this.currentTime = (pos * this.totalMs) / this.audioWidth;
      this.audio.currentTime = this.currentTime;
    } else {
      this.currentTime = this.audio.currentTime;
      x = (this.currentTime / this.totalMs) * this.audioWidth;
    }
    this.bgCtx.clearRect(0, 0, this.audioWidth, this.audioHeight);
    this.bgCtx.fillStyle = "rgba(125,150,0,.3)";
    this.bgCtx.fillRect(0, 0, x, this.audioHeight);
  };
}

onMounted(() => {
  const music = new Music({});
  music.init();
});
</script>

<style lang="scss" scoped>
#audioTrack {
  position: relative;
  width: 100%;
  min-height: 60px;
  font-size: 0;
  background-color: #d7d0fd;
}
</style>
