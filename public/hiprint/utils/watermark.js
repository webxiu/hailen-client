/**
 * Hiprint 水印：用 Canvas 画一块瓦片，再用 PNG data URL 做平铺背景。
 * 打印走 iframe 时 blob URL 会失效，因此不用 blob。
 */
(function (win) {
  "use strict";

  var defaults = {
    id: "watermark",
    zIndex: 0,
    width: 200,
    height: 200,
    watch: false,
    content: "",
    container: ".hiprint-printPaper",
    textAlign: "center",
    textBaseline: "middle",
    dateTime: false,
    format: "YYYY-MM-DD HH:mm",
    fontSize: "14px",
    fontFamily: "Microsoft Yahei",
    fillStyle: "rgba(184, 184, 184, 0.3)",
    rotate: 25,
    show: true,
  };

  /** 每个水印 id 对应：DOM 监听、防抖定时器、时间刷新定时器 */
  var runtimeById = {};

  function mergeOpts(input) {
    return Object.assign({}, defaults, input || {});
  }

  function resolveContainer(container) {
    if (!container) return null;
    if (typeof container === "string") return document.querySelector(container);
    if (container.nodeType === 1) return container;
    return null;
  }

  function padTwo(n) {
    return String(n).padStart(2, "0");
  }

  /** 按格式串替换常见占位符（与侧板时间格式一致即可） */
  function formatDateTime(date, pattern) {
    var d = new Date(date || Date.now());
    var tokenMap = {
      YYYY: d.getFullYear(),
      YY: String(d.getFullYear()).slice(-2),
      MM: padTwo(d.getMonth() + 1),
      M: d.getMonth() + 1,
      DD: padTwo(d.getDate()),
      D: d.getDate(),
      HH: padTwo(d.getHours()),
      H: d.getHours(),
      mm: padTwo(d.getMinutes()),
      m: d.getMinutes(),
      ss: padTwo(d.getSeconds()),
      s: d.getSeconds(),
    };
    var re = /YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g;
    return String(pattern || "YYYY-MM-DD").replace(re, function (key) {
      return String(tokenMap[key]);
    });
  }

  /** 水印 DOM 的 class */
  function layerClassName(watermarkId) {
    return "_watermark_" + watermarkId;
  }

  function escapeClassForQuery(className) {
    if (win.CSS && typeof win.CSS.escape === "function") {
      return win.CSS.escape(className);
    }
    return className.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
  }

  function findLayerNode(containerEl, watermarkId) {
    var selector = "." + escapeClassForQuery(layerClassName(watermarkId));
    return containerEl.querySelector(selector);
  }

  function disposeRuntime(watermarkId) {
    var rec = runtimeById[watermarkId];
    if (!rec) return;
    if (rec.observer) rec.observer.disconnect();
    if (rec.debounceTimer) clearTimeout(rec.debounceTimer);
    if (rec.refreshTimer) clearTimeout(rec.refreshTimer);
    delete runtimeById[watermarkId];
  }

  /** 根据格式串里是否含 s/m/H 等，粗定刷新间隔（用于动态时间） */
  function refreshIntervalMs(formatStr) {
    if (!formatStr || typeof formatStr !== "string") return 86400000;
    if (formatStr.indexOf("s") !== -1) return 1000;
    if (formatStr.indexOf("m") !== -1) return 60000;
    if (formatStr.indexOf("h") !== -1 || formatStr.indexOf("H") !== -1) return 3600000;
    return 86400000;
  }

  function buildTileDataUrl(opts) {
    var tileW = Math.max(1, (Number(opts.width) || 200) | 0);
    var tileH = Math.max(1, (Number(opts.height) || 200) | 0);
    var canvas = document.createElement("canvas");
    canvas.width = tileW;
    canvas.height = tileH;
    var ctx = canvas.getContext("2d");
    if (!ctx) return canvas.toDataURL("image/png");

    ctx.textAlign = opts.textAlign;
    ctx.textBaseline = opts.textBaseline;
    ctx.font = opts.fontSize + " " + opts.fontFamily;
    ctx.fillStyle = opts.fillStyle;
    ctx.translate(tileW / 2, tileH / 2);
    ctx.rotate((-Math.PI / 180) * (Number(opts.rotate) || 0));

    if (opts.show) {
      ctx.fillText(String(opts.content || ""), 0, 0);
      if (opts.dateTime && opts.format) {
        var line2 = formatDateTime(new Date(), opts.format);
        var fontPx = parseFloat(opts.fontSize) || 14;
        ctx.fillText(line2, 0, fontPx + 5);
      }
    }

    return canvas.toDataURL("image/png");
  }

  function buildLayerStyle(dataUrl, zIndex) {
    var parts = [
      "position:absolute",
      "top:0",
      "left:0",
      "width:100%",
      "height:100%",
      "z-index:" + zIndex,
      "user-select:none",
      "pointer-events:none !important",
      "background-repeat:repeat",
      'background-image:url("' + dataUrl + '")',
      "-webkit-print-color-adjust:exact",
      "print-color-adjust:exact",
    ];
    return parts.join(";");
  }

  function mountOrUpdateLayer(containerEl, opts) {
    var dataUrl = buildTileDataUrl(opts);
    var styleStr = buildLayerStyle(dataUrl, opts.zIndex);
    var layerEl = findLayerNode(containerEl, opts.id);
    if (!layerEl) {
      layerEl = document.createElement("div");
      layerEl.className = layerClassName(opts.id);
      containerEl.insertBefore(layerEl, containerEl.firstChild);
    }
    layerEl.setAttribute("style", styleStr);
  }

  function destroyWatermark(rawOpts) {
    var opts = mergeOpts(rawOpts);
    var containerEl = resolveContainer(opts.container);
    disposeRuntime(opts.id);
    var layerEl = containerEl && findLayerNode(containerEl, opts.id);
    if (layerEl && layerEl.parentNode) {
      layerEl.parentNode.removeChild(layerEl);
    }
  }

  function createWatermark(rawOpts) {
    var opts = mergeOpts(rawOpts);
    var containerEl = resolveContainer(opts.container);
    if (!containerEl) return;

    destroyWatermark(opts);
    if (!opts.content) return;

    mountOrUpdateLayer(containerEl, opts);

    if (opts.watch && win.MutationObserver) {
      var rec = (runtimeById[opts.id] = runtimeById[opts.id] || {});
      rec.observer = new win.MutationObserver(function () {
        clearTimeout(rec.debounceTimer);
        rec.debounceTimer = setTimeout(function () {
          mountOrUpdateLayer(containerEl, opts);
        }, 60);
      });
      rec.observer.observe(containerEl, { attributes: true, subtree: true, childList: true });
    }

    if (opts.dateTime && opts.format) {
      var rec = (runtimeById[opts.id] = runtimeById[opts.id] || {});
      var stepMs = refreshIntervalMs(opts.format);
      function scheduleNext() {
        clearTimeout(rec.refreshTimer);
        if (!findLayerNode(containerEl, opts.id)) return;
        mountOrUpdateLayer(containerEl, opts);
        rec.refreshTimer = setTimeout(scheduleNext, stepMs);
      }
      rec.refreshTimer = setTimeout(scheduleNext, stepMs);
    }
  }

  win.createWatermark = createWatermark;
  win.destroyWatermark = destroyWatermark;
})(typeof window !== "undefined" ? window : this);
