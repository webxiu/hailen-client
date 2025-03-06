/*
 * @Author: Hailen
 * @Date: 2023-07-24 08:41:09
 * @Last Modified by: Hailen
 * @Last Modified time: 2025-03-06 15:43:14
 */

import dayjs from "dayjs";
import { utils, writeFile } from "xlsx";
import ExcelJS from "exceljs";
import Sortable, { MoveEvent } from "sortablejs";
import { message, showMessageBox } from "@/vue/utils/message";
import type { DatePickerProps, TableColumnCtx, TableRefs, InputProps, colProps } from "element-plus";
import { CSSProperties, Ref, nextTick, reactive, ref, withModifiers, type VNode } from "vue";

export interface SortableCallbackType {
  type: "row" | "column";
  newIndex: number;
  oldIndex: number;
  sortable: Sortable;
  fromName?: string;
  toName?: string;
}

/** 表格配置列自定函数类型 */
export type RendererType = (data: any) => VNode | JSXElement;

const moveRowName = reactive({ fromName: "", toName: "" });

/** 行拖拽(需要等列配置加载完成在初始化) */
export const rowDrop = (dataList: Ref<any>, prefixSelector: string, callback?: (v: SortableCallbackType) => void) => {
  nextTick(() => {
    const wrapper: HTMLElement = document.querySelector(prefixSelector + " .el-table__body-wrapper tbody");
    const sortable = Sortable.create(wrapper, {
      animation: 300,
      handle: prefixSelector + " .el-table__row",
      filter: (event, target, sortable) => {
        const isLevel1 = target.className.includes("el-table__row--level-0");
        return isLevel1;
      },
      onMove: (evt: MoveEvent) => {
        moveRowName.toName = evt.related.innerText;
      },
      onEnd: ({ newIndex, oldIndex, item }) => {
        moveRowName.fromName = item.innerText;
        if (!dataList) {
          console.error("请传入dataList值");
        } else {
          const currentRow = dataList.value.splice(oldIndex, 1)[0];
          dataList.value.splice(newIndex, 0, currentRow);
        }
        if (typeof callback === "function") callback({ type: "row", newIndex, oldIndex, sortable, ...moveRowName });
      }
    });
  });
};
const moveName = reactive({ fromName: "", toName: "" });
/** 列拖拽 */
export const columnDrop = (columnsDrag: Ref<any>, prefixSelector: string, callback?: (v: SortableCallbackType) => void) => {
  nextTick(() => {
    const wrapper: HTMLElement = document.querySelector(prefixSelector + " .el-table__header-wrapper tr");
    const sortable = Sortable.create(wrapper, {
      animation: 300,
      delay: 0,
      onMove: (evt: MoveEvent) => {
        moveName.toName = evt.related.innerText;
      },
      onEnd: ({ newIndex, oldIndex, item }) => {
        moveName.fromName = item.innerText;
        const oldItem = columnsDrag.value[oldIndex];
        columnsDrag.value.splice(oldIndex, 1);
        columnsDrag.value.splice(newIndex, 0, oldItem);
        if (typeof callback === "function") callback({ type: "column", newIndex, oldIndex, sortable, ...moveName });
      }
    });
  });
};

/** 列筛选函数 */
export const filterHandler = (value, row, column) => {
  const property = column["property"];
  return row[property] === value;
};

/** 表格统计方法参数类型 */
export interface SummaryMethodProps<T> {
  columns: TableColumnCtx<T>[];
  data: T[];
}

/** 表格统计自定义配置选项 */
interface SummaryOptionType<T> {
  /** 表格参数数据 */
  params: SummaryMethodProps<T>;
  /** 文本显示, 默认 `N/A` */
  emptyText?: string;
  /** 需要统计的字段数组 */
  includeProps?: string[];
  /** 排除统计的字段数组 */
  excludeProps?: string[];
  /** 转金额千分位的字段数组 */
  moneyCommaProps?: string[];
  /** 保留有效数字, 默认 `2位` */
  decimal?: number;
}

/** 表格配置类型说明 */
export interface ColumnOptionType {
  /** 接口返回的表格列配置 */
  columnData: TableColumnList[];
  /** 表格渲染数据 */
  dataList?: Ref<any[]>;
  /** 表格拖拽选择器(存在多个表格区分唯一表格), 需配合`isDragColumn`或`isDragRow`使用 不传 `默认不拖拽` */
  dragSelector?: string;
  /** 是否序号索引分页累加 不传 `默认不累加` */
  formData?: { page: number; limit: number };
  /** 是否显示单选按钮 不传 `默认显示` */
  radioColumn?: TableColumnList | false;
  /** 是否显示序号 不传 `默认显示` */
  indexColumn?: TableColumnList | false;
  /** 是否显示操作列 默认宽 `140` 不传 `默认显示` */
  operationColumn?: TableColumnList | false;
  /** 是否显示多选 不传 `默认不显示` */
  selectionColumn?: TableColumnList | false;
  /** 是否显示自定义折叠图标 不传`默认不显示` */
  isCustomExpend?: boolean;
  /** 是否拖拽列(设置此项`dragSelector`必传) */
  isDragColumn?: boolean;
  /** 是否拖拽行(设置此项`dataList`与`dragSelector`必传) */
  isDragRow?: boolean;
}

export interface DownloadDataType {
  /** 导出的数据 */
  dataList: any[];
  /** 表格配置列 */
  columns: TableColumnList[];
  /** sheet名称 */
  sheetName: string;
}
export interface OptionsType {
  optionValue: any;
  optionName: string;
  disabled?: boolean;
}

/** 导出有效列 */
const isValidCol = (column: TableColumnList) => {
  const isRadio = column.prop !== "radio";
  const isOperation = column.slot !== "operation";
  const isSelect = !["expand", "selection"].includes(column.type);
  return isRadio && isOperation && isSelect;
};

/**
 * 纯表格数据导出
 * @param options 导出选项: 支持导出多表, 传入数组即可
 * @param fileName 导出excel文件名称
 */
export const downloadDataToExcel = (options: DownloadDataType | DownloadDataType[], fileName = "") => {
  const _options = Array.isArray(options) ? options : [options];
  const _fileName = fileName || _options[0].sheetName;
  const workBook = utils.book_new();

  _options.forEach((option, idx) => {
    const cellList: string[][] = [];
    function getData(dataList: any[]) {
      dataList.map((item, index) => {
        const arr = [];
        option.columns.forEach((column) => {
          const prop = typeof column.prop === "function" ? column["property"] : column.prop;
          if (column.type === "index" && column.prop !== "radio") {
            arr.push(cellList.length + 1); // index + 1
          } else if (isValidCol(column)) {
            arr.push(item[prop]);
          }
        });
        cellList.push(arr);
        if (item.children?.length) {
          getData(item.children);
        }
      });
    }
    getData(option.dataList);

    // 首行表头
    const titles: string[] = option.columns.reduce((prev, column) => {
      if (isValidCol(column)) prev.push(column.label);
      return prev;
    }, []);

    cellList.unshift(titles);
    const workSheet = utils.aoa_to_sheet(cellList);
    utils.book_append_sheet(workBook, workSheet, option.sheetName || `Sheet${idx + 1}`);
  });
  writeFile(workBook, `${_fileName}_${Date.now()}.xlsx`);
};

export interface ExcelJSConfigType {
  /** 导出文件名 */
  fileName: string;
  /** 图片字段 */
  imgProp?: string;
  /** 图片宽高 */
  imgSize?: [number, number?];
}

/**
 * 导出图片表格
 * @param options 导出选项: 支持导出多表, 传入数组即可
 * @param fileName 导出excel文件名称
 */
export const exportImgToExcel = (options: DownloadDataType | DownloadDataType[], config: ExcelJSConfigType) => {
  const _options = Array.isArray(options) ? options : [options];
  const { fileName, imgProp = "", imgSize = [40, 40] } = config;
  const _fileName = fileName || _options[0].sheetName;

  const workBook = new ExcelJS.Workbook();
  _options.forEach((option) => {
    const worksheet = workBook.addWorksheet(option.sheetName);
    const headTitles: string[] = option.columns.reduce((prev, column) => {
      if (isValidCol(column)) prev.push(column.label);
      return prev;
    }, []);
    worksheet.addRow(headTitles);

    // 插入数据
    function getData(dataList: any[]) {
      dataList.map(async (row, rowIndex) => {
        const cellArr: any[] = [];
        option.columns.forEach((column) => {
          const prop = typeof column.prop === "function" ? column["property"] : column.prop;
          if (column.type === "index" && column.prop !== "radio") {
            cellArr.push(rowIndex + 1);
          } else if (isValidCol(column)) {
            const rowVal = prop === imgProp ? "" : row[prop];
            cellArr.push(rowVal);
          }
        });
        if (row.children?.length) getData(row.children);
        worksheet.addRow(cellArr);

        // 插入图片到表格中
        if (row[imgProp]) {
          const imageId = workBook.addImage({
            base64: row[imgProp].split(",").pop(),
            extension: "jpeg"
          });
          const rowNum = rowIndex + 2;
          const colNum = option.columns.findIndex((column) => column.prop === imgProp); // 动态获取图片列索引
          const width = imgSize[0];
          const height = imgSize[1] || width;
          const offset = 0.1; // 水平垂直偏移量
          worksheet.addImage(imageId, {
            tl: { col: colNum - 1 + offset, row: rowNum - 1 + offset },
            ext: { width: width, height: height }
          });
          worksheet.getRow(rowNum).height = height;
          worksheet.getColumn(colNum).width = width / 7;
        }
      });
    }
    getData(option.dataList);
  });
  // 导出到Excel
  workBook.xlsx
    .writeBuffer()
    .then((buffer) => {
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      onDownload(blob, `${_fileName}.xlsx`);
    })
    .catch(() => message.error("导出失败"));
};

// 数字转千分位格式(decimal: 默认保留2位有效数字)
export const formatMoneyComma = (num: number | string, decimal = 2, thousand = true): string => {
  const value = Number(`${num}`.replace(/,/g, ""));
  if (Number.isNaN(value)) return num?.toString() ?? "";
  const floatNum = value.toFixed(decimal);
  if (thousand) {
    return Number(floatNum).toLocaleString("zh-CN", { currency: "CNY", minimumFractionDigits: decimal });
  } else {
    return floatNum.toString();
  }
};

/**
 * 自定义统计函数
 * @param options.params          表格参数数据
 * @param options.emptyText       文本显示, 默认 `--`
 * @param options.includeProps    需要统计的字段
 * @param options.excludeProps    排除统计的字段
 * @param options.moneyCommaProps 转金额千分位的字段
 * @param options.decimal         保留有效数字, 默认 `2位`
 */
export const getSummaries = <T extends {}>(options: SummaryOptionType<T>) => {
  const { params, emptyText = "--", includeProps = [], excludeProps = [], moneyCommaProps = [], decimal = 2 } = options;
  const { columns, data } = params;
  const sums: string[] = [];
  columns.forEach((column, index) => {
    if (index === 0) return (sums[index] = "合计");

    const isInclude = includeProps.includes(column.property) || !excludeProps.includes(column.property);
    // 列所有数据
    const values = data.map((item) => Number(item[column.property]));
    // 是否为无效列数据
    const validValues = values.every((value) => Number.isNaN(value));

    if (!validValues && isInclude) {
      const totalSum = values
        .map((item) => `${item}`)
        .reduce((prev, curr) => {
          const value = Number(curr);
          return !Number.isNaN(value) ? prev + value : prev;
        }, 0);

      let sumValue = `${Number(totalSum.toFixed(decimal))}`;
      // 金额千分位转换
      if (moneyCommaProps.includes(column.property)) {
        sumValue = formatMoneyComma(totalSum, decimal);
      }
      sums[index] = sumValue;
    } else {
      sums[index] = emptyText;
    }
  });

  return sums;
};

/**
 * 表格排序
 * @param dataList 表格数据
 * @param row 表格行
 * @param field 序号字段
 * @param direction 排序方向, 默认: 空
 * @param callback 交换索引回调函数
 */
export const moveTableRow = <T extends object>(
  dataList: Ref<T[]>,
  row: T | object,
  field: string,
  direction?: "up" | "down" | "",
  callback?: (data: { newIndex: number; oldIndex: number; newArr: T[] }) => void
) => {
  function moveFn() {
    let seq = Number(row[field]);
    if (direction) {
      const val = direction === "up" ? -1 : 1;
      seq += val;
    }
    const len = dataList.value.length;
    const newArr = dataList.value.filter((f) => f[field] !== row[field]);
    const oldIndex = dataList.value.findIndex((f) => f[field] === row[field]);
    const newIndex = seq >= len ? len - 1 : seq <= 0 ? 0 : seq - 1;
    newArr.splice(newIndex, 0, row as T);
    newArr.forEach((item, index) => (item[field] = index + 1));
    if (typeof callback === "function") callback({ oldIndex, newIndex, newArr });
  }
  window.requestAnimationFrame(moveFn);
};

/** 拖拽元素排序配置选项类型 */
export interface MoveSortOptionType<T> {
  dataList: Ref<T[]>;
  selector: string;
  handle?: string;
  callback?: (data: { newIndex: number; oldIndex: number; sortable: Sortable; newData: T[] }) => void;
}

