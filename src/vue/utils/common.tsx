import { Sheet2JSONOpts, read, readFile, utils } from "xlsx";

import { dayjs } from "element-plus";
import { http } from "@/vue/utils/http";
import { message } from "@/vue/utils/message";

/** JSON字符串转换对象 */
export function toParse(str) {
  try {
    const parsed = JSON.parse(str || "{}");
    return parsed;
  } catch (e) {
    return {};
  }
}

export type PrimitiveType = "number" | "string" | "boolean" | "object" | "array" | "undefined" | "null" | "function" | "date";

/** 获取数据类型 */
export function getType(data): PrimitiveType {
  return Object.prototype.toString.call(data).slice(8, -1).toLowerCase();
}

/** 路由地址转驼峰 */
export function toCamelCase(url: string) {
  return url
    .split("/")
    .filter(Boolean)
    .map((dir) => dir.charAt(0).toUpperCase() + dir.slice(1))
    .join("");
}

/** 时间格日期 */
export function formatDate(date: string | number, fmt = "YYYY-MM-DD HH:mm:ss") {
  return date ? dayjs(date).format(fmt) : "";
}

/** 将为null数据改为undefined */
export const nullToUdefined = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null) obj[key] = undefined;
  });
  return obj;
};

/** 递归删除对象内的空值 */
export const delEmptyQueryNodes = (obj = {}) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    value && typeof value === "object" && delEmptyQueryNodes(value);
    (value === "" || value === null || value === undefined || value.length === 0 || Object.keys(value).length === 0) && delete obj[key];
  });
  return obj;
};

/** 重置数据(按原来类型重置) */
export const resetData = <T, K extends keyof T>(formData: T, prop: K): T => {
  const dataType = getType(formData[prop]);
  if (dataType === "array") formData[prop] = [] as T[K];
  if (dataType === "object") formData[prop] = {} as T[K];
  if (dataType === "string") formData[prop] = undefined as T[K];
  if (dataType === "number") formData[prop] = undefined as T[K];
  if (dataType === "boolean") formData[prop] = false as T[K];
  if (dataType === "function") formData[prop] = (() => {}) as T[K];
  return formData;
};

/**
 * 函数防抖
 * @param fn 处理函数
 * @param wait 等待时间
 */
export const debounce = (fn: Function, wait = 300) => {
  let timeout: NodeJS.Timeout;
  return (...arg) => {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(fn.bind(null, ...arg), wait);
  };
};

/**
 * 函数节流
 * @param fn 处理函数
 * @param delay 间隔时间
 */
export const throttle = (fn: Function, delay = 300) => {
  let prev = Date.now();
  return (...args: any) => {
    const now = Date.now();
    if (now - prev >= delay) {
      fn.call(null, ...args);
      prev = Date.now();
    }
  };
};
/**
 * 深度克隆
 */
export const cloneDeep = (value) => {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    const arrCopy = [];
    for (let i = 0; i < value.length; i++) {
      arrCopy[i] = cloneDeep(value[i]);
    }
    return arrCopy;
  }

  const objCopy = {};
  for (const key in value) {
    if (value.hasOwnProperty(key)) {
      objCopy[key] = cloneDeep(value[key]);
    }
  }
  return objCopy;
};

/**
 * 请求接口导出(下载)
 * @param url 下载地址
 * @param fileName 文件名(可带后缀)
 * @param NoNeedTimeNow 是否添加时间戳(可选)
 */
export const downloadFile = (url: string, fileName: string, NoNeedTimeNow = false) => {
  // 给文件名添加时间戳, 判断文件名是否存在后缀名
  // fileName待后缀名就使用fileName后缀, 否则获取url文件后缀
  const urlSuffix = url.split(".")[1] ?? "txt";
  const names = fileName.split(".");
  const name = names[0] ?? fileName;
  const suffix = names[1] || urlSuffix;

  http
    .get<object, Blob>(url, { responseType: "blob" })
    .then((res: any) => {
      const blob = new Blob([res]);
      const fileName = `${name}${!NoNeedTimeNow ? "" : "_" + Date.now()}.${suffix}`;
      onDownload(blob, fileName);
    })
    .catch(console.error);
};

// 下载文件
export const onDownload = (blob: Blob, fileName: string) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

/** base64转blob */
export const base64ToBlob = (data: string, mime: string) => {
  data = data.split(",")[1];
  data = window.atob(data);
  const arrs = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    arrs[i] = data.charCodeAt(i);
  }
  return new Blob([arrs], { type: mime });
};

/** 文件转base64 */
export function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * 将图片 URL 转换为 Base64
 * @param url 图片地址
 * @returns Base64 字符串
 */
export const imgUrlToBase64 = async (url: string) => {
  return new Promise<string>((resolve, reject) => {
    http
      .get<object, Blob>(url, { responseType: "blob" })
      .then((blob: any) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      })
      .catch((err) => reject(err));
  });
};

