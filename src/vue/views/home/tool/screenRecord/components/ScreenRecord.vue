<template>
    <div>
      <h1>屏幕录制</h1>
      <el-button id="start" @click="onStart" :disabled="disabledStart">开始录制</el-button>
      <el-button id="stop" @click="onStop" :disabled="disabledStop">停止录制</el-button>
      <video id="video-preview" controls ref="videoRef"></video>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  // import { writeFile } from "fs";
  
  let mediaRecorder;
  let recordedChunks = [];
  const disabledStart = ref(false);
  const disabledStop = ref(false);
  const videoRef = ref<HTMLVideoElement>();
  
  const onStart = async () => {
    const sources = await window.electronAPI.getScreenSources(); // 使用暴露的 API
    console.log("sources", sources);
    if (sources.length === 0) {
      console.error("No screen sources found");
      return;
    }
    const sourceId = sources[0].id;
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: sourceId
          }
        }
      });
  
      videoRef.value.srcObject = stream;
      videoRef.value.play(); // 播放视频
  
      mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
  
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
  
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a") as HTMLAnchorElement;
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = "recording.mp4";
        a.click();
        window.URL.revokeObjectURL(url);
      };
  
      mediaRecorder.start();
  
      // Stop recording after 10 seconds for demonstration purposes
      setTimeout(() => {
        mediaRecorder.stop();
      }, 10000);
    } catch (err) {
      console.error("Error accessing screen stream:", err);
    }
    return;
  
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
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
    videoRef.value.srcObject = null;
    videoRef.value.pause();
  };
  </script>
  
  <style scoped></style>
  