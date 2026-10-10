import { onMounted, onUnmounted } from "vue";

export const canvasResize = ({ canvas, wrapDom, immediate = true }, callback = (opt) => {}) => {
  const observer = new ResizeObserver(() => resize());
  observer.observe(wrapDom);

  // 窗口尺寸变化
  function resize() {
    if (!document.contains(wrapDom)) return unmount();
    if (!immediate) return (immediate = false);
    const { width, height } = wrapDom.getBoundingClientRect();
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasSize({ width, height });
    ctx.putImageData(imageData, 0, 0);
    callback({ width, height });
  }

  // 设置canvas宽高
  function setCanvasSize({ width, height }) {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
  }

  function unmount() {
    observer.disconnect();
  }

  return { resize, unmount };
};
