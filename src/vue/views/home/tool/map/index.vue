<!--
 * @Author: Hailen
 * @Date: 2025-05-26 12:52:52
 * @LastEditors: Hailen
 * @LastEditTime: 2026-03-09 16:11:38
 * @Description: 
-->
<template>
  <div class="map">
    <el-button type="primary" @click="onLoad">地图</el-button>
    <div class="flex">
      <Path />
      <div id="tmap" class="ml-10" style="width: 100%; height: 80vh"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
const count = ref(0);
import { initMap } from "@/lib/map";
import Path from "./Path.vue";

defineOptions({ name: "HomeToolMapIndex", title: "地图" });

onMounted(() => {
  initMap("tmap");
});

function onLoad() {
  initMap("tmap");
}
</script>

<style scoped></style>
