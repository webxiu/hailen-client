<template>
  <div class="dashboard">
    <el-button type="primary" @click="onClick">count is {{ count }}</el-button>
    <el-button type="primary" @click="onReact">React窗口</el-button>
    <el-button type="primary" @click="onPing">ping</el-button>
    <el-button type="primary" @click="onGet">获取数据</el-button>
    <div>根路径: {{ $$.appInfo.rootPath }}</div>
    <div>
      <pre>
        <code>
          {{  JSON.stringify(userData, null, 2) }}
        </code>
      </pre>
    </div>
    <Webview :src="src" :useragent="weixinUserAgent" />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { addList, getList } from "@/vue/api/home/dashboard";
import Webview from "@/vue/components/Webview/index.vue";
import { weixinUserAgent } from "@/vue/config/constant";

const src = "https://channels.weixin.qq.com/platform";
const count = ref(0);
const userData = ref([]);
console.log("$$", $$);
console.log("viteEnv:", import.meta.env);

onMounted(() => {
  onGet();
});

// 累加
function onClick() {
  count.value++;
}

// 创建react窗口
function onReact() {
  window.electronAPI.send("react", "world"); // 向主进程发送消息
}

// 发送消息
function onPing() {
  window.electronAPI.send("ping", "world");
}

// 获取数据
function onGet() {
  getList({ username: "123", email: "123@qq.com" }).then(({ data }) => {
    console.log("data", data);
    userData.value = data;
  });
}
</script>

<style scoped></style>
