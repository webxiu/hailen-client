<template>
  <div class="dashboard flex-col">
    <div class="toolbar">
      <el-button type="primary" size="small" :icon="Plus" @click="openAddDialog">新增</el-button>
      <div class="toolbar__filter">
        <span class="toolbar__label">AI列表</span>
        <el-select
          v-model="visibleIds"
          class="toolbar__select"
          multiple
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="2"
          size="small"
          placeholder="请选择要显示的 AI 页面"
        >
          <el-option v-for="item in siteList" :key="item.id" :label="item.title" :value="item.id" />
        </el-select>
      </div>
    </div>
    <div ref="containerRef" class="panes" :class="{ 'is-resizing': resizing }">
      <template v-for="item in siteList" :key="item.id">
        <div class="ai-pane" :class="{ 'is-hidden': !item.visible }" :style="{ width: item.visible ? `${item.width}%` : '0%' }">
          <el-dropdown trigger="contextmenu" @command="openEditDialog(item)">
            <div class="ai-pane__header" title="右键可编辑标题和地址">
              <span class="ai-pane__dot" :style="{ background: item.color }"></span>
              <span class="ai-pane__title">{{ item.title }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit" :icon="EditPen">编辑标题和地址</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <Webview :ref="(el) => setWebviewRef(el, item.id)" :src="item.src" :useragent="weixinUserAgent" />
          <div
            v-if="item.visible && hasNext(item)"
            class="resize-handle"
            :class="{ 'is-active': activeDragId === item.id }"
            title="拖拽调整宽度"
            @mousedown.prevent="startResize($event, item)"
          ></div>
        </div>
      </template>
      <div v-if="resizing" class="resize-mask"></div>
    </div>
    <div class="composer">
      <div class="composer__tip">输入后按回车同时发送到全部 {{ siteList.length }} 个 AI 页面，Shift + Enter 换行</div>
      <div class="composer__row">
        <el-input
          ref="inputRef"
          v-model="input"
          class="composer__input"
          type="textarea"
          resize="none"
          clearable
          :autosize="{ minRows: 2, maxRows: 5 }"
          placeholder="请输入内容，回车同时发送到所有 AI 页面"
          @keydown.enter="onEnter"
        ></el-input>
        <el-button type="primary" class="composer__send" :icon="Position" :disabled="!input.trim()" @click="onEnter()"> 发送 </el-button>
      </div>
    </div>

    <el-dialog v-model="siteDialog.visible" :title="siteDialog.mode === 'add' ? '新增 AI 页面' : '编辑标题和地址'" width="460px" append-to-body>
      <el-form label-width="56px" @submit.prevent>
        <el-form-item label="标题">
          <el-input v-model="siteDialog.title" maxlength="20" clearable placeholder="如：DeepSeek" @keyup.enter="confirmDialog"></el-input>
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="siteDialog.src" clearable placeholder="https://example.com/chat" @keyup.enter="confirmDialog"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="siteDialog.visible = false">取消</el-button>
        <el-button type="primary" :disabled="!dialogValid" @click="confirmDialog">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { EditPen, Plus, Position } from "@element-plus/icons-vue";
import Webview from "@/vue/components/Webview/index.vue";
import { weixinUserAgent } from "@/vue/config/constant";
import { message } from "@/vue/utils/message";
defineOptions({ name: "HomeWebAIIndex", title: "webAI" });

const input = ref("");
const inputRef = ref();

/** 调色板：新增站点标题前圆点颜色 */
const PALETTE = ["#4d6bfe", "#615ced", "#2932e1", "#3859ff", "#3b7cff", "#00b96b", "#f56c6c", "#e6a23c", "#9c27b0", "#009688"];

/** Webview 组件通过 defineExpose 暴露出来的能力 */
interface WebviewExpose {
  exec: <T = unknown>(code: string) => Promise<T>;
  guestReady: boolean;
  /** 聚焦 guest 页面内容 */
  focusGuest: () => void;
  /** 经真实输入管线插入文本（等效人工键入） */
  insertText: (text: string) => Promise<void>;
  /** 发送真实按键事件（keyDown + keyUp） */
  sendKey: (keyCode: string) => Promise<void>;
}

/** 站点记录：支持新增/编辑/显隐，并持久化到 localStorage */
interface SiteRecord {
  id: string;
  /** 标题：展示在每个 webview 上方，右键可编辑 */
  title: string;
  /** 页面地址，右键可编辑 */
  src: string;
  /** 标题前小圆点颜色（仅用于区分站点） */
  color: string;
  /** 是否显示：隐藏时宽度置 0 但保留渲染（不卸载 webview） */
  visible: boolean;
  /** 栏宽（%），隐藏时保留数值便于恢复 */
  width: number;
}

/** 注入脚本需要的站点配置（按地址动态解析） */
interface SiteFillConfig {
  /** 输入框候选选择器：按序尝试，命中外层节点会自动下钻查找可编辑元素 */
  selectors: string[];
  /** 发送按钮选择器（可选）：填入后等它解除禁用，确认框架已同步内部状态 */
  sendButtonSelectors?: string[];
}

const STORAGE_KEY = "hailen-webai-sites";

/** 默认站点列表（本地无缓存时使用） */
const DEFAULT_SITES: SiteRecord[] = [
  { id: "deepseek", title: "DeepSeek", src: "https://chat.deepseek.com/", color: "#4d6bfe", visible: true, width: 20 },
  { id: "qianwen", title: "通义千问", src: "https://www.qianwen.com/chat", color: "#615ced", visible: true, width: 20 },
  { id: "wenxin", title: "文心一言", src: "https://wenxin.baidu.com/", color: "#2932e1", visible: true, width: 20 },
  { id: "chatglm", title: "智谱清言", src: "https://chatglm.cn/main/alltoolsdetail?lang=zh", color: "#3859ff", visible: true, width: 20 },
  { id: "doubao", title: "豆包", src: "https://www.doubao.com/chat/", color: "#3b7cff", visible: true, width: 20 }
];

/** 从本地存储读取站点列表；无缓存或解析失败时退回默认列表 */
function loadSites(): SiteRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed
          .filter((it) => it && typeof it.title === "string" && typeof it.src === "string")
          .map((it, index) => ({
            id: String(it.id || `site-${index}`),
            title: it.title,
            src: it.src,
            color: typeof it.color === "string" ? it.color : PALETTE[index % PALETTE.length],
            visible: it.visible !== false,
            width: typeof it.width === "number" && it.width > 0 ? it.width : 0
          }));
      }
    }
  } catch {
    /* 解析失败时退回默认列表 */
  }
  return DEFAULT_SITES.map((it) => ({ ...it }));
}

