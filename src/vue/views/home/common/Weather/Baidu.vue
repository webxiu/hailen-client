<template>
  <div class="ui-w-100 ui-h-100" style="height: 800px">
    <el-input v-model="formData.city" placeholder="请输入内容" @change="onChange" />
    <iframe id="iframe" :src="weather" :key="formData.city" width="100%" height="100%"></iframe>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

const formData = reactive({ city: "深圳" });
const word = ref("深圳");

const weather = computed(() => {
  const link = `https://m.baidu.com/sf`;
  const params: Record<string, any> = {
    openapi: 1,
    from_sf: 1,
    resource_id: 5138,
    county_id: 101280601,
    word: word.value,
    source: "weather",
    dspName: "iphone",
    pd: "life_compare_weather"
  };
  const url = `${link}?${new URLSearchParams(params).toString()}`;
  return url;
});

function onChange(value) {
  word.value = value;
}
</script>

<style scoped></style>
