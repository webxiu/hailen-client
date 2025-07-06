import { Ref, onMounted, ref } from "vue";

/** 事件选项类型 */
interface EventOptionType {
  /** 外层元素 */
  wrapRef: Ref<HTMLElement>;
  /** 滚动元素 */
  scrollRef: Ref<HTMLElement>;
}

/** 元素移动 */
export function useMoveEvent(options: EventOptionType) {
  const { wrapRef, scrollRef } = options;
  const translateX = ref(0);
  const startX = ref(0);
  const elementX = ref(0);
  const isMove = ref(false);

  onMounted(() => {
    if (!wrapRef.value || !scrollRef.value) return;
    wrapRef.value.addEventListener("mousedown", onMouseDown);
  });

  function moveToView(distX) {
    translateX.value = distX;
    scrollRef.value.style.transform = `translateX(${translateX.value}px)`;
  }

  function onMouseDown(ev) {
    startX.value = ev.clientX;
    elementX.value = translateX.value; // 保存元素当前的位置
    scrollRef.value.style.transition = "transform 0.3s cubic-bezier(0.26, 1, 0.68, 1)";

    wrapRef.value.addEventListener("mousemove", onMouseMove);
    wrapRef.value.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseup", onMouseUp); // 防止在元素外释放鼠标
  }

  function onMouseMove(ev) {
    isMove.value = true;
    const distX = ev.clientX - startX.value;
    translateX.value = elementX.value + distX; // 基于原始位置计算新位置
    const minX = wrapRef.value.clientWidth - scrollRef.value.offsetWidth;

    if (translateX.value > 0) {
      const scale = (wrapRef.value.offsetWidth / (wrapRef.value.scrollWidth + translateX.value)) * 1.5;
      translateX.value = elementX.value + distX * scale;
    } else if (translateX.value < minX) {
      const scale = (wrapRef.value.offsetWidth / (wrapRef.value.scrollWidth - translateX.value)) * 1.5;
      translateX.value = elementX.value + distX * scale;
    }
    scrollRef.value.style.transform = `translateX(${translateX.value}px)`;
  }

  function onMouseUp() {
    if (!isMove.value) return;
    // scrollRef.value.style.transition = "transform 0.3s ease-in-out";
    const minX = wrapRef.value.clientWidth - scrollRef.value.offsetWidth;
    if (translateX.value > 0) {
      translateX.value = 0;
      scrollRef.value.style.transform = `translateX(${translateX.value}px)`;
    } else if (translateX.value < minX) {
      translateX.value = minX;
      scrollRef.value.style.transform = `translateX(${translateX.value}px)`;
    }

    wrapRef.value.removeEventListener("mousemove", onMouseMove);
    wrapRef.value.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mouseup", onMouseUp);
  }
  const rubberOffset = ref(0); // 新增响应式变量
  const isDragging = ref(false);
  const isAnimating = ref(false);

  function onWheel(ev) {
    console.log("111", 111);

    ev.preventDefault();
    const wrapWidth = wrapRef.value?.offsetWidth || 0;
    const tabWidth = scrollRef.value?.offsetWidth || 0;
    const scrollWidth = tabWidth - wrapWidth;

    // 当前是否在边界内？
    const atRightEdge = translateX.value >= 0;
    const atLeftEdge = translateX.value <= -scrollWidth;

    const x = -ev.deltaY; // 滚动方向（正值向右）

    // ===== 引入 rubberOffset =====
    if (!isDragging.value && !isAnimating.value) {
      if (atRightEdge && x > 0) {
        // 右侧边界继续向右滚动，添加弹性偏移
        const maxRubber = 50;
        const delta = Math.min(x * 0.5, maxRubber);
        rubberOffset.value += delta;
      } else if (atLeftEdge && x < 0) {
        // 左侧边界继续向左滚动，添加弹性偏移
        const maxRubber = 50;
        const delta = Math.min(-x * 0.5, maxRubber);
        rubberOffset.value -= delta;
      } else {
        // 正常滚动范围
        translateX.value = Math.max(Math.min(translateX.value + x, 0), -scrollWidth);
        rubberOffset.value = 0;
      }

      // 应用变换
      scrollRef.value.style.transition = "none";
      scrollRef.value.style.transform = `translateX(${translateX.value + rubberOffset.value}px)`;

      // 开始回弹动画
      startAnimation();
    }
  }

  function startAnimation() {
    if (isAnimating.value || rubberOffset.value === 0) return;

    isAnimating.value = true;
    let offset = rubberOffset.value;
    const friction = 0.85;

    function step() {
      offset *= friction;
      if (Math.abs(offset) > 0.1) {
        scrollRef.value.style.transform = `translateX(${translateX.value + offset}px)`;
        requestAnimationFrame(step);
      } else {
        offset = 0;
        scrollRef.value.style.transition = "transform 0.5s cubic-bezier(0.26, 1, 0.68, 1)";
        scrollRef.value.style.transform = `translateX(${translateX.value}px)`;
        rubberOffset.value = 0;
        isAnimating.value = false;
      }
    }

    requestAnimationFrame(step);
  }

  function onStepMove(offset: number) {
    scrollRef.value.style.transition = "transform 0.5s cubic-bezier(0.26, 1, 0.68, 1)";

    const scrollbarDomWidth = wrapRef.value ? wrapRef.value?.offsetWidth : 0;
    const tabDomWidth = scrollRef.value ? scrollRef.value.offsetWidth : 0;
    if (offset > 0) {
      translateX.value = Math.min(0, translateX.value + offset);
    } else {
      if (scrollbarDomWidth < tabDomWidth) {
        if (translateX.value >= -(tabDomWidth - scrollbarDomWidth)) {
          translateX.value = Math.max(translateX.value + offset, scrollbarDomWidth - tabDomWidth);
        }
      } else {
        translateX.value = 0;
      }
    }
    scrollRef.value.style.transform = `translateX(${translateX.value}px)`;
  }

  return { translateX, onWheel, onStepMove, moveToView };
}
