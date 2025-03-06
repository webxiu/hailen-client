<template>
  <div>
    组件列表
    <AgGrid :msg="'hello'" />
  </div>
</template>

<script setup lang="ts">
import AgGrid from "./AgGrid/index.vue";
</script>

<style scoped></style>
