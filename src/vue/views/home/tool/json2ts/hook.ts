/*
 * @Author: Hailen
 * @Date: 2024-07-26 15:30:04
 * @Last Modified by: Hailen
 * @Last Modified time: 2025-01-11 14:30:42
 */

/**
 * Json数据转换TS类型
 * @param {String} url 接口地址(只取最后两层路径名)
 * @param {Object} request 请求数据
 * @param {Object} reaponse 响应数据
 */
function Json2Ts({ url, title, request, reaponse }) {
  const pathArr = url.split("/").slice(-2); // 拆分路径
  const urlNames = pathArr.map((m) => toUpperCase(m));
  const typeName = urlNames.join("");
  const firstName = urlNames[0];
  const lastName = urlNames[1];

  /** 首字母大写 */
  function toUpperCase(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  /** 处理null->any */
  function toNullType(value) {
    if (value) return typeof value;
    if (value === null) return "any";
  }

  /** 是否简单类型 */
  function isSimpleType(value) {
    if (typeof value !== "object") return true;
    return false;
  }
  /** 获取空格数量 */
  function getSpace(n) {
    return " ".repeat(n);
  }

  /**
   * TS类型解析
   * @param {object} data 数据
   * @param {String} name 类型名称
   * @param {Number} blankNum 空格个数(2的倍数)
   * @returns ts类型定义
   */
  function handleArray(key, data, name, blankNum = 0) {
    if (!data) return "";
    const space = getSpace(blankNum);
    let tsSubItemType = "";
    let tsItemType = `
/** ${title}${toUpperCase(key)}列表类型 */
export interface ${name} {\n`;
    if (!name) tsItemType = `{\n`;
    for (let key in data) {
      const value = data[key];
      if (Array.isArray(value)) {
        const uppKey = toUpperCase(key);
        let arrItemName = `${firstName + uppKey}ItemType`;
        // 判断简单还是复杂数组类型
        if (isSimpleType(value[0])) {
          const sType = value[0] ? typeof value[0] : "any";
          tsItemType += `  ${key}: ${sType}[];\n`;
        } else {
          const { before, after } = handleArray(key, value[0], arrItemName);
          tsSubItemType += before + after;
          tsItemType += `${space}  ${key}: ${arrItemName}[];\n`;
        }
      } else if (value && typeof value === "object") {
        const { before, after } = handleArray(key, value, "", blankNum + 2);
        tsSubItemType += before;
        tsItemType += `  ${space}${key}: ${after}`;
      } else if (value !== undefined) {
        const resetType = toNullType(value);
        tsItemType += `${space}  ${key}: ${resetType};\n`;
      }
    }
    tsItemType += `${space}};\n`;
    return { before: tsSubItemType, after: tsItemType };
  }

  /**
   * 数据类型解析
   * @param {Object} data 解析数据
   * @param {String} typeName 类型名称
   * @param {String} type Response | Request
   */
  function convertToTS(data, title, typeName, type) {
    if (!data) return "";
    const paramTitle = type === "Request" ? "请求参数" : "响应参数";
    let tsItemInterface = ``;
    let tsInterface = `
/** ${title}:【${paramTitle}】 */
export interface ${typeName}${type} {\n`;
    for (let key in data) {
      if (Array.isArray(data[key])) {
        const uppKey = toUpperCase(key);
        const arrItemName = `${firstName + uppKey}ItemType`;
        const { before, after } = handleArray(key, data[key][0], arrItemName);
        tsItemInterface += before + after;
        tsInterface += `  ${key}: ${arrItemName}[];\n`;
      } else if (data[key] && typeof data[key] === "object") {
        const { before, after } = handleArray(key, data[key], "", 2);
        tsItemInterface += before;
        tsInterface += `  ${key}: ${after}`;
      } else {
        tsInterface += `  ${key}: ${typeof data[key]};\n`;
      }
    }
    tsInterface += "};\n";
    return tsItemInterface + tsInterface;
  }

  // 结果:
  const reqType = convertToTS(request, title, typeName, "Request"); // 请求类型
  const resType = convertToTS(reaponse, title, typeName, "Response"); // 响应类型
  const templateName = `
/** ==================== ********** ${title} ********** ==================== */`;
  return { convertToTS, result: templateName + reqType + resType };
}

export { Json2Ts };
