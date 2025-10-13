/*
 * @Author: Hailen
 * @Date: 2025-10-13 14:20:08
 * @LastEditors: Hailen
 * @LastEditTime: 2025-10-13 14:30:06
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
    /** 对象转原始字符串 */
    objToString: function (obj, level = 0) {
      const indent = "  ".repeat(level);
      const subIndent = "  ".repeat(level + 1);
      if (typeof obj !== "object" || obj === null) return JSON.stringify(obj);
      if (Array.isArray(obj)) {
        if (obj.length === 0) return "[]";
        const items = obj.map((item) => `${subIndent}${objToString(item, level + 1)}`).join(",\n");
        return `[\n${items}\n${indent}]`;
      }
      if (Object.keys(obj).length === 0) return "{}";
      const lines = [];
      for (const key in obj) {
        const value = obj[key];
        const valueStr = objToString(value, level + 1);
        lines.push(`${subIndent}${key}: ${valueStr}`);
      }
      return `{\n${lines.join(",\n")}\n${indent}}`;
    },
    /** 是否iframe加载打开 */
    isIframe: function () {
      return window.self !== window.top;
    },
  };
})(window);
