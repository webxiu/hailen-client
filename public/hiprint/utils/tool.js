/*
 * @Author: Hailen
 * @Date: 2025-10-13 14:20:08
 * @LastEditors: Hailen
 * @LastEditTime: 2025-10-17 10:14:21
 * @Description: 全局方法
 */

(function (window) {
  window.$tool = {
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
    /**
     * 对象转原始字符串
     * @param {*} obj 对象
     * @param {*} fmt 是否格式化(默认格式化)
     * @param {*} level 对象层级
     */
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
  };
})(window);
