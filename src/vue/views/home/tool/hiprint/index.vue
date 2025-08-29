<!--
 * @Author: Hailen
 * @Date: 2025-08-22 11:23:03
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-29 10:23:33
 * @Description: 
-->
<script setup lang="ts"> 
import Iframe from "./Iframe.vue";

defineOptions({ name: "HomeToolHiprintIndex", title: "打印设计", icon: "SetUp" });
 
</script>

<template>
  <div class="ui-h-100 flex-col flex-1 main main-content">
    <Iframe />
  </div>
</template>
