<template>
  <div class="ui-ta-c">
    <div class="tip p-10">{{ title }}</div>
    <div>
      <canvas ref="lockCanvasRef" class="border-line"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

interface Props {
  /** 画布边长(px) */
  size?: number;
  /** 顶部提示文字 */
  title?: string;
  /** 是否显示点位编号(调试用) */
  showNumbers?: boolean;
}

interface PointItemType {
  x: number;
  y: number;
  id: number;
  selected: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 300,
  title: "9宫格解锁",
  showNumbers: true
});

const emits = defineEmits<{
  (e: "unlock", password: string): void;
}>();

/* ===================== 常量 ===================== */
/** 点阵与画布边缘的间距 */
const PADDING = 50;
/** 外圈半径(同时作为命中判定半径) */
const RING_RADIUS = 20;
/** 内点半径 */
const DOT_RADIUS = 8;
/** 选中态颜色(外圈/内点/连线) */
const ACTIVE_COLOR = "#2196F3";
/** 手势结束后自动重置的延迟(ms) */
const RESET_DELAY = 1000;

/* ===================== 内部状态 ===================== */
const lockCanvasRef = ref<HTMLCanvasElement>();

let canvasEl: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
/** 3x3 点位 */
let points: PointItemType[] = [];
/** 当前选中路径 */
let path: PointItemType[] = [];
let isDragging = false;
/** 指针的画布坐标(拖动时用于绘制尾部虚线) */
let lastMouse = { x: 0, y: 0 };
/** 手势期间缓存的画布位置,避免高频 getBoundingClientRect 触发回流 */
let cachedRect: DOMRect | null = null;
/** 自动重置定时器句柄 */
let resetTimer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  initCanvas();
  bindEvents();
});

onUnmounted(() => {
  clearResetTimer();
  unbindEvents();
});

// size 变化时重建画布与点位
watch(
  () => props.size,
  () => initCanvas()
);

/* ===================== 初始化 ===================== */

/** 初始化画布尺寸(DPR 适配)、点位并完成首次绘制 */
function initCanvas() {
  const canvas = lockCanvasRef.value;
  if (!canvas) return;
  canvasEl = canvas;
  ctx = canvas.getContext("2d");
  if (!ctx) return;

  clearResetTimer();
  isDragging = false;
  cachedRect = null;

  // DPR 适配:物理像素铺满、CSS 像素定尺寸,避免高分屏/系统缩放下模糊
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(props.size * dpr);
  canvas.height = Math.round(props.size * dpr);
  canvas.style.width = `${props.size}px`;
  canvas.style.height = `${props.size}px`;
  ctx.scale(dpr, dpr); // 此后所有绘制均使用 CSS 像素坐标

  // 生成 3x3 点位(1~9)
  const usable = props.size - PADDING * 2;
  points = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      points.push({
        x: Math.round(PADDING + (col * usable) / 2),
        y: Math.round(PADDING + (row * usable) / 2),
        id: row * 3 + col + 1,
        selected: false
      });
    }
  }
  path = [];
  draw();
}

/* ===================== 指针事件(统一鼠标/触摸/笔) ===================== */

function bindEvents() {
  if (!canvasEl) return;
  canvasEl.addEventListener("pointerdown", onPointerDown);
  canvasEl.addEventListener("pointermove", onPointerMove);
  canvasEl.addEventListener("pointerup", onPointerUp);
  canvasEl.addEventListener("pointercancel", onPointerCancel);
}

function unbindEvents() {
  if (!canvasEl) return;
  canvasEl.removeEventListener("pointerdown", onPointerDown);
  canvasEl.removeEventListener("pointermove", onPointerMove);
  canvasEl.removeEventListener("pointerup", onPointerUp);
  canvasEl.removeEventListener("pointercancel", onPointerCancel);
}

function onPointerDown(e: PointerEvent) {
  if (!canvasEl || e.button !== 0) return; // 仅响应主键/触摸/笔
  if (isDragging) return; // 忽略拖动期间的其他指针(多点触控)
  // 上一次手势尚在等待自动重置:立即清空残留,避免旧定时器/旧选中态影响新手势
  if (path.length > 0) reset();
  isDragging = true;
  // 捕获指针:拖出画布仍持续跟踪,只有真正松开才结束手势
  canvasEl.setPointerCapture(e.pointerId);
  cachedRect = canvasEl.getBoundingClientRect();
  handleMove(e);
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging) return;
  handleMove(e);
}

