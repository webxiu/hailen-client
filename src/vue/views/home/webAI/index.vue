<template>
  <div class="dashboard flex-col">
    <div class="toolbar">
      <el-space :size="6" wrap>
        <el-button type="success" size="small" :icon="Plus" @click="openAddDialog">新增</el-button>
        <el-button
          v-for="item in siteList"
          :key="item.id"
          size="small"
          type="primary"
          round
          :plain="!item.visible"
          :title="item.visible ? '点击隐藏' : '点击显示'"
          @click="toggleVisible(item)"
        >
          {{ item.title }}
        </el-button>
      </el-space>
    </div>
    <div ref="containerRef" class="panes" :class="{ 'is-resizing': resizing }">
      <template v-for="item in siteList" :key="item.id">
        <div class="ai-pane" :class="{ 'is-hidden': !item.visible }" :style="{ width: item.visible ? `${item.width}%` : '0%' }">
          <el-dropdown trigger="contextmenu" @command="openEditDialog(item)">
            <div class="ai-pane__header" title="右键可编辑标题和地址">
              <span class="ai-pane__dot" :style="{ background: item.color }"></span>
              <span class="ai-pane__title">{{ item.title }}</span>
              <el-icon class="ai-pane__clear" :size="18" title="清理该页面缓存" @click.stop="openClearDialog(item)"><Brush /></el-icon>
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
      <div class="composer__tip">输入后按回车同时发送到全部 {{ visibleSites.length }} 个显示中的 AI 页面，Shift + Enter 换行</div>
      <div class="composer__row">
        <el-input
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
    <el-dialog v-model="clearDialog.visible" :title="`清理「${clearDialog.title}」缓存`" width="400px" append-to-body>
      <div class="clear-tip">只清理该页面所属域名的数据，其他 AI 页面不受影响；清理后该页面会自动刷新。</div>
      <template #footer>
        <el-button type="primary" plain @click="clearSite('cookie')">清理Cookie</el-button>
        <el-button type="danger" plain @click="clearSite('storage')">清理Storage</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { Brush, EditPen, Plus, Position } from "@element-plus/icons-vue";
import Webview from "@/vue/components/Webview/index.vue";
import { weixinUserAgent } from "@/vue/config/constant";
import { message } from "@/vue/utils/message";
defineOptions({ name: "HomeWebAIIndex", title: "webAI", icon: "Cpu", sort: 20 });

const input = ref("");

/** 调色板：新增站点标题前圆点颜色 */
const PALETTE = ["#4d6bfe", "#615ced", "#2932e1", "#3859ff", "#3b7cff", "#00b96b", "#f56c6c", "#e6a23c", "#9c27b0", "#009688"];

/** Webview 暴露的能力 */
interface WebviewExpose {
  exec: <T = unknown>(code: string) => Promise<T>;
  /** 经真实输入管线插入文本（等效人工键入）：Slate 等富文本站点只认这条 */
  insertText: (text: string) => Promise<void>;
  /** 发送真实按键事件（keyDown + keyUp） */
  sendKey: (keyCode: string) => Promise<void>;
  /** 当前 guest 页面的 webContents id（主进程据此定位它的 session） */
  getWebContentsId: () => number | undefined;
}

/** 站点记录 */
interface SiteRecord {
  id: string;
    title: string;
    src: string;
    color: string;
    visible: boolean;
    width: number;
}

/** 站点注入配置 */
interface SiteFillConfig {
    selectors: string[];
}

const STORAGE_KEY = "hailen-webai-sites";

const DEFAULT_SITES: SiteRecord[] = [
  { id: "deepseek", title: "DeepSeek", src: "https://chat.deepseek.com/", color: "#4d6bfe", visible: true, width: 20 },
  { id: "qianwen", title: "通义千问", src: "https://www.qianwen.com/chat", color: "#615ced", visible: true, width: 20 },
  { id: "wenxin", title: "文心一言", src: "https://wenxin.baidu.com/", color: "#2932e1", visible: true, width: 20 },
  { id: "chatglm", title: "智谱清言", src: "https://chatglm.cn/main/alltoolsdetail?lang=zh", color: "#3859ff", visible: true, width: 20 },
  { id: "doubao", title: "豆包", src: "https://www.doubao.com/chat/", color: "#3b7cff", visible: true, width: 20 }
];

/** 读取本地站点，失败回退默认 */
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

/** 显示中的站点 */
const visibleSites = computed(() => siteList.value.filter((item) => item.visible));