// 数字保留两位小数并且加千分位
export const fixed2AndAddcomma = (num: number | string): string => {
  if (!num && num !== 0) return "";

  let formatNum = "";
  if (typeof num === "string" && /\d/.test(num)) {
    formatNum = (+num).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
  }
  formatNum = (num as number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");

  return formatNum;
};

/** 获取浏览器参数 */
export const getUrlParameters = (url: string = location.href): any => {
  const params: any = url.match(/([^?=&]+)(=([^&]*))/g) || [];
  const res = params.reduce((a, v) => ((a[v.slice(0, v.indexOf("="))] = decodeURIComponent(v.slice(v.indexOf("=") + 1))), a), {});
  return res;
};

/**
 * 查找树形列表某项
 * @param arr 树形列表
 * @param field 查找的字段
 * @param id 查找的值
 */
export const getTreeArrItem = <T extends Record<string, any>>(arr: T[], field: string, id: any) => {
  let result: T;
  const fn = (arr: T[], id: any) => {
    for (const item of arr) {
      if (item[field] === id) {
        result = item;
        break;
      }
      if (item.children?.length) fn(item.children, id);
    }
  };
  fn(arr, id);
  return result;
};

/**
 * 获取树形列表下的所有字段集合
 * @param treeData 树形列表
 * @param field 查找的字段
 * @param children 子列表属性
 */
export const getChildIDs = <T extends Record<string, any>, R>(arr: T[], field: string, children = "children"): R[] => {
  if (!arr?.length) return [];
  const ids: R[] = [];
  const fn = (arr: T[]) => {
    arr.forEach((item) => {
      if (item[field]) ids.push(item[field]);
      if (item[children]?.length) fn(item[children]);
    });
  };
  fn(arr);
  return ids;
};

// 根据某个id查找树节点顶级节点
export function findTopLevelNode<T extends Record<string, any>>(tree: T[], field: string, targetId: string | number): T {
  for (const node of tree) {
    if (node[field] === targetId) return node;
    if (node.children?.length > 0) {
      const result = findTopLevelNode(node.children, field, targetId);
      if (result) return node;
    }
  }
  return {} as T;
}

/** 复制文本 */
export function copyText(text: string, msg?: string) {
  navigator.clipboard.writeText(text).then(
    () => message.success(msg || "复制成功"),
    (error: Error) => message.error("复制失败!" + error.message)
  );
}

// 读取剪切板
export function readClipboard() {
  return new Promise<string>((resolve, reject) => {
    navigator.clipboard.readText().then(resolve, reject);
  });
}

/** 替换树形列表字段 */
export function treeArrayTraverse(tree, fieldMap) {
  function traverseField(nodes) {
    nodes.forEach((node) => {
      for (const oldField in fieldMap) {
        if (node[oldField]) {
          node[fieldMap[oldField]] = node[oldField];
          delete node[oldField];
        }
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        traverseField(node.children);
      }
    });
  }
  traverseField(tree);
  return tree;
}

/** 深度对比 */
export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
}

/**
 * 查询满足条件函数的数据
 * @param tree 树列表
 * @param func 条件函数
 * @param findArr 找到的数据
 * @param recursion 是否递归查找
 */
export function findTreeNodes<T extends Record<string, any>>(tree: T[], func: (f: T) => boolean, findArr = [], recursion = true): T[] {
  if (!tree?.length) return [];
  for (const item of tree) {
    if (func(item as T)) {
      findArr.push(item);
    } else if (recursion) {
      if (item.children?.length) findTreeNodes(item.children, func, findArr);
    }
  }
  return findArr;
}

/**
 * 查找数据列表
 * @param arr 查找数组
 * @param keyword 查找关键字
 * @param fields 查找字段数组
 */
export const findDataList = <T extends Record<string, any>>(arr: T[], keyword: string | number, fields: string[]) => {
  const fn = (t: T) => {
    if (!keyword) return true;
    return fields.some((s) => t[s]?.includes(keyword));
  };
  return findTreeNodes(arr, fn, [], true);
};

/**
 * 读取excel文件数据
 * @param file xlsx文件
 * @param sheetConfig 配置读取起始行(配置格式: {sheet1: { header: 1, range: 5 }} sheet1的第6行作为表头，从第7行开始读取数据)
 * @returns { Promise<Record<string, any[]>> }
 */
export const readXlsx = (file: File, sheetConfig = {}) => {
  return new Promise<Record<string, any[]>>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = read(data, { type: "array" });
      const allSheetsData: Record<string, any[]> = workbook.SheetNames.reduce((current, sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const opts: Sheet2JSONOpts = sheetConfig[sheetName] || { header: 0, range: null };
        const jsonData = utils.sheet_to_json(worksheet, opts);
        const headers = jsonData[0] as string[]; // 表头行
        // 复杂表格数据格式不统一, 数据返回格式有差异
        if (Array.isArray(headers)) {
          const dataRows = jsonData.slice(1); // 数据行
          const formattedData = dataRows.map((row) => {
            return headers.reduce((acc, header, index) => {
              acc[header] = row[index];
              return acc;
            }, {});
          });
          current[sheetName] = formattedData;
        } else {
          current[sheetName] = jsonData;
        }
        return current;
      }, {});
      resolve(allSheetsData);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 在vscode中打开
 */
export const openInVScode = (vscodeMain, { path }) => {
  path = !path.includes("index") ? `${path}/index` : path;
  const openURL = vscodeMain + __ROOT__ + `/src/views${path}.vue`;
  const newWindow = window.open(openURL, "在vscode中打开", "width=480,height=200,resizable=yes");
  const timer = setTimeout(() => {
    newWindow.close();
    clearTimeout(timer);
  }, 5000);
};