/** 拖拽元素排序 */
export function moveEleSort<T extends {}>(options: MoveSortOptionType<T>) {
  const { dataList, selector, handle, callback = () => {} } = options;
  const wrapper: HTMLElement = document.querySelector(selector);
  const sortable = Sortable.create(wrapper, {
    animation: 300,
    handle: handle,
    onMove: (evt: MoveEvent) => {},
    onEnd: ({ newIndex, oldIndex }) => {
      if (!dataList.value.length) return;
      const oItem = dataList.value.splice(oldIndex, 1)[0];
      dataList.value.splice(newIndex, 0, oItem);
      callback({ newIndex, oldIndex, sortable, newData: dataList.value });
    }
  });
}

export interface FormatDataType {
  /** 日期类型 */
  date: string;
  /** 小数位 */
  decimal?: number;
  /** 类型 */
  type: string;
  /** 千分位 */
  thousand?: boolean;
  /** 金额符号 */
  symbol?: string;
  /** 内边距(水平) */
  paddingV?: string;
  /** 内边距(垂直) */
  paddingH?: string;
  /** 圆角 */
  borderRadius?: string;
  /** 样式 */
  style?: string;
  /** 标签配置 */
  specs?: {
    uuid: number;
    value: string;
    label: string;
    color: string;
    background?: string;
  }[];
}

/** 动态表格: 格式化类型key */
export enum FormatKey {
  /** 默认 */
  default = "default",
  /** 数字 */
  number = "number",
  /** 日期 */
  date = "date",
  /** 标签 */
  tag = "tag",
  /** 枚举字典 */
  enum = "enum"
}

/**
 * 获取格式化结果
 * @param item 配置列
 * @param value 单元格数据
 */
export const getFormatType = (item: TableColumnList, value) => {
  const fmtObj: FormatDataType = JSON.parse(item.formatType);
  const { type, decimal = 0, date, thousand = false, symbol = "", paddingV = 0, paddingH = 0, borderRadius = 0, style = "", specs = [] } = fmtObj;
  if (type === FormatKey.number) {
    // 数字
    return symbol + formatMoneyComma(value, decimal, thousand);
  } else if (type === FormatKey.date && dayjs(value).isValid()) {
    // 日期
    return dayjs(value).format(date);
  } else if ([FormatKey.tag, FormatKey.enum].includes(type as FormatKey) && !value?.__v_isVNode) {
    // 标签
    const result = specs?.find((item) => item.value === `${value}`);
    const { label, color = "inherit", background = "inherit" } = result || ({} as any);
    // 内边距,外边距, 圆角及剩余样式修改
    const cssStyle = `padding: ${paddingV}px ${paddingH}px;
     border-radius: ${borderRadius}px;
     color: ${color};
     background: ${background};
    ${style}`;
    return <span style={cssStyle}>{label || value}</span>;
  }
  return value;
};

/**
 * 获取对象深度值
 * @param obj 获取对象
 * @param key 对象深度('xx.cc.val')
 */
export function getValue(obj: object, key: string) {
  return key.split(".").reduce((prev, cur) => (prev || {})[cur], obj);
}

/**
 * 设置对象深度值
 * @param obj 设置对象
 * @param key 对象深度
 * @param value 设置值
 */
export function setValue(obj: object, key: string, value: any) {
  key.split(".").reduce((obj, key, i, arr) => {
    if (i < arr.length - 1) {
      if (!obj[key]) obj[key] = {};
      obj = obj[key];
    } else {
      obj[key] = value;
    }
    return obj;
  }, obj);
  return obj;
}

/**
 * 数组根据某个属性分类
 * @param arr 数组
 * @param prop 属性字段
 */
export function getArrayAlassify<T extends Record<string, any>>(arr: T[], prop: string) {
  const obj: Record<string, T[]> = arr.reduce((prev: any, item: T) => {
    const key = item[prop];
    prev[key] = prev[key] || [];
    prev[key].push(item);
    return prev;
  }, {});
  const keys = Object.keys(obj).map(Number);
  keys.sort((a, b) => a - b);
  const sortedValues = keys.map((key) => obj[key] || []);
  return sortedValues;
}

interface OptionKey {
  /** 请假类型 */
  AskForLeaveType: "AskForLeaveType";
  /** 加班类型 */
  OvertimeType: "OvertimeType";
  /** 性别类型 */
  GenderType: "GenderType";
}

export type OptionKeys = ValueOf<OptionKey>;

export type DictResultType<T extends OptionKeys[]> = { [K in T[number]]: [] };

/** 全局获取枚举字段下拉框列表 */
export const getEnumDictList = <T extends OptionKeys[]>(keys: T): Promise<DictResultType<T>> => {
  return new Promise<DictResultType<T>>((resolve, reject) => {
    resolve({} as DictResultType<T>);
  });
};