const siteList = ref<SiteRecord[]>(loadSites());

/** 可见站点（顶部多选的选中项 = 显示项） */
const visibleSites = computed(() => siteList.value.filter((item) => item.visible));

/** 顶部多选：默认全选（含动态新增），取消选中即隐藏 */
const visibleIds = computed<string[]>({
  get: () => visibleSites.value.map((item) => item.id),
  set: (ids) => {
    const idSet = new Set(ids);
    siteList.value.forEach((item) => {
      item.visible = idSet.has(item.id);
    });
    rebalance();
    saveSites();
  }
});

/** 生成新站点 id */
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** 把可见栏的宽度比例归一到合计 100%（宽度为 0 的栏先按剩余栏均分） */
function rebalance() {
  const visible = siteList.value.filter((item) => item.visible);
  if (!visible.length) return;
  let sum = visible.reduce((acc, item) => acc + Math.max(item.width, 0), 0);
  if (sum <= 0) {
    visible.forEach((item) => (item.width = 100 / visible.length));
    return;
  }
  // 新加/重新显示但尚无有效宽度的栏，先均分再归一
  const zeros = visible.filter((item) => item.width <= 0);
  if (zeros.length) {
    const share = sum / Math.max(visible.length - zeros.length, 1);
    zeros.forEach((item) => (item.width = share));
    sum = visible.reduce((acc, item) => acc + item.width, 0);
  }
  visible.forEach((item) => (item.width = (item.width / sum) * 100));
}

/** 站点列表持久化到本地存储 */
function saveSites() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(siteList.value.map(({ id, title, src, color, visible, width }) => ({ id, title, src, color, visible, width }))));
  } catch {
    /* 写入失败不影响使用 */
  }
}

// ==================== 新增 / 编辑弹窗 ====================

const siteDialog = reactive({
  visible: false,
  mode: "add" as "add" | "edit",
  id: "",
  title: "",
  src: ""
});

const dialogValid = computed(() => !!siteDialog.title.trim() && /^https?:\/\/.+/i.test(siteDialog.src.trim()));

function openAddDialog() {
  siteDialog.mode = "add";
  siteDialog.id = "";
  siteDialog.title = "";
  siteDialog.src = "";
  siteDialog.visible = true;
}

