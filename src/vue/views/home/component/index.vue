<template>
  <div>
    组件列表
    <Hacker />
    <AgGrid :msg="'hello'" />
  </div>
</template>

<script setup lang="ts">
import AgGrid from "./AgGrid/index.vue";
import Hacker from "./Hacker/index.vue";
</script>

<style scoped></style>
