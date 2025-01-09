<template>
  <div class="dashboard">
    地图
    <div id="tmap" style="width: 100%; height: 500px"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
const count = ref(0);
import { initMap } from "@/lib/map";

onMounted(() => {
  initMap();
});
</script>

<style scoped></style>