/** 右键标题 → 编辑标题和地址 */
function openEditDialog(site: SiteRecord) {
  siteDialog.mode = "edit";
  siteDialog.id = site.id;
  siteDialog.title = site.title;
  siteDialog.src = site.src;
  siteDialog.visible = true;
}

function confirmDialog() {
  if (!dialogValid.value) return;
  const title = siteDialog.title.trim();
  const src = siteDialog.src.trim();
  if (siteDialog.mode === "add") {
    // 新增站点默认显示，宽度为 0 由 rebalance 按剩余栏均分
    siteList.value.push({ id: genId(), title, src, color: PALETTE[siteList.value.length % PALETTE.length], visible: true, width: 0 });
    rebalance();
  } else {
    const target = siteList.value.find((item) => item.id === siteDialog.id);
    if (target) {
      target.title = title;
      target.src = src;
    }
  }
  siteDialog.visible = false;
  saveSites();
}

// ==================== 按地址解析注入脚本配置 ====================

const GENERIC_SELECTORS = ["textarea", "[contenteditable='true']"];

/** 已知站点按地址匹配专属选择器；未知站点走通用选择器 + 启发式兜底 */
function resolveSiteConfig(src: string): SiteFillConfig {
  if (/chat\.deepseek\.com/i.test(src)) {
    // TODO: DeepSeek 真实输入框选择器待核对（失配时自动走“页面最大可见输入框”兜底）
    return { selectors: ["textarea#chat-input", "textarea", "[contenteditable='true']"] };
  }
  if (/qianwen\.com/i.test(src)) {
    // 已实测：千问输入框是 Slate.js 富文本编辑器（contenteditable div），页面上没有 textarea
    return {
      selectors: ["div[data-slate-editor='true'][data-slate-node='value']", "div[data-slate-editor='true']", "[data-testid='chat-input-content-measure'] [role='textbox']"],
      // 已实测的发送按钮：可输入时解除禁用，可作为框架就绪信号
      sendButtonSelectors: ["button[aria-label='发送消息']"]
    };
  }
  if (/wenxin\.baidu\.com/i.test(src)) {
    // 已确认的输入框类名
    return { selectors: [".chat-textarea"] };
  }
  return { selectors: GENERIC_SELECTORS };
}

/** 每个 Webview 实例按站点 id 收集 */
const webviewRefs = ref<Record<string, WebviewExpose | undefined>>({});

/** v-for 内的函数式 ref：按站点 id 收集 Webview 暴露的实例 */
function setWebviewRef(el: unknown, id: string) {
  webviewRefs.value[id] = (el ?? undefined) as WebviewExpose | undefined;
}

// ==================== 拖拽调整各栏宽度 ====================

/** 单栏最小宽度（px） */
const MIN_PANE_WIDTH = 220;
const containerRef = ref<HTMLDivElement>();
/** 是否正在拖拽（拖拽期间显示遮罩，防止鼠标滑到 webview 上丢失事件） */
const resizing = ref(false);
/** 正在拖拽的分隔条所属站点 id */
const activeDragId = ref("");
/** 结束拖拽的回调（组件卸载时兜底清理） */
let stopResize: (() => void) | null = null;

/** 站点右侧是否还有可见栏（决定是否渲染分隔条） */
function hasNext(site: SiteRecord) {
  const visible = visibleSites.value;
  const index = visible.indexOf(site);
  return index >= 0 && index < visible.length - 1;
}

/** 站点右侧的下一个可见栏 */
function nextVisible(site: SiteRecord): SiteRecord | null {
  const visible = visibleSites.value;
  const index = visible.indexOf(site);
  return index >= 0 ? (visible[index + 1] ?? null) : null;
}

/** 按住分隔条拖拽，调整左右相邻两栏的宽度 */
function startResize(e: MouseEvent, left: SiteRecord) {
  stopResize?.();
  const right = nextVisible(left);
  const container = containerRef.value;
  if (!right || !container) return;
  const totalWidth = container.clientWidth;
  if (!totalWidth) return;

  const startX = e.clientX;
  const startLeft = left.width;
  const startRight = right.width;
  const pairTotal = startLeft + startRight;
  // 最小宽度换算为百分比，且不允许超过两栏当前宽度
  const minPercent = Math.min((MIN_PANE_WIDTH / totalWidth) * 100, startLeft, startRight);

  resizing.value = true;
  activeDragId.value = left.id;

  const onMove = (ev: MouseEvent) => {
    const delta = ((ev.clientX - startX) / totalWidth) * 100;
    const nextLeft = Math.min(Math.max(startLeft + delta, minPercent), pairTotal - minPercent);
    left.width = nextLeft;
    right.width = pairTotal - nextLeft;
  };
  const onUp = () => {
    resizing.value = false;
    activeDragId.value = "";
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onUp);
    stopResize = null;
    saveSites();
  };
  stopResize = onUp;

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onUp);
}

