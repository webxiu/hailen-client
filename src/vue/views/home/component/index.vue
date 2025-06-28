<template>
  <div>
    组件列表
    <Hacker />
    <AgGrid :msg="'hello'" />
    <List />
  </div>
</template>

<script setup lang="ts">
import AgGrid from "./AgGrid/index.vue";
import Hacker from "./Hacker/index.vue";
import List from "@/vue/components/SvgIcon/List.vue";
</script>

<style scoped></style>
