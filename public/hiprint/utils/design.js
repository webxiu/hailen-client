/*
 * @Author: Hailen
 * @Date: 2025-08-19 11:41:58
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-27 15:34:08
 * @Description: 设计JS主文件
 */

/** 纸张尺寸 */
var paperSizes = [
  { name: "A1", action: "A1", title: "594 x 841" },
  { name: "A2", action: "A2", title: "420 x 594" },
  { name: "A3", action: "A3", title: "297 x 420", isOpen: true },
  { name: "A4", action: "A4", title: "210 x 297", isOpen: true },
  { name: "A5", action: "A5", title: "148 x 210", isOpen: true },
  { name: "A6", action: "A6", title: "105 x 148", isOpen: true },
  { name: "A7", action: "A7", title: "74 x 105" },
  { name: "A8", action: "A8", title: "52 x 74" },
  { name: "B1", action: "B1", title: "707 x 1000", divided: true },
  { name: "B2", action: "B2", title: "500 x 707" },
  { name: "B3", action: "B3", title: "353 x 500", isOpen: true },
  { name: "B4", action: "B4", title: "250 x 353", isOpen: true },
  { name: "B5", action: "B5", title: "176 x 250", isOpen: true },
  { name: "B6", action: "B6", title: "125 x 176" },
  { name: "B7", action: "B7", title: "88 x 125" },
  { name: "B8", action: "B8", title: "62 x 88" },
];

var itemList = paperSizes.filter((item) => item.isOpen);
var moreList = paperSizes.filter((item) => !item.isOpen);
var papers = paperSizes.map((item) => item.action); // 纸张列表

var toolButtons = [
  ...itemList,
  { name: "more", action: "more", children: moreList },
  { name: "widthInput", action: "widthInput" },
  { name: "heightInput", action: "heightInput" },
  { name: "自定义", action: "customSize" },
  { name: "scaleInput", action: "scaleInput", title: "重置缩放" },
  { name: "旋转", action: "onRotate" },
  { name: "网格", action: "onGridLine" },
  { name: "清空", action: "onClear", type: "danger" },
  { name: "重置", action: "onReset", type: "danger" },
  { name: "PDF", action: "onExportPdf", type: "primary" },
  { name: "打印", action: "onPrint", type: "primary" },
  { name: "预览", action: "onPreview", type: "warning" },
  { name: "模板", action: "onTemplate", type: "info" },
  // { name: "获取元素", action: "getPanels" },
];

var elements = [
  {
    title: "🌵文本",
    children: [
      { title: "文本", tid: "configModule.text", icon: "glyphicon-text-width" },
      { title: "长文本", tid: "configModule.longText", icon: "glyphicon-subscript" },
      { title: "自定义文本", tid: "configModule.customText", icon: "glyphicon-text-size" },
    ],
  },
  {
    title: "☘️图片",
    children: [
      { title: "图片", tid: "configModule.image", icon: "glyphicon-picture" },
      { title: "二维码", tid: "configModule.qrcode", icon: "glyphicon-qrcode" },
      { title: "条形码", tid: "configModule.barcode", icon: "glyphicon-barcode" },
    ],
  },
  {
    title: "🌴表格",
    children: [
      { title: "表格", tid: "configModule.table", icon: "glyphicon-th" },
      { title: "表格(分组)", tid: "configModule.groupTable", icon: "glyphicon-th-list" },
      { title: "表格(多表头)", tid: "configModule.tableMulHead", icon: "glyphicon-equalizer" },
      { title: "表格(自定义)", tid: "configModule.tableCustom", icon: "glyphicon-menu-hamburger" },
    ],
  },
  {
    title: "🍄辅助",
    children: [
      { title: "横线", tid: "configModule.hline", icon: "glyphicon-resize-horizontal" },
      { title: "竖线", tid: "configModule.vline", icon: "glyphicon-resize-vertical" },
      { title: "矩形", tid: "configModule.rect", icon: "glyphicon-unchecked" },
      { title: "椭圆", tid: "configModule.oval", icon: "glyphicon-record" },
    ],
  },
  {
    title: "🌳HTML",
    children: [{ title: "html字符串", tid: "configModule.html", icon: "glyphicon-tree-conifer" }],
  },
];

