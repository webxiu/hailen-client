<template>
  <div class="wave-player">
    6666666666
    <canvas ref="waveRef" class="wave-graph"></canvas>
    <el-button type="primary" @click="startConvert"> 开始转换 </el-button>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import waveConfig from "./waveConfig";
import electron from "electron";
import { spawn } from "child_process";
import WaveGraph from "~/source/Wave-Graph-X64";
import { message } from "antd";
const path = require("path");
const waveGraph = require(path.join($$.appInfo.sourcePath, "Wave-Graph-X64", "dist", "WaveGraph.node")) as typeof WaveGraph;
const waveRef = ref<HTMLCanvasElement | null>(null);

interface Props {
  filePath: string;
}
const props = defineProps<Props>();

onMounted(async () => {
  console.log("waveGraph :>> ", waveGraph);
});

function startConvert() {
  drawWaveScan();
}

// 绘制预览图
function drawWaveScan() {
  const scanWaveCtx = waveRef.value?.getContext("2d") as CanvasRenderingContext2D;
  const { waveScanHeight } = waveConfig;
  const self = {
    waveId: -1,
    mainWaveWidth: 1000,
    sampleBits: 16
  };
  try {
    console.log("props :>> ", props);
    self.waveId = waveGraph.createDraw(path.resolve(props.filePath));
    // self.waveId = waveGraph.createDraw(path.resolve("D:/个人/测试/漂流瓶-西单女孩_ok.mp3"));
    console.log("self.waveId :>> ", self.waveId);
  } catch (error) {
    console.log("error :>> ", error);
  }
  if (self.waveId < 0) return message.error("文件转换失败");
  waveGraph.drawWaveFormAsync(self.waveId, self.mainWaveWidth, waveScanHeight, self.sampleBits, (res) => {
    if (!res || !res.length || res.length !== self.mainWaveWidth * waveScanHeight) return;
    const tmp = new OffscreenCanvas(self.mainWaveWidth, waveScanHeight);
    const imgData = new ImageData(self.mainWaveWidth, waveScanHeight);
    const buff = imgData.data;
    let idx, v;
    for (let y = 0; y < waveScanHeight; y++) {
      for (let x = 0; x < self.mainWaveWidth; x++) {
        idx = y * self.mainWaveWidth + x;
        v = res[(waveScanHeight - y - 1) * self.mainWaveWidth + x];
        idx = idx * 4;
        if (v === 1) {
          buff[idx] = 75;
          buff[idx + 1] = 243;
          buff[idx + 2] = 167;
          buff[idx + 3] = 255;
        } else {
          buff[idx + 0] = 0;
          buff[idx + 1] = 0;
          buff[idx + 2] = 0;
          buff[idx + 3] = 255;
        }
      }
    }
    const tmpCtx = tmp.getContext("2d") as OffscreenCanvasRenderingContext2D;
    tmpCtx.fillStyle = "#000";
    tmpCtx.fillRect(0, 0, self.mainWaveWidth, waveScanHeight);
    tmpCtx.putImageData(imgData, 0, 0);
    const wavCtxData = tmp.transferToImageBitmap();
    scanWaveCtx.drawImage(wavCtxData, 0, 0);
    // self.setState({ scanLoading: false });
  });
}
</script>

<style lang="scss" scoped>
.wave-graph {
  width: 100%;
  height: 150px;
}
</style>
