<template>
  <div class="webview">
    <webview
      ref="webviewRef"
      :src="src"
      v-bind="$attrs"
      :httpreferrer="src"
      :useragent="useragent"
      webpreferences="javascript=yes"
      allowpopups
      disablewebsecurity
      nodeintegrationinsubframes
      partition="partition"
      :style="{ width: ' 100%', height: '600px' }"
    ></webview>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

interface Props {
  src: string;
  useragent?: string;
}
defineProps<Props>();
const webviewRef = ref();

</script>

<style scoped></style>
