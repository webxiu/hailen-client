<template>
  <div class="ui-w-100 ui-h-100" style="height: 500px">
    <iframe :src="weather" width="100%" height="100%"></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const weather = computed(() => {
  const url = `https://m.baidu.com/sf?pd=life_compare_weather&openapi=1&dspName=iphone&from_sf=1&word=%E6%B7%B1%E5%9C%B3&title=%E5%A4%A9%E6%B0%94%E5%9C%B0%E5%9B%BE&resource_id=5138&county_id=101280601&county=%E6%B7%B1%E5%9C%B3&source=weather&lid=10614196007587409405&referlid=10614196007587409405&ms=1&frsrcid=5063&frorder=1`;
  return url;
});
</script>

<style scoped></style>
