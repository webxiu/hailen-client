<template>
  <div class="ui-h-100 flex-col">
    <div class="flex">
      <MovePlayer />
      <MovePlayer />
    </div>
    <div class="flex">
      <MovePlayer />
      <MovePlayer />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, reactive, computed } from "vue";
import MovePlayer from "./MovePlayer.vue";

defineOptions({ name: "HomeToolSyncPlayerIndex", title: "同步播放" });
</script>
