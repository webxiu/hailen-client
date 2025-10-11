/*
 * @Author: Hailen
 * @Date: 2025-08-20 10:44:54
 * @LastEditors: Hailen
 * @LastEditTime: 2025-10-10 09:11:30
 * @Description: 水印插件
 */

/** 时间格式化 */
function formatDate(date, fmt = "YYYY-MM-DD") {
  if (typeof date === "string" && arguments.length === 1) {
    fmt = date;
    date = new Date();
  }
  const d = new Date(date || new Date());
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  const milliseconds = d.getMilliseconds();
  const padZero = (num) => String(num).padStart(2, "0");
  const map = {
    YYYY: year,
    YY: String(year).slice(-2),
    MM: padZero(month),
    M: month,
    DD: padZero(day),
    D: day,
    HH: padZero(hours),
    H: hours,
    hh: padZero(hours % 12 || 12),
    h: hours % 12 || 12,
    mm: padZero(minutes),
    m: minutes,
    ss: padZero(seconds),
    s: seconds,
    SSS: String(milliseconds).padStart(3, "0"),
    SS: String(Math.floor(milliseconds / 10)).padStart(2, "0"),
    S: milliseconds,
    A: hours >= 12 ? "PM" : "AM",
    a: hours >= 12 ? "pm" : "am",
    Q: Math.floor((month + 2) / 3),
  };
  return fmt.replace(/(YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|SSS|SS|S|A|a|Q)/g, (str) => String(map[str]));
}

/** base64ToBlob */
function base64ToBlob(data, mime) {
  data = data.split(",")[1];
  data = window.atob(data);
  const arrs = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    arrs[i] = data.charCodeAt(i);
  }
  return new Blob([arrs], { type: mime });
}

// 水印参数
const defaultOption = {
  id: "watermark",
  zIndex: 0,
  rotate: 25,
  width: 200,
  height: 200,
  watch: false,
  content: "WaterMark",
  container: ".hiprint-printPaper",
  textAlign: "center", // 水平对齐
  textBaseline: "middle", // 垂直对齐
  timestamp: false, // 是否显示时间戳
  format: "YYYY-MM-DD HH:mm",
  fontSize: "14px",
  fontFamily: "Microsoft Yahei",
  fillStyle: "rgba(184, 184, 184, 0.3)",
};

// 监听器
var observerMap = {};

/** 创建水印 */
function _createWatermark(param) {
  const { id, watch, content, container, width, height, textAlign, textBaseline, fontSize, fontFamily, fillStyle, rotate, show, timestamp, format, zIndex } = param;
  observerMap[id] = { wmMo: null, wmTimer: null };

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  ctx.font = `${fontSize} ${fontFamily}`;
  ctx.fillStyle = fillStyle;
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-(Math.PI / 180) * rotate);
  if(show){
    ctx.fillText(`${content}`, 0, 0);
    timestamp && ctx.fillText(`${formatDate(format)}`, 0, parseInt(fontSize) + 5);
  }

  const containerDom = typeof container === "string" ? document.querySelector(container) : container;
  let templateDom = containerDom.querySelector("._template" + id);
  const watermarkDiv = templateDom || document.createElement("div");
  const blob = base64ToBlob(canvas.toDataURL(), "image/png");
  const url = URL.createObjectURL(blob);
  const styleStr = `position:absolute; top:0; left:0; width:100%; height:100%; z-index:${zIndex}; user-select:none; pointer-events:none !important; background-repeat:repeat; background-image:url('${url}'); -webkit-print-color-adjust: exact;`;

  watermarkDiv.setAttribute("style", styleStr);
  watermarkDiv.classList.add("_template" + id);

  if (!templateDom) {
    containerDom.insertBefore(watermarkDiv, containerDom.firstChild);
  }

  if (watch) {
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    if (MutationObserver) {
      observerMap[id]["wmMo"] = new MutationObserver((e) => {
        let change = e.some((item) => item.target.className == containerDom.className && item.type == "attributes");
        templateDom = containerDom.querySelector("._template" + id);
        if ((templateDom && templateDom.getAttribute("style") !== styleStr) || !templateDom || change) {
          // 避免一直触发
          observerMap[id]["wmMo"].disconnect();
          observerMap[id]["wmMo"] = null;
          delete observerMap[id]["wmMo"];
          _createWatermark(param);
        }
      });
      observerMap[id]["wmMo"].observe(containerDom, {
        attributes: true,
        subtree: true,
        childList: true,
      });
    }
  }

  if (format) {
    let timeout = 1000 * 60 * 60 * 24;
    if (format.includes("s")) {
      timeout = 1000;
    } else if (format.includes("m")) {
      timeout = 1000 * 60;
    } else if (format.includes("h") || format.includes("H")) {
      timeout = 1000 * 60 * 60;
    }
    observerMap[id]["wmTimer"] = window.setTimeout(() => {
      // 触发 MutationObserver
      watermarkDiv.style.bottom = "0";
    }, timeout);
  }
}

/** 销毁水印 */
function destroyWatermark(options) {
  const { id, watch, container } = Object.assign({}, defaultOption, options);
  if (watch) {
    const containerDom = typeof container === "string" ? document.querySelector(container) : container;
    if (observerMap[id]) {
      observerMap[id]["wmMo"] && observerMap[id]["wmMo"].disconnect();
      observerMap[id]["wmMo"] = null;
      observerMap[id]["wmTimer"] && window.clearTimeout(observerMap[id]["wmTimer"]);
      observerMap[id]["wmTimer"] = null;
      delete observerMap[id];
    }
    const templateDom = containerDom.querySelector("._template" + id);
    templateDom && templateDom.parentNode.removeChild(templateDom);
  }
}

/** 创建水印 */
function createWatermark(option) {
  const options = Object.assign({}, defaultOption, option);
  destroyWatermark(options);
  _createWatermark(options);
}

// export default { createWatermark, destroyWatermark };
