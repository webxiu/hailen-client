import { CSSProperties, Ref, onMounted, ref } from "vue";
import { getSuspendPosition, setSuspendPosition } from "@/vue/utils/storage";

/** 拖拽元素的初始位置配置 */
interface PositionOptionType {
  /** 距顶部初始距离 */
  top?: number;
  /** 距左侧初始距离 */
  left?: number;
  /** 过渡动画时长 */
  delay?: number;
  /** 距离左右间距 */
  distance?: number;
}

/**
 * 拖拽浮动元素
 * @param domRef 拖拽元素
 * @param positionKey 本地存储key
 * @param options 配置选项
 */
export function useMove(domRef: Ref<HTMLElement | undefined>, positionKey: string, options?: PositionOptionType) {
  const { top = 500, left = 10, distance = 10, delay = 0.5 } = options || {};
  const isMove = ref<boolean>(false); // 是否移动按钮
  const position = getSuspendPosition(positionKey); // 上次移动位置

  const domStyle = ref<CSSProperties>({
    top: `${position.top || top}px`,
    left: `${position.left || left}px`,
    transition: "none"
  });

  onMounted(() => {
    if (domRef.value) {
      domRef.value.style.position = "fixed";
    }
  });

  // 处理边界
  const limitMoveArea = (left: number, top: number) => {
    if (!domRef.value) return { top, left };
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const oW = domRef.value.offsetWidth;
    const offset = oW / 2;
    if (top < 0) top = 0;
    if (left < 0) left = 0;
    if (top + offset > height) top = height - offset;
    if (left + offset > width) left = width - offset;
    return { top, left };
  };

  // 按压
  const onTouchstart = (e: TouchEvent) => {
    e.stopPropagation();
    isMove.value = true;
  };

  // 移动
  const onTouchmove = (e: TouchEvent) => {
    if (!domRef.value || !isMove.value) return;
    e.stopPropagation();
    e.preventDefault();
    const { clientX, clientY } = e.changedTouches[0];
    const oW = domRef.value.offsetWidth;
    const { top, left } = limitMoveArea(clientX, clientY);
    const mTop = clientY < oW / 2 ? 0 : top - oW / 2;
    const mLeft = clientX < oW / 2 ? 0 : left - oW / 2;
    domStyle.value = { top: mTop + "px", left: mLeft + "px", transition: "none" };
  };

  // 抬起
  const onTouchend = (e: TouchEvent) => {
    if (!domRef.value || !isMove.value) return;
    isMove.value = false;
    const width = document.documentElement.clientWidth;
    const { clientX, clientY } = e.changedTouches[0];
    const oW = domRef.value.offsetWidth;
    const moveRightPos = width - oW - distance;
    const newLeft = clientX > width / 2 ? moveRightPos : distance;
    const { top, left } = limitMoveArea(newLeft, clientY);
    const nTop = top <= 0 ? 0 : top - oW / 2;
    const nLeft = left <= 0 ? 0 : left;
    domStyle.value = { top: nTop + "px", left: nLeft + "px", transition: `all ${delay}s` };
    setSuspendPosition(positionKey, { top, left });
  };

  return { onTouchstart, onTouchmove, onTouchend, domStyle };
}