onBeforeUnmount(() => stopResize?.());

// 初始化时校正一次宽度比例（兼容旧缓存 / 新加站点）
rebalance();

interface PrepareResult {
  ok: boolean;
  reason?: string;
  via?: string;
  tag?: string;
  cls?: string;
  /** 未找到输入框时返回页面可编辑元素摘要，便于排查 */
  debug?: Array<Record<string, string>>;
}

interface SettleResult {
  filled: boolean;
  /** 发送按钮是否已解除禁用（说明框架已同步内部状态） */
  ready: boolean;
  reason?: string;
}

interface SentResult {
  sent: boolean;
  via?: string;
  reason?: string;
}

/**
 * 准备脚本：定位输入框、聚焦并清空旧草稿，并把目标元素记录到 guest 的 window.__webAIEl，
 * 供后续 settle / sent 脚本复用（DOM 节点无法跨进程返回宿主）
 */
function buildPrepareScript(config: SiteFillConfig): string {
  return `
(async () => {
  const SELECTORS = ${JSON.stringify(config.selectors)};
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const isVisible = (node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return rect.width > 60 && rect.height > 8 && style.display !== "none" && style.visibility !== "hidden";
  };

  const summarize = (node) => {
    const rect = node.getBoundingClientRect();
    return {
      tag: node.tagName,
      id: node.id || "",
      cls: String(node.className || "").slice(0, 120),
      ph: node.getAttribute("placeholder") || node.getAttribute("data-placeholder") || node.getAttribute("aria-label") || "",
      size: Math.round(rect.width) + "x" + Math.round(rect.height),
    };
  };

  const pick = () => {
    for (const sel of SELECTORS) {
      let hits = [];
      try { hits = Array.from(document.querySelectorAll(sel)); } catch (err) { continue; }
      for (const hit of hits) {
        const editable = hit.matches("textarea, input, [contenteditable='true']")
          ? hit
          : hit.querySelector("textarea, input, [contenteditable='true']");
        if (editable && isVisible(editable)) return { el: editable, via: sel };
      }
    }
    // 兜底：取页面上面积最大的可见可编辑元素（聊天输入框通常最大且在页面底部）
    const list = Array.from(document.querySelectorAll("textarea, [contenteditable='true']")).filter(isVisible);
    list.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return rb.width * rb.height - ra.width * ra.height;
    });
    return list[0] ? { el: list[0], via: "heuristic" } : null;
  };

  // SPA 输入框异步渲染，最多重试 10 次（约 3 秒）
  let found = null;
  for (let i = 0; i < 10 && !found; i++) {
    found = pick();
    if (!found) await sleep(300);
  }
  if (!found) {
    // 找不到时输出页面上所有可编辑候选，便于排查真实选择器
    const debug = Array.from(document.querySelectorAll("textarea, input, [contenteditable], [role='textbox']"))
      .slice(0, 20)
      .map(summarize);
    return { ok: false, reason: "input-not-found", debug };
  }

  const el = found.el;
  window.__webAIEl = el;
  el.focus();
  // 清空已有草稿：之后经真实输入管线插入的文字会直接替换整个选区
  try {
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      el.select();
    } else {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } catch (err) { /* 选区设置失败不影响后续插入 */ }
  return { ok: true, via: found.via, tag: el.tagName, cls: String(el.className || "").slice(0, 120) };
})()
`;
}

/**
 * 校验脚本：确认文字已进入输入框（失败则走注入备用方案），并等待站点框架就绪
 * （配置了发送按钮的站点等按钮解除禁用；未配置则固定延时）
 */
