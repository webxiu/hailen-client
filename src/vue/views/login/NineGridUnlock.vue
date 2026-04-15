<template>
  <div class="ui-ta-c">
    <div class="tip p-10">{{ tip }}</div>
    <div>
      <canvas ref="lockCanvasRef" class="border-line"></canvas>
    </div>
  </div>
</template>
<script setup lang="tsx">
import { onMounted, ref } from "vue";

interface PointItemType {
  x: number;
  y: number;
  id: number;
  selected: boolean;
}

const tip = ref("9宫格解锁");
const lockCanvasRef = ref<HTMLCanvasElement>();

onMounted(() => {
  onCreate();
});

function onCreate() {
  const canvas = lockCanvasRef.value as HTMLCanvasElement;
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  canvas.width = canvas.height = window.innerWidth * 0.8;
  const size = canvas.width;
  const padding = 50;
  const radius = 20;
  const pointRadius = 8;
  // 生成 3x3 点位 (1~9)
  const points: PointItemType[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = padding + (col * (size - 2 * padding)) / 2;
      const y = padding + (row * (size - 2 * padding)) / 2;
      points.push({ x: ~~x, y: ~~y, id: row * 3 + col + 1, selected: false });
    }
  }

  let path = []; // 当前选中路径 [point, point, ...]
  let isDragging = false;

  // 绘制整个锁屏
  function draw() {
    ctx.clearRect(0, 0, size, size);

    // 绘制所有点
    points.forEach((p) => {
      // 外圈（未选中灰色，选中蓝色）
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = p.selected ? "#2196F3" : "#ddd";
      ctx.lineWidth = 2;
      ctx.stroke();

      // 内点
      ctx.beginPath();
      ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
      ctx.fillStyle = p.selected ? "#2196F3" : "#aaa";
      ctx.fill();

      // 显示数字（可选，调试用）
      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = p.selected ? "#fff" : "#f6f6f6";
      ctx.fillText(p.id.toString(), p.x, p.y + 1.5);
    });

    // 绘制连线
    if (path.length > 1) {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.strokeStyle = "#2196F3";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 绘制从最后一个点到鼠标位置的临时线（拖动时）
    if (isDragging && path.length > 0) {
      const last = path[path.length - 1];
      const rect = canvas.getBoundingClientRect();
      const mouseX = lastMouse.x - rect.left;
      const mouseY = lastMouse.y - rect.top;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(mouseX, mouseY);
      ctx.strokeStyle = "#999";
      ctx.setLineDash([5, 3]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  let lastMouse = { x: 0, y: 0 };

  // 获取最近的点（距离小于 radius * 2）
  function getNearestPoint(x, y) {
    for (const p of points) {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius && !p.selected) {
        return p;
      }
    }
    return null;
  }

  // 重置状态
  function reset() {
    points.forEach((p) => (p.selected = false));
    path = [];
    draw();
  }

  // 鼠标/触摸事件
  canvas.addEventListener("mousedown", startDrag);
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    lastMouse = { x: touch.clientX, y: touch.clientY };
    startDrag(e);
  });

  function startDrag(e) {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    lastMouse = { x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY };

    const point = getNearestPoint(x, y);
    if (point) {
      point.selected = true;
      path.push(point);
    }
    draw();
  }

  canvas.addEventListener("mousemove", drag);
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    lastMouse = { x: touch.clientX, y: touch.clientY };
    drag(e);
  });

  function drag(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    lastMouse = { x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY };

    const point = getNearestPoint(x, y);
    if (point && !point.selected) {
      point.selected = true;
      path.push(point);
    }
    draw();
  }

  function endDrag() {
    if (isDragging) {
      isDragging = false;
      console.log(
        "解锁路径:",
        path.map((p) => p.id)
      );
      draw();
      // 这里可以校验密码，比如 path.map(p => p.id).join('') === '12369'
      setTimeout(reset, 1500); // 1.5秒后重置
    }
  }

  canvas.addEventListener("mouseup", endDrag);
  canvas.addEventListener("touchend", endDrag);
  canvas.addEventListener("mouseleave", endDrag);

  // 初始绘制
  draw();
}
</script>