function onPointerUp(e: PointerEvent) {
  if (!isDragging || e.button !== 0) return;
  isDragging = false;
  cachedRect = null;

  // 空路径(未选中任何点)不触发 unlock,避免父组件发起无效请求
  if (path.length === 0) return;

  emits("unlock", path.map((p) => p.id).join(""));
  draw();
  resetTimer = setTimeout(reset, RESET_DELAY); // 稍作展示后自动重置
}

function onPointerCancel() {
  // 指针被系统中断(如系统手势接管):丢弃当前手势,不触发 unlock
  isDragging = false;
  cachedRect = null;
  reset();
}

/** 处理拖动中的指针位置:记录虚线端点并命中新点位 */
function handleMove(e: PointerEvent) {
  lastMouse = toCanvasPoint(e);
  const point = getNearestPoint(lastMouse.x, lastMouse.y);
  if (point) {
    point.selected = true;
    path.push(point);
  }
  draw();
}

/* ===================== 坐标换算与命中判定 ===================== */

/** 将指针坐标换算为画布坐标(兼容画布被 CSS 缩放的场景) */
function toCanvasPoint(e: PointerEvent): { x: number; y: number } {
  if (!canvasEl) return { x: 0, y: 0 };
  const rect = cachedRect ?? canvasEl.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) * props.size) / rect.width,
    y: ((e.clientY - rect.top) * props.size) / rect.height
  };
}

/** 获取命中的点位(落在外圈半径内且未被选中) */
function getNearestPoint(x: number, y: number): PointItemType | null {
  for (const p of points) {
    if (Math.hypot(p.x - x, p.y - y) < RING_RADIUS && !p.selected) {
      return p;
    }
  }
  return null;
}

/* ===================== 绘制 ===================== */

function draw() {
  const c = ctx;
  if (!c) return;
  c.clearRect(0, 0, props.size, props.size);

  // 所有点位:外圈 + 内点(+ 可选编号)
  points.forEach((p) => {
    // 外圈(未选中灰色,选中蓝色)
    c.beginPath();
    c.arc(p.x, p.y, RING_RADIUS, 0, Math.PI * 2);
    c.strokeStyle = p.selected ? ACTIVE_COLOR : "#ddd";
    c.lineWidth = 2;
    c.stroke();

    // 内点
    c.beginPath();
    c.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
    c.fillStyle = p.selected ? ACTIVE_COLOR : "#aaa";
    c.fill();

    if (props.showNumbers) {
      c.fillStyle = p.selected ? "#fff" : "#333";
      c.font = "12px Arial";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(String(p.id), p.x, p.y + 1);
    }
  });

  // 已选点连线
  if (path.length > 1) {
    c.beginPath();
    c.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      c.lineTo(path[i].x, path[i].y);
    }
    c.strokeStyle = ACTIVE_COLOR;
    c.lineWidth = 3;
    c.stroke();
  }

  // 拖动中:最后一个点到指针位置的临时虚线
  if (isDragging && path.length > 0) {
    const last = path[path.length - 1];
    c.beginPath();
    c.moveTo(last.x, last.y);
    c.lineTo(lastMouse.x, lastMouse.y);
    c.strokeStyle = "#999";
    c.setLineDash([5, 3]);
    c.lineWidth = 2;
    c.stroke();
    c.setLineDash([]);
  }
}

/* ===================== 重置 ===================== */

/** 清空选中状态与路径(已通过 defineExpose 暴露,父组件可在校验失败时主动调用) */
function reset() {
  clearResetTimer();
  points.forEach((p) => (p.selected = false));
  path = [];
  draw();
}

function clearResetTimer() {
  if (resetTimer !== null) {
    clearTimeout(resetTimer);
    resetTimer = null;
  }
}

defineExpose({ reset });
</script>

<style scoped>
canvas {
  /* 禁用触摸滚动/缩放手势,保证指针事件连续跟踪 */
  touch-action: none;
  /* 避免拖动绘制时触发文本选择 */
  user-select: none;
}
</style>
