<template>
  <div v-if="external" :style="styleExternalIcon" class="svg-external-icon svg-icon" />
  <span v-else class="svg-wrap">
    <svg :class="svgClass" aria-hidden="true">
      <use :xlink:href="iconName"></use>
    </svg>
  </span>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { isExternal } from "@/vue/utils/common";
import { CSSProperties } from "react";
const props = defineProps({
  iconClass: { type: String, required: true },
  class: { type: String }
});
const external = computed(() => {
  return isExternal(props.iconClass);
});
const iconName = computed(() => {
  return `#icon-${props.iconClass}`;
});
const svgClass = computed(() => {
  if (props.class) {
    return "svg-icon " + props.class;
  } else {
    return "svg-icon";
  }
});

function styleExternalIcon() {
  return {
    mask: `url(${props.iconClass}) no-repeat 50% 50%`,
    "-webkit-mask": `url(${props.iconClass}) no-repeat 50% 50%`
  } as CSSProperties;
}
</script>
<style lang="scss" scoped>
.svg-wrap {
  display: inline-block;
  .svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }
  .svg-external-icon {
    background-color: currentColor;
    mask-size: cover !important;
    display: inline-block;
  }
}
</style>
