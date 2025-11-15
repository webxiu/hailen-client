/*
 * @Author: Hailen
 * @Date: 2025-10-13 14:20:08
 * @LastEditors: Hailen
 * @LastEditTime: 2025-11-15 18:00:09
 * @Description: 全局方法
 */

(function (window) {
  /** canvas画布 */
  class drawCanvas {
    // 默认配置
    defaultOption = {
      operationMode: false,
      width: 200,
      height: 200,
      lineWidth: 3,
      lineStyle: "#000000",
      fillStyle: "#ffffff",
      lineCap: "round",
      eraseWidth: 10,
    };

    canvas = null;
    ctx = null;
    signaturePaths = [];
    lastX = 0;
    lastY = 0;
    isDrawing = false;
    historyList = [];
    recoverList = [];
    options = { ...this.defaultOption };
    ratio = 1;
    eraseMode = false;
    wrapDom;

    constructor(canvas, options = {}) {
      this.wrapDom = options.n[0];
      this.canvas = canvas;
      if (!this.canvas) return;
      this.updateOption(options);
      const { width, height } = this.options;
      this.ratio = window.devicePixelRatio;
      this.ctx = this.canvas.getContext("2d");
      this.setCanvasSize({ width, height });
      this.ctx.fillStyle = this.options.fillStyle;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.bindEvent(this.canvas);
    }

    debounce(fn, wait = 300) {
      let timeout;
      return (...arg) => {
        if (timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(fn.bind(null, ...arg), wait);
      };
    }

    /**
     * 绘制自动换行的文本
     * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
     * @param {string} text - 要绘制的文本
     * @param {number} x - 起始 X 坐标
     * @param {number} y - 起始 Y 坐标
     * @param {number} maxWidth - 最大行宽
     * @param {number} lineHeight - 行高
     */
    drawWrappedText = (ctx, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(""); // 中文按字符拆分（英文可改用 .split(' ')）
      let line = "";
      let testLine = "";
      let lineCount = 0;

      for (let i = 0; i < words.length; i++) {
        testLine = line + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.fillText(line, x, y + lineCount * lineHeight);
          line = words[i]; // 下一行的起始位置
          lineCount++;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y + lineCount * lineHeight); // 绘制最后一行
    };

    bindEvent = (dom) => {
      this.addEvent(dom, {
        onMouseDown: this.onTouchstart,
        onMouseMove: this.onTouchmove,
        onMouseUp: this.onTouchend,
      });
    };

    // 窗口尺寸变化
    resize = this.debounce(() => {
      const { width, height } = this.wrapDom.getBoundingClientRect();
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height); // 保存当前画布内容
      this.setCanvasSize({ width, height });
      this.ctx.putImageData(imageData, 0, 0); // 恢复画布内容
      this.ctx.fillStyle = this.options.fillStyle;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.onRestore();
    });

    setText = (option) => {
      const { text, textLeft = 0, textTop = 0, textSize = 14 } = option;
      this.ctx.font = `${textSize}px Arial`;
      this.ctx.textAlign = "left";
      this.ctx.textBaseline = "top";
      this.ctx.fillStyle = this.options.lineStyle;
      this.onClear();
      this.drawWrappedText(this.ctx, text.toString(), textLeft, textTop, this.canvas.width, 24);
    };

    // 设置canvas宽高
    setCanvasSize = ({ width, height }) => {
      if (width === this.canvas.width && height === this.canvas.height) return;
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(this.canvas, 0, 0);

      const newWidth = width * this.ratio;
      const newHeight = height * this.ratio;

      this.options.width = newWidth;
      this.options.height = newHeight;
      this.canvas.width = width * this.ratio;
      this.canvas.height = height * this.ratio;
      this.canvas.style.width = width + "px";
      this.canvas.style.height = height + "px";
      this.ctx?.drawImage(tempCanvas, 0, 0);
    };

    addEvent = (dom, option) => {
      const onDown = (ev) => {
        if (ev.ctrlKey || ev.metaKey || this.options.operationMode) {
          ev.preventDefault();
          ev.stopPropagation();
          dom.addEventListener("mousemove", onMove);
          dom.addEventListener("mouseup", onUp);
          option.onMouseDown(ev);
        }
      };
      const onMove = (ev) => {
        if (ev.ctrlKey || ev.metaKey || this.options.operationMode) {
          ev.preventDefault();
          ev.stopPropagation();
          option.onMouseMove(ev);
        }
      };
      function onUp(ev) {
        option.onMouseUp(ev);
        dom.removeEventListener("mousemove", onMove);
        dom.removeEventListener("mouseup", onUp);
      }
      dom.addEventListener("mousedown", onDown);
    };

    onTouchstart = (ev) => {
      this.isDrawing = true;
      const rect = this.canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      this.drawLine(x, y, false);
      this.recoverList = [];
      this.historyList.push({
        lineWidth: this.options.lineWidth,
        lineStyle: this.options.lineStyle,
        move: [x, y],
        line: [],
        isErase: this.eraseMode,
      });
    };

    onTouchmove = (ev) => {
      if (this.isDrawing) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = ev.clientX - rect.left;
        const my = ev.clientY - rect.top;
        this.drawLine(mx, my, true);
        this.historyList[this.historyList.length - 1].line.push({
          x: mx,
          y: my,
        });
      }
    };

    onTouchend = (ev) => {
      this.isDrawing = false;
    };

    drawLine = (x, y, isMove) => {
      if (isMove) {
        this.ctx.beginPath();
        this.ctx.lineWidth = this.options.lineWidth * this.ratio;
        this.ctx.strokeStyle = this.options.lineStyle;
        this.ctx.lineCap = this.options.lineCap;
        this.ctx.lineJoin = "round";
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.closePath();
      }
      this.lastX = x;
      this.lastY = y;
    };

    updateOption = (options) => {
      const fillStyle = this.options.fillStyle;
      this.options = { ...this.options, ...options };
      this.defaultOption = { ...this.defaultOption, ...options };
      if (this.eraseMode) this.options.lineWidth = this.options.eraseWidth;
      this.setCanvasSize(this.options);
      if (fillStyle !== options.fillStyle) this.onRestore(); // 更新背景色
    };

    /* 重绘所有历史记录 revoke | recover | clear */
    onRestore = (type, item) => {
      if (!this.ctx) return;
      const { width, height } = this.canvas;
      const { fillStyle } = this.options;

      if (type === "revoke") {
        const history = this.historyList.pop();
        if (history) {
          // 如果是擦除操作，存储的是“透明区域”，撤销时需要重新绘制被擦除的内容
          if (history.isErase) {
            // 方案1：重新绘制整个画布（简单但性能较差）
            this.recoverList.push({ ...history, isRestoreErase: true });
          } else {
            this.recoverList.push(history);
          }
        }
      } else if (type === "recover") {
        const recover = this.recoverList.pop();
        if (recover) {
          if (recover.isRestoreErase) {
            // 重新应用擦除操作
            this.historyList.push({ ...recover, isErase: true });
          } else {
            this.historyList.push(recover);
          }
        }
      } else if (type === "clear") {
        return this.onClear();
      } else if (type === "erase") {
        return this.onEraser();
      } else if (type === "download") {
        return this.onDownload();
      }

      // 重绘画布
      this.ctx.clearRect(0, 0, width * this.ratio, height * this.ratio);
      this.ctx.fillStyle = fillStyle; // 更新背景颜色
      this.ctx.fillRect(0, 0, width * this.ratio, height * this.ratio);
      // 记录当前线宽和擦除类型
      const tempLineWidth = this.options.lineWidth;
      const tempEraseType = this.ctx.globalCompositeOperation;

      this.historyList.forEach((m) => {
        this.ctx.beginPath();
        if (m.isErase) {
          this.ctx.globalCompositeOperation = "destination-out";
          // 任意颜色，因为 destination-out 会忽略它
          this.ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        } else {
          this.ctx.globalCompositeOperation = "source-over";
          this.ctx.strokeStyle = m.lineStyle;
        }
        this.ctx.lineWidth = m.lineWidth * this.ratio;
        this.ctx.moveTo(m.move[0] * this.ratio, m.move[1] * this.ratio);
        m.line.forEach((v) => this.ctx.lineTo(v.x * this.ratio, v.y * this.ratio));
        this.ctx.stroke();
        // 恢复当前线宽和擦除类型
        this.options.lineWidth = tempLineWidth;
        this.ctx.globalCompositeOperation = tempEraseType;
      });
    };

    onClear = () => {
      const { width, height } = this.canvas;
      this.ctx.beginPath();
      this.ctx.clearRect(0, 0, width * this.ratio, height * this.ratio);
      this.ctx.closePath();
      this.historyList = [];
      this.recoverList = [];
      this.options = { ...defaultOption };
    };

    // 切换擦除模式, 并可以设置擦除大小
    onEraser = (size) => {
      const { eraseWidth, lineWidth } = this.defaultOption;
      this.eraseMode = !this.eraseMode;
      this.ctx.globalCompositeOperation = this.eraseMode ? "destination-out" : "source-over";
      this.options.lineWidth = this.eraseMode ? size || eraseWidth : lineWidth;
      return this.eraseMode;
    };

    onExport = (mime = "image/png") => {
      const imgData = this.canvas.toDataURL(mime);
      return { imgData, mime, fillStyle: this.options.fillStyle, historyList: [...this.historyList] };
    };

    onDownload = () => {
      const { imgData, mime } = this.onExport();
      const a = document.createElement("a");
      a.href = imgData;
      a.download = "画图.png";
      a.click();
    };

    getHistory = () => {
      return this.historyList;
    };
  }

  window.$tool = {
    /** 防抖 */
    debounce(fn, wait = 300) {
      let timeout;
      return (...arg) => {
        if (timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(fn.bind(null, ...arg), wait);
      };
    },
    /** 复制文本 */
    copyText: function (text, callback) {
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
    },
    /** 对象转原始字符串(对象, 是否格式化, 对象层级) */
    objToString: function (obj, fmt = true, level = 0) {
      const indent = fmt ? "  ".repeat(level) : "";
      const subIndent = fmt ? "  ".repeat(level + 1) : "";
      const breakLine = fmt ? "\n" : "";
      if (typeof obj !== "object" || obj === null) return JSON.stringify(obj);
      if (Array.isArray(obj)) {
        if (obj.length === 0) return "[]";
        const items = obj.map((item) => `${subIndent}${$tool.objToString(item, fmt, level + 1)}`).join(`,${breakLine}`);
        return `[${breakLine + items + breakLine + indent}]`;
      }
      if (Object.keys(obj).length === 0) return "{}";
      const lines = [];
      for (const key in obj) {
        const value = obj[key];
        const valueStr = $tool.objToString(value, fmt, level + 1);
        lines.push(`${subIndent}${key}: ${valueStr}`);
      }
      return `{${breakLine + lines.join(`,${breakLine}`)}${breakLine + indent}}`;
    },
    /** 是否iframe加载打开 */
    isIframe: function () {
      return window.self !== window.top;
    },
    drawCanvas: drawCanvas,
  };
})(window);
