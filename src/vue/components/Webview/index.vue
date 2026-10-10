<template>
  <div class="webview flex-1 ui-h-100">
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
      :style="{ width: ' 100%', height: '100%' }"
      @dom-ready="onDomReady"
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

/** guest 页面（webview 内部页面）是否已加载完成，就绪前 executeJavaScript 不可靠 */
const guestReady = ref(false);
function onDomReady() {
  guestReady.value = true;
}

/**
 * 在 webview 内部页面（guest）的上下文中执行 JS 代码。
 * 宿主页面无法直接访问 guest 的 DOM，必须通过 executeJavaScript 注入执行
 */
function exec<T = unknown>(code: string): Promise<T> {
  const el = webviewRef.value;
  if (!el || !guestReady.value) {
    return Promise.reject(new Error("webview 尚未就绪"));
  }
  return el.executeJavaScript(code, true);
}

/** 聚焦 guest 页面内容（真实输入事件的前置条件） */
function focusGuest() {
  webviewRef.value?.focus?.();
}

/**
 * 经真实输入管线插入文本（等效人工键入，Slate 等富文本框架能同步内部状态、点亮发送按钮）。
 * 要求 guest 页面中已有聚焦的可编辑元素（先用 exec 聚焦目标输入框）
 */
function insertText(text: string): Promise<void> {
  const el = webviewRef.value;
  if (!el || !guestReady.value) {
    return Promise.reject(new Error("webview 尚未就绪"));
  }
  return el.insertText(text);
}

/** 发送真实按键事件（keyDown + keyUp），如 Enter 回车发送 */
async function sendKey(keyCode: string): Promise<void> {
  const el = webviewRef.value;
  if (!el || !guestReady.value) {
    throw new Error("webview 尚未就绪");
  }
  await el.sendInputEvent({ type: "keyDown", keyCode });
  await el.sendInputEvent({ type: "keyUp", keyCode });
}

defineExpose({ exec, guestReady, focusGuest, insertText, sendKey });

</script>

<style scoped></style>