function buildSettleScript(config: SiteFillConfig, text: string): string {
  return `
(async () => {
  const TEXT = ${JSON.stringify(text)};
  const SEND_SELECTORS = ${JSON.stringify(config.sendButtonSelectors ?? [])};
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const el = window.__webAIEl;
  if (!el || !el.isConnected) return { filled: false, ready: false, reason: "target-lost" };
  const readBack = () => ((el.isContentEditable ? el.textContent : el.value) || "");
  let filled = readBack().includes(TEXT);

  if (!filled) {
    // 备用注入（真实输入管线未生效时）：注意部分框架（如 Slate）不会同步此途径的输入
    el.focus();
    if (el.isContentEditable) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("insertText", false, TEXT);
      if (!readBack().includes(TEXT)) {
        // 再备用：手动派发 beforeinput（对部分富文本框架有效）
        el.dispatchEvent(new InputEvent("beforeinput", { inputType: "insertText", data: TEXT, bubbles: true, cancelable: true, composed: true }));
      }
    } else {
      // React/Vue 受控组件：直接赋 value 会被框架回滚，必须用原生 setter + input 事件
      const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value").set.call(el, TEXT);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    filled = readBack().includes(TEXT);
  }

  // 就绪等待：已配置发送按钮的站点，等按钮解除禁用（说明框架已同步内部 state）
  let ready = true;
  if (SEND_SELECTORS.length > 0) {
    ready = false;
    for (let i = 0; i < 8; i++) {
      let btn = null;
      for (const sel of SEND_SELECTORS) {
        try { btn = document.querySelector(sel); } catch (err) { btn = null; }
        if (btn) break;
      }
      if (!btn || !btn.disabled) { ready = true; break; }
      await sleep(150);
    }
  } else {
    // 无发送按钮配置时用固定延时兜底
    await sleep(150);
  }
  return { filled, ready };
})()
`;
}

/**
 * 回执脚本：轮询输入框文字是否消失判断回车是否被消费；
 * 真实按键未被消费时，自动退回页内合成回车序列
 */
function buildSentPollScript(text: string): string {
  return `
(async () => {
  const TEXT = ${JSON.stringify(text)};
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const el = window.__webAIEl;
  if (!el || !el.isConnected) return { sent: false, reason: "target-lost" };
  const readBack = () => ((el.isContentEditable ? el.textContent : el.value) || "");
  const waitGone = async (rounds) => {
    for (let i = 0; i < rounds; i++) {
      if (!readBack().includes(TEXT)) return true;
      await sleep(200);
    }
    return !readBack().includes(TEXT);
  };

  // 宿主已发送真实按键，优先等它生效
  if (await waitGone(6)) return { sent: true, via: "real-key" };

  // 未被消费：退回页内合成回车序列
  const fire = (type) => {
    const evt = new KeyboardEvent(type, { key: "Enter", code: "Enter", bubbles: true, cancelable: true, composed: true });
    // 部分站点读 keyCode / which，构造函数不会写入这两个字段，手动补齐
    Object.defineProperty(evt, "keyCode", { get: () => 13 });
    Object.defineProperty(evt, "which", { get: () => 13 });
    el.dispatchEvent(evt);
  };
  fire("keydown");
  fire("keypress");
  fire("keyup");
  if (await waitGone(6)) return { sent: true, via: "synthetic-key" };
  return { sent: false };
})()
`;
}

async function fillAndSend(site: SiteRecord, text: string) {
  const comp = webviewRefs.value[site.id];
  if (!comp?.exec) {
    console.warn(`[webAI] ${site.title}：webview 尚未就绪，已跳过`);
    return;
  }
  try {
    const config = resolveSiteConfig(site.src);
    // 1. 定位输入框、聚焦并清空旧草稿（目标元素记录在 guest 的 window.__webAIEl 上供后续脚本复用）
    const prep = await comp.exec<PrepareResult>(buildPrepareScript(config));
    if (!prep?.ok) {
      console.warn(`[webAI] ${site.title}：未找到输入框（${prep?.reason}），请核对 selectors`);
      if (prep?.debug?.length) {
        console.warn(`[webAI] ${site.title}：页面可编辑元素候选：`, prep.debug);
      }
      return;
    }

    // 2. 首选真实输入管线插入文本（等效人工键入，Slate 等富文本框架能同步状态、点亮发送按钮）
    try {
      comp.focusGuest();
      await comp.insertText(text);
    } catch (err) {
      console.warn(`[webAI] ${site.title}：真实输入管线调用失败，将走注入备用方案`, err);
    }

    // 3. 校验文字是否写入（失败则走备用注入）+ 等待框架就绪（发送按钮解除禁用）
    const settle = await comp.exec<SettleResult>(buildSettleScript(config, text));
    if (!settle?.filled) {
      console.warn(`[webAI] ${site.title}：文字未能进入输入框（命中 ${prep.tag}.${prep.cls}，via: ${prep.via}）`);
      return;
    }
    if (!settle.ready) {
      console.warn(`[webAI] ${site.title}：发送按钮未点亮（文字可能未同步到页面状态），仍尝试回车`);
    }

    // 4. 回车发送：先发真实按键，脚本轮询未被消费时自动退回页内合成回车
    try {
      comp.focusGuest();
      await comp.sendKey("Enter");
    } catch (err) {
      console.warn(`[webAI] ${site.title}：真实按键发送失败，将走页内合成回车`, err);
    }
    const poll = await comp.exec<SentResult>(buildSentPollScript(text));
    if (poll?.sent) {
      console.info(`[webAI] ${site.title}：已自动填入并回车发送（回车: ${poll.via}，输入: ${prep.via}）`);
    } else {
      console.warn(`[webAI] ${site.title}：已填入但回车未被消费（命中 ${prep.tag}.${prep.cls}，via: ${prep.via}）`);
    }
  } catch (err) {
    console.error(`[webAI] ${site.title}：注入执行失败`, err);
  }
}

