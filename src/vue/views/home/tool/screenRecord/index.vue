<template>
  <div>
    <h1>屏幕录制</h1>
    <el-button id="start" @click="onStart" :disabled="disabledStart">开始录制</el-button>
    <el-button id="stop" @click="onStop" :disabled="disabledStop">停止录制</el-button>
    <video id="video" controls ref="videoRef"></video>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
// import { writeFile } from "fs";

let mediaRecorder;
let recordedChunks = [];
const disabledStart = ref(false);
const disabledStop = ref(false);
const videoRef = ref();

const onStart = async () => {
  console.log("window", window.desktopCapturer);
  const sources = await window.desktopCapturer.getSources({ types: ["screen"] });

  const screenSource = sources[0]; // 选择第一个屏幕源
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: screenSource.id
      }
    }
  });

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    videoRef.value.src = url;

    console.log("blob", blob);
    // 可选：保存录制的视频
    const filePath = "recorded-video.webm";
    // writeFile(filePath, Buffer.from(await blob.arrayBuffer()), (err) => {
    //   if (err) {
    //     console.error("保存视频失败:", err);
    //   } else {
    //     console.log("视频已保存:", filePath);
    //   }
    // });
  };

  mediaRecorder.start();
  disabledStart.value = true;
  disabledStop.value = false;
};

const onStop = () => {
  mediaRecorder.stop();
  disabledStart.value = false;
  disabledStop.value = true;
};
</script>

<style scoped></style>