function toggleVisible(site: SiteRecord) {
  site.visible = !site.visible;
  rebalance();
  saveSites();
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** 可见栏宽度归一到 100% */
function rebalance() {
  const visible = siteList.value.filter((item) => item.visible);
  if (!visible.length) return;
  let sum = visible.reduce((acc, item) => acc + Math.max(item.width, 0), 0);
  if (sum <= 0) {
    visible.forEach((item) => (item.width = 100 / visible.length));
    return;
  }
  // 无宽度的栏先均分再归一
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
    // 新增站点默认显示，宽度由 rebalance 分配
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

// ==================== 清理单个页面缓存 ====================

const clearDialog = reactive({ visible: false, id: "", title: "" });

function openClearDialog(site: SiteRecord) {
  clearDialog.id = site.id;
  clearDialog.title = site.title;
  clearDialog.visible = true;
}

/** 清理本页 origin 的 Cookie 或 Storage，不影响其他页面 */
async function clearSite(scope: "cookie" | "storage") {
  const { id, title } = clearDialog;
  clearDialog.visible = false;
  const webContentsId = webviewRefs.value[id]?.getWebContentsId();
  if (!webContentsId) {
    message.warning(`${title}：页面尚未加载`);
    return;
  }
  try {
    const res = await window.electronAPI.clearSiteData({ webContentsId, scope });
    if (res?.ok) {
      message.success(`${title}：已清理${scope === "cookie" ? "Cookie" : "Storage"}`);
    } else {
      message.error(`${title}：清理失败（${res?.reason ?? "未知原因"}）`);
    }
  } catch (err) {
    console.error(`[webAI] ${title}：清理失败`, err);
    message.error(`${title}：清理失败`);
  }
}

// ==================== 按地址解析注入脚本配置 ====================

const GENERIC_SELECTORS = ["textarea", "[contenteditable='true']"];

/** 按地址解析输入框选择器 */
function resolveSiteConfig(src: string): SiteFillConfig {
  if (/chat\.deepseek\.com/i.test(src)) {
    // TODO: 选择器待核对，失配走启发式兜底
    return { selectors: ["textarea#chat-input", "textarea", "[contenteditable='true']"] };
  }
  if (/qianwen\.com/i.test(src)) {
    // 千问是 Slate 富文本（contenteditable），页面上没有 textarea
    return { selectors: ["div[data-slate-editor='true'][data-slate-node='value']", "div[data-slate-editor='true']", "[data-testid='chat-input-content-measure'] [role='textbox']"] };
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
/** 是否正在拖拽（拖拽时显示遮罩） */
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

/** 拖拽调整相邻两栏宽度 */
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
  // 最小宽度换算成百分比
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

// 初始化时校正一次宽度比例
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

/** 定位输入框、聚焦并记录到 window.__webAIEl 供后续脚本复用 */
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

  const editableOf = (node) =>
    node.matches("textarea, input, [contenteditable='true']")
      ? node
      : node.querySelector("textarea, input, [contenteditable='true']");

  /** 聚焦并全选旧草稿 */
  const focusAndSelect = (el) => {
    el.focus();
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
  };

  // 找过就直接复用
  if (window.__webAIEl && window.__webAIEl.isConnected) {
    const cached = window.__webAIEl;
    focusAndSelect(cached);
    return { ok: true, via: "cached", tag: cached.tagName, cls: String(cached.className || "").slice(0, 120) };
  }

  const pick = () => {
    for (const sel of SELECTORS) {
      let hits = [];
      try { hits = Array.from(document.querySelectorAll(sel)); } catch (err) { continue; }
      for (const hit of hits) {
        const editable = editableOf(hit);
        if (editable && isVisible(editable)) return { el: editable, via: sel };
      }
    }
    // 兜底：面积最大的可见可编辑元素
    const list = Array.from(document.querySelectorAll("textarea, [contenteditable='true']")).filter(isVisible);
    list.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return rb.width * rb.height - ra.width * ra.height;
    });
    return list[0] ? { el: list[0], via: "heuristic" } : null;
  };

  // SPA 异步渲染，最多重试 10 次
  let found = null;
  for (let i = 0; i < 10 && !found; i++) {
    found = pick();
    if (!found) await sleep(300);
  }
  if (!found) {
    // 找不到时回传候选元素便于排查
    const debug = Array.from(document.querySelectorAll("textarea, input, [contenteditable], [role='textbox']"))
      .slice(0, 20)
      .map(summarize);
    return { ok: false, reason: "input-not-found", debug };
  }

  const el = found.el;
  window.__webAIEl = el;
  focusAndSelect(el);
  return { ok: true, via: found.via, tag: el.tagName, cls: String(el.className || "").slice(0, 120) };
})()
`;
}

interface FillResult {
  filled: boolean;
  reason?: string;
}

/** 校验文字是否写入，没写入则注入兜底 */
function buildVerifyFillScript(text: string): string {
  return `