function genTemplate(selector) {
  const tpl = document.getElementById(selector);
  tpl.parentElement.removeChild(tpl);
  return tpl.innerHTML;
}

/** 获取地址参数 */
function getQuery(url) {
  const params = url.match(/([^?=&]+)(=([^&]*))/g) || [];
  const res = params.reduce(function (a, v) {
    const val = decodeURIComponent(v.slice(v.indexOf("=") + 1));
    a[v.slice(0, v.indexOf("="))] = val;
    return a;
  }, {});
  return res;
}

/**
 * 递归移除空值字段
 * @param data 要处理的数据
 * @param excludeKeys 需要排除的字段名
 */
function removeEmpty(data, excludeKeys = []) {
  function isEmpty(value) {
    if (value === null || value === undefined || value === "") return true;
    return false;
  }
  if (Array.isArray(data)) {
    return data.map((item) => removeEmpty(item, excludeKeys)).filter((item) => !isEmpty(item));
  } else if (typeof data === "object" && data !== null) {
    const result = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (excludeKeys.includes(key)) continue;
        const value = removeEmpty(data[key], excludeKeys);
        if (!isEmpty(value)) result[key] = value;
      }
    }
    return result;
  }
  return data;
}

/** 复制文本 */
function copyText(text, callback) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(
      () => callback(),
      (error) => callback(error)
    );
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = 0;
  textarea.style.top = "-100%";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const success = document.execCommand("copy");
    if (success) {
      callback();
    } else {
      callback(new Error("复制失败，请手动复制"));
    }
  } catch (err) {
    callback(err);
  } finally {
    document.body.removeChild(textarea);
  }
}

const drawDef = { min: 0.3, max: 5, step: 0.1, scale: 1 };
let isDragging = false;
let isSpacePressed = false;
let offsetX = 0, // 累计偏移量
  offsetY = 0,
  lastX = 0,
  lastY = 0;

// 添加绑定事件,使用滚轮调整缩放比例
window.addEventListener(
  "wheel",
  (ev) => {
    if (!ev.altKey) return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const { step } = drawDef;
    if (ev.deltaY > 0) drawDef.scale -= step;
    if (ev.deltaY < 0) drawDef.scale += step;
    setScale(drawDef.scale);
  },
  { passive: false, capture: true }
);

function setScale(step) {
  const { min, max } = drawDef;
  scaleValue.value = step;
  drawDef.scale = Math.min(Math.max(step, min), max);
  const percent = (drawDef.scale * 100).toFixed(0) + "%";
  onUpdateScale({ x: offsetX, y: offsetY, percent, scale: drawDef.scale });
}

// 设置缩放
function onUpdateScale({ x = 0, y = 0, percent, scale, transition }) {
  formData.scale = percent;
  hiprintTemplate.zoom(scale, false, { x, y, transition });
}

/** 拖拽:键盘事件 */
function onKeyDown(ev) {
  const isContentEditable = ev.target.isContentEditable;
  const isInput = ["INPUT", "TEXTAREA"].includes(ev.target.tagName);
  if (isInput || isContentEditable) return; // 避免输入框无法按空格键

  if (ev.code === "Space") {
    isSpacePressed = true;
    ev.preventDefault();
    document.addEventListener("keyup", onKeyUp);
  }
}

function onKeyUp(e) {
  if (e.code !== "Space") return;
  isSpacePressed = false;
  if (isDragging) {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("mouseup", onMouseUp, true);
  }
  document.removeEventListener("keyup", onKeyUp);
}

