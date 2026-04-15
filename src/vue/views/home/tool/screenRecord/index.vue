<template>
  <div>
    <h1>组件</h1>
    <ScreenRecord />
    <WaveGraph />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ScreenRecord from "./components/ScreenRecord.vue";
import WaveGraph from "./components/WaveGraph.vue";

defineOptions({ name: "HomeToolScreenRecordIndex", title: "屏幕录制" });
</script>

<style scoped></style>