(async () => {
  const TEXT = ${JSON.stringify(text)};
  const el = window.__webAIEl;
  if (!el || !el.isConnected) return { filled: false, reason: "target-lost" };
  const read = () => ((el.isContentEditable ? el.textContent : el.value) || "");
  if (read().includes(TEXT)) return { filled: true };

  el.focus();
  if (el.isContentEditable) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand("insertText", false, TEXT);
    if (!read().includes(TEXT)) {
      el.dispatchEvent(new InputEvent("beforeinput", { inputType: "insertText", data: TEXT, bubbles: true, cancelable: true, composed: true }));
    }
  } else {
    // 受控组件必须用原生 setter + input 事件
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, TEXT);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  return { filled: read().includes(TEXT) };
})()
`;
}

interface SentResult {
  sent: boolean;
  via?: string;
  reason?: string;
}

/** 回车后确认输入框是否清空，没清空补一次合成回车 */
function buildVerifySentScript(text: string): string {
  return `
(async () => {
  const TEXT = ${JSON.stringify(text)};
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const el = window.__webAIEl;
  if (!el || !el.isConnected) return { sent: false, reason: "target-lost" };
  const read = () => ((el.isContentEditable ? el.textContent : el.value) || "");
  const gone = async (rounds) => {
    for (let i = 0; i < rounds; i++) {
      if (!read().includes(TEXT)) return true;
      await sleep(150);
    }
    return !read().includes(TEXT);
  };

  if (await gone(6)) return { sent: true, via: "real-key" };

  const fire = (type) => {
    const evt = new KeyboardEvent(type, { key: "Enter", code: "Enter", bubbles: true, cancelable: true, composed: true });
    // 补 keyCode / which
    Object.defineProperty(evt, "keyCode", { get: () => 13 });
    Object.defineProperty(evt, "which", { get: () => 13 });
    el.dispatchEvent(evt);
  };
  fire("keydown");
  fire("keypress");
  fire("keyup");
  return { sent: await gone(6), via: "synthetic-key" };
})()
`;
}

/** 填入后等框架同步状态再回车，太短会导致只填不发 */
const SEND_DELAY = 300;

async function fillAndSend(site: SiteRecord, text: string) {
  const comp = webviewRefs.value[site.id];
  if (!comp?.exec) {
    console.warn(`[webAI] ${site.title}：webview 尚未就绪，已跳过`);
    return;
  }
  try {
    // 1. 定位并聚焦输入框
    const prep = await comp.exec<PrepareResult>(buildPrepareScript(resolveSiteConfig(site.src)));
    if (!prep?.ok) {
      console.warn(`[webAI] ${site.title}：未找到输入框（${prep?.reason}），请核对 selectors`);
      if (prep?.debug?.length) {
        console.warn(`[webAI] ${site.title}：页面可编辑元素候选：`, prep.debug);
      }
      return;
    }

    // 2. 真实输入管线写入（Slate 只认这条）
    await comp.insertText(text);

    // 3. 校验写入，失败则注入兜底
    const fill = await comp.exec<FillResult>(buildVerifyFillScript(text));
    if (!fill?.filled) {
      console.warn(`[webAI] ${site.title}：文字没进输入框（${fill?.reason ?? "未确认"}，命中 ${prep.tag}.${prep.cls}，via: ${prep.via}）`);
      return;
    }

    // 4. 等框架同步状态后回车
    await new Promise((resolve) => setTimeout(resolve, SEND_DELAY));
    await comp.sendKey("Enter");

    // 5. 确认回车被消费，否则补合成回车
    const sent = await comp.exec<SentResult>(buildVerifySentScript(text));
    if (sent?.sent) {
      console.info(`[webAI] ${site.title}：已发送（回车: ${sent.via}，输入框: ${prep.via}）`);
    } else {
      console.warn(`[webAI] ${site.title}：回车没被消费（${sent?.reason ?? "输入框仍有文字"}，命中 ${prep.tag}.${prep.cls}，via: ${prep.via}）`);
    }
  } catch (err) {
    console.error(`[webAI] ${site.title}：发送失败`, err);
  }
}

/** 回车或点发送：只发显示中的页面 */
async function onEnter(e?: KeyboardEvent) {
  // 输入法选词中的回车不发送
  if (e && (e.isComposing || e.keyCode === 229)) return;
  // Shift + Enter 换行
  if (e?.shiftKey) return;
  // 阻止回车在 textarea 中插入换行
  e?.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  if (!siteList.value.length) {
    message.warning("站点列表为空，请先新增 AI 页面");
    return;
  }
  // 隐藏的页面不发送
  const targets = visibleSites.value;
  if (!targets.length) {
    message.warning("没有显示中的 AI 页面，请先点上方按钮打开一个");
    return;
  }
  input.value = "";
  await Promise.allSettled(targets.map((site) => fillAndSend(site, text)));
}
</script>

<style scoped lang="scss">
.toolbar {
  flex: none;
  padding: 8px 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
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

  /** 隐藏态 */
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

  /** 清理缓存按钮 */
  &__clear {
    flex: none;
    margin-left: auto;
    padding-left: 8px;
    color: var(--el-text-color-regular);
    cursor: pointer;

    &:hover {
      color: var(--el-color-danger);
    }
  }
}

.clear-tip {
  font-size: 13px;
  line-height: 20px;
  color: var(--el-text-color-regular);
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

/** 拖拽遮罩 */
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