/** 公共输入框回车（或点击发送按钮）：同时填充并回车所有 webAI 页面（含隐藏的） */
async function onEnter(e?: KeyboardEvent) {
  // 中文输入法选词过程中的回车不触发发送
  if (e && (e.isComposing || e.keyCode === 229)) return;
  // Shift + Enter 换行（textarea 默认行为）
  if (e?.shiftKey) return;
  // 阻止回车在 textarea 中插入换行
  e?.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  // 发送目标是全部站点（隐藏的也照发，勾选多选仅控制显示）
  const targets = siteList.value;
  if (!targets.length) {
    message.warning("站点列表为空，请先新增 AI 页面");
    return;
  }
  input.value = "";
  inputRef.value?.focus();
  await Promise.allSettled(targets.map((site) => fillAndSend(site, text)));
  // 真实按键会聚焦 guest 页面，发送完成后把焦点还给公共输入框
  inputRef.value?.focus();
}
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);

  &__filter {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__select {
    width: 280px;
  }
}

.panes {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  &.is-resizing .ai-pane {
    transition: none;
  }
}

.ai-pane {
  position: relative;
  display: flex;
  flex: none;
  flex-direction: column;
  min-width: 0;
  transition: width 0.2s ease;

  /** 隐藏态：宽度置 0 但保留渲染（不卸载 webview），恢复显示时状态不丢失 */
  &.is-hidden {
    overflow: hidden;
  }

  :deep(.el-dropdown) {
    display: block;
    flex: none;
    width: 100%;
  }

  &__header {
    display: flex;
    flex: none;
    gap: 8px;
    align-items: center;
    height: 34px;
    padding: 0 12px;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  &__title {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -3px;
  bottom: 0;
  z-index: 10;
  width: 6px;
  cursor: col-resize;
  user-select: none;

  &::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    content: "";
    background: var(--el-border-color-lighter);
    transform: translateX(-50%);
    transition:
      width 0.2s,
      background-color 0.2s;
  }

  &:hover::after,
  &.is-active::after {
    width: 2px;
    background: var(--el-color-primary);
  }
}

/** 拖拽期间的透明遮罩：接管鼠标事件，避免光标滑过 webview 时丢失 mousemove */
.resize-mask {
  position: absolute;
  inset: 0;
  z-index: 100;
  cursor: col-resize;
}

.composer {
  flex-shrink: 0;
  padding: 12px 16px 14px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 -6px 18px rgba(31, 45, 61, 0.06);

  &__tip {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  &__input {
    flex: 1;

    :deep(.el-textarea__inner) {
      padding: 6px 14px;
      font-size: 14px;
      line-height: 22px;
      border-radius: 10px;
      background: var(--el-fill-color-light);
      box-shadow: 0 0 0 1px var(--el-border-color) inset;
      transition:
        box-shadow 0.2s,
        background-color 0.2s;

      &:hover {
        box-shadow: 0 0 0 1px var(--el-border-color-darker) inset;
      }

      &:focus {
        background: var(--el-bg-color);
        box-shadow: 0 0 0 1.5px var(--el-color-primary) inset;
      }
    }
  }

  &__send {
    height: 56px;
    padding: 0 26px;
    font-size: 14px;
    border-radius: 10px;
  }
}
</style>
