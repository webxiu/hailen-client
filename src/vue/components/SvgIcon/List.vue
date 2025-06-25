<template>
  <div class="flex just-around flex-wrap p-10">
    <SvgIcon v-for="item in svgImports" :key="item.name" :icon-class="item.name" :style="{ color: item.color }" class="mr-10 mb-10" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
const svgModules: Record<string, any> = import.meta.glob("@/vue/assets/icons/*.svg", { eager: true });

const svgImports = computed(() => {
  return Object.values(svgModules).map((module) => {
    const name = module.default.split("/").pop().split(".")[0];
    const color = randomColor();
    return { name, color };
  });
});

function randomColor() {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16)}`;
}
</script>
<style lang="scss"></style>
