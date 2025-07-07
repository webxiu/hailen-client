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
    // 内容宽度小于外层宽度, 不允许拖动
    if (scrollRef.value.offsetWidth < wrapRef.value.offsetWidth) {
      isMove.value = false;
      return
    }

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
 

  function onWheel(ev) {
    ev.preventDefault();
    const scrollbarDomWidth = wrapRef.value ? wrapRef.value?.offsetWidth : 0;
    const tabDomWidth = scrollRef.value ? scrollRef.value.offsetWidth : 0;
    const scrollWidth = tabDomWidth - scrollbarDomWidth;
    const x = -ev.deltaY; // 计算鼠标滚动的距离
    scrollRef.value.style.transition = "none"; // 消除tabDom的动画
    if (scrollbarDomWidth < tabDomWidth) {
      if (translateX.value >= -scrollWidth) {
        translateX.value = Math.max(translateX.value + x, scrollbarDomWidth - tabDomWidth);
      }
    }
    if (translateX.value >= 0) translateX.value = 0;

    if (translateX.value >= 0 || translateX.value <= -scrollWidth) {
      // scrollRef.value.style.transition = "transform 0.5s cubic-bezier(0.26, 1, 0.68, 1)";
    }
    scrollRef.value.style.transition = "transform 0.5s cubic-bezier(0.26, 1, 0.68, 1)";
    scrollRef.value.style.transform = `translateX(${translateX.value}px)`;
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
