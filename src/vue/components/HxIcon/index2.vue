<template>
  <IconComponent />
</template>

<script lang="ts" setup>
import { PropType } from "vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const props = defineProps({
  icon: { type: String as PropType<keyof typeof ElementPlusIconsVue>, required: true, default: "" }
});

const IconComponent = ElementPlusIconsVue[props.icon];
</script>
<style lang="scss">
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