/** 拖拽:鼠标事件 */
function onMouseDown(ev) {
  if (!isSpacePressed) return;
  ev.preventDefault();
  ev.stopPropagation();
  isDragging = true;
  lastX = ev.clientX;
  lastY = ev.clientY;
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(ev) {
  if (!isDragging || !isSpacePressed) return;
  ev.preventDefault();
  ev.stopPropagation();
  ev.target.style.cursor = "move";
  const dx = ev.clientX - lastX;
  const dy = ev.clientY - lastY;
  lastX = ev.clientX;
  lastY = ev.clientY;
  offsetX += dx; // 累计偏移量
  offsetY += dy;
  onUpdateScale({ x: offsetX, y: offsetY, scale: drawDef.scale, transition: "none" });
}

function onMouseUp(ev) {
  ev.target.style.cursor = "default";
  if (isDragging) {
    isDragging = false;
    ev.preventDefault();
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

document.addEventListener("keydown", onKeyDown);
document.addEventListener("mousedown", onMouseDown, true);

/** 在拖拽面板中控制画布移动 */
let isPanelDragging = false;
const moveMultiplier = 5; // 移动倍数
document.addEventListener("mousedown", onDragPanelMouseDown);

function onDragPanelMouseDown(ev) {
  if (!ev.target.classList.contains("drag-panel")) return;
  isPanelDragging = true;
  lastX = ev.clientX;
  lastY = ev.clientY;
  ev.preventDefault();

  function onPanelMouseMove(ev) {
    if (!isPanelDragging) return;
    document.body.style.cursor = "move";
    const deltaX = (ev.clientX - lastX) * moveMultiplier;
    const deltaY = (ev.clientY - lastY) * moveMultiplier;
    offsetX += deltaX;
    offsetY += deltaY;
    lastX = ev.clientX;
    lastY = ev.clientY;
    onUpdateScale({ x: offsetX, y: offsetY, percent: formData.scale, scale: drawDef.scale, transition: "none" });
  }
  function onPanelMouseUp(ev) {
    isPanelDragging = false;
    document.body.style.cursor = "default";
    document.removeEventListener("mousemove", onPanelMouseMove);
    document.removeEventListener("mouseup", onPanelMouseUp);
  }
  document.addEventListener("mousemove", onPanelMouseMove);
  document.addEventListener("mouseup", onPanelMouseUp);
}

/** 等待所有图片加载 */
function loadedAllImage(selector, callback = () => {}) {
  const imgWrapper = document.querySelector(selector);
  const images = Array.from(imgWrapper.querySelectorAll("img:not(.h_img):not(.v_img)"));
  if (images.length === 0) {
    return callback(), Promise.resolve();
  }
  const promises = images.map((img) => {
    return new Promise((resolve) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
      } else {
        const onLoadOrError = () => {
          img.removeEventListener("load", onLoadOrError);
          img.removeEventListener("error", onLoadOrError);
          resolve();
        };
        img.addEventListener("load", onLoadOrError);
        img.addEventListener("error", onLoadOrError);
      }
    });
  });
  return Promise.all(promises).then(() => callback());
}

var Design = {
  /** 调整纸张 */
  setPaperSize: function (sizeOrWidth, height) {
    if (!sizeOrWidth) return;
    active.value = height ? "customSize" : sizeOrWidth;
    hiprintTemplate.setPaper(sizeOrWidth, height);
  },
  // 旋转
  onRotate: function () {
    hiprintTemplate.rotatePaper();
  },
  // 清空
  onClear: function () {
    hiprintTemplate.clear();
    hiprintTemplate.removeTempContainer();
  },
  // 网格线
  onGridLine: function (isGrid) {
    hiprintTemplate.setGrid(isGrid); // 设置内部网格
    $(".hiprint-printPaper.design").each(function () {
      if (isGrid) $(this).addClass("grid");
      else $(this).removeClass("grid");
    });
  },
  onPreview: function () {
    printVisible.value = true;
    requestAnimationFrame(() => {
      $(".prevViewDiv").html(hiprintTemplate.getHtml(printConfig.testData)); // printData;
    });
  },
  // 打印
  onPrint: function () {
    loadedAllImage("#designer", () => {
      hiprintTemplate.print(printConfig.testData, { isDownload: true, type: "blob" }); // printData
    });
  },
  // 重置缩放
  onResetScale: function () {
    offsetX = 0;
    offsetY = 0;
    drawDef.scale = 1;
    scaleValue.value = 1;
    onUpdateScale({ x: 0, y: 0, percent: "100%", scale: 1 });
  },
  /** 是否iframe加载打开 */
  isIframe: function () {
    return window.self !== window.top;
  },
};
