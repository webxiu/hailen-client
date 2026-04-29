<template>
  <div>
    组件列表
    <Hacker />
    <AgGrid :msg="'hello'" />
    <Weather />
    <List />
    <Webview :src="src" :useragent="weixinUserAgent" />

  </div>
</template>

<script setup lang="ts">
import AgGrid from "./AgGrid/index.vue";
import Hacker from "./Hacker/index.vue";
import Weather from "./Weather/Baidu.vue";
import List from "@/vue/components/SvgIcon/List.vue";
import Webview from "@/vue/components/Webview/index.vue";
import { weixinUserAgent } from "@/vue/config/constant";
const src = "https://channels.weixin.qq.com/platform";

</script>

<style scoped></style>
