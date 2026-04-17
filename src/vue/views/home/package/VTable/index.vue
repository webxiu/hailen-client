<!--
 * @Author: Hailen
 * @Date: 2026-04-17 09:37:43
 * @LastEditors: Hailen
 * @LastEditTime: 2026-04-17 17:19:53
 * @Description: 
-->
<template>
  <div class="ui-w-100 ui-h-100">
    <h2>vtable</h2>
    <div ref="vTableRef" style="width: 98%; height: 400px"></div>
    <div ref="vTableRef2" class="ui-p-r mt-10" style="width: 98%; height: 400px"></div>
    <div ref="vTableRef3" class="ui-p-r mt-10" style="width: 98%; height: 400px"></div>
  </div>
</template>

<script lang="ts" setup>
import * as VTable from "@visactor/vtable";
import { Gantt, GanttConstructorOptions } from "@visactor/vtable-gantt";
import { DateInputEditor, InputEditor, ListEditor, TextAreaEditor } from "@visactor/vtable-editors";
import { createGroup, createText } from "@visactor/vtable/es/vrender";
import { h, onMounted, ref } from "vue";
import { getTableOption } from "./utils";

defineOptions({ name: "HomePackageVTableIndex", title: "VTable表格" });

const vTableRef = ref(null);
const vTableRef2 = ref(null);
const vTableRef3 = ref(null);
const listTable = ref();
const copyData = ref();

onMounted(() => {
  const inputEditor = new InputEditor();
  const textAreaEditor = new TextAreaEditor();
  const dateInputEditor = new DateInputEditor();
  const listEditor = new ListEditor({ values: ["女", "男"] });
  VTable.register.editor("name-editor", inputEditor);
  VTable.register.editor("textArea-editor", textAreaEditor);
  VTable.register.editor("date-editor", dateInputEditor);
  VTable.register.editor("list-editor", listEditor);

  const option = getTableOption();
  const option2 = getGanttData();
  const option3 = getPivotTableData();
  listTable.value = new VTable.ListTable({ container: vTableRef.value, ...option });
  const ganttTable = new Gantt(vTableRef2.value, option2);
  const pivotTable = new VTable.PivotTable(vTableRef3.value, option3);

  listTable.value.on("click_cell", (args) => {
    const { row, col, field } = args;
    const rowData = listTable.value.getRecordByCell(col, row);
    if (!rowData || field === "operation") return;
    console.log("点击事件", args);
    console.log("点击数据:", rowData[field as string], rowData);
  });
  listTable.value.on("change_cell_value", (args) => {
    console.log("编辑数据", args);
    // 编辑单元格数据
  });

  listTable.value.on("dropdown_menu_click", (args: any) => {
    console.log("菜单下拉", args);
    listTable.value.setDropDownMenuHighlight([args]);
    const rightMenu = {
      copy_cell: () => onCellCopy(listTable.value), // 复制
      paste_cell: () => onCellPaste(listTable.value, args), // 粘贴
      delete_cell: () => onCellDelete(listTable.value, args) // 删除
    }[args.menuKey];
    rightMenu && rightMenu();
  });
});

// 复制
function onCellCopy(tableInstance) {
  copyData.value = tableInstance.getCopyValue();
}
// 粘贴
function onCellPaste(tableInstance, args) {
  const rows = copyData.value.split("\n"); // 将数据拆分为行
  const values = [];
  rows.forEach(function (rowCells, rowIndex) {
    const cells = rowCells.split("\t"); // 将行数据拆分为单元格
    const rowValues = [];
    values.push(rowValues);
    cells.forEach(function (cell, cellIndex) {
      // 去掉单元格数据末尾的 '\r'
      if (cellIndex === cells.length - 1) {
        cell = cell.trim();
      }
      rowValues.push(cell);
    });
  });
  tableInstance.changeCellValues(args.col, args.row, values);
}
// 删除
function onCellDelete(tableInstance, args) {
  let selectCells = tableInstance.getSelectedCellInfos();
  if (selectCells?.length > 0 && cellIsSelectRange(args.col, args.row, selectCells)) {
    // 如果选中的是范围，则删除范围内的所有单元格
    deleteSelectRange(selectCells);
  } else {
    // 否则只删除单个单元格
    tableInstance.changeCellValue(args.col, args.row, "");
  }

  //将选中单元格的值设置为空
  function deleteSelectRange(selectCells) {
    for (let i = 0; i < selectCells.length; i++) {
      for (let j = 0; j < selectCells[i].length; j++) {
        tableInstance.changeCellValue(selectCells[i][j].col, selectCells[i][j].row, "");
      }
    }
  }
  // 判断单元格col,row是否在选中范围中
  function cellIsSelectRange(col, row, selectCells) {
    for (let i = 0; i < selectCells.length; i++) {
      for (let j = 0; j < selectCells[i].length; j++) {
        if (selectCells[i][j].col === col && selectCells[i][j].row === row) {
          return true;
        }
      }
    }
    return false;
  }
}

function getList(startDateStr, count) {
  const developers = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十", "郑十一", "王二", "麻子", "逗比", "屌丝"];
  const priorities = ["P0", "P1", "P2", "P3"];
  const statuses = ["待开始", "进行中", "已完成", "已取消"];

  const records = [];

  // 解析输入的日期字符串（格式：YYYY-MM-DD）
  function parseDate(dateStr) {
    const parts = dateStr.split("-");
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  // 格式化日期为YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const startDate = parseDate(startDateStr);

  for (let i = 0; i < count; i++) {
    // 每条记录的开始日期 = 初始日期 + i天
    const currentStartDate = new Date(startDate);
    currentStartDate.setDate(startDate.getDate() + i);

    // 结束日期 = 开始日期 + 随机1-30天
    const randomDays = Math.floor(Math.random() * 30) + 1; // 1-30天
    const currentEndDate = new Date(currentStartDate);
    currentEndDate.setDate(currentStartDate.getDate() + randomDays);

    records.push({
      id: i + 1, // ID从1开始
      title: `任务${i + 1}`,
      developer: developers[Math.floor(Math.random() * developers.length)],
      start: formatDate(currentStartDate),
      end: formatDate(currentEndDate),
      progress: Math.floor(Math.random() * 101), // 0-100的随机进度
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    });
  }

  return records;
}

// gantt-table
function getGanttData(): GanttConstructorOptions {
  const records = [
    { id: 1, title: "任务1", developer: "张三", start: "2024-07-24", end: "2024-07-26", progress: 31, priority: "P0" },
    { id: 2, title: "任务2", developer: "李四", start: "07/24/2024", end: "08/04/2024", progress: 60, priority: "P0" },
    { id: 3, title: "任务3", developer: "王二", start: "2024-08-04", end: "2024-08-04", progress: 100, priority: "P1" },
    { id: 4, title: "任务4", developer: "麻子", start: "2024-07-26", end: "2024-07-28", progress: 31, priority: "P0" },
    { id: 5, title: "任务5", developer: "逗比", start: "2024-07-26", end: "2024-07-28", progress: 60, priority: "P0" },
    { id: 6, title: "任务6", developer: "屌丝", start: "2024-07-29", end: "2024-08-11", progress: 100, priority: "P1" },
    ...getList("2024-07-24", 20)
  ];

  const columns = [
    { title: "任务名称", field: "title", width: "auto", sort: true, tree: true, editor: "input" },
    { title: "开始时间", field: "start", width: "auto", sort: true, editor: "date-input" },
    { title: "结束时间", field: "end", width: "auto", sort: true, editor: "date-input" },
    { title: "进度", field: "progress", width: "auto", sort: true }
  ];
  const option: GanttConstructorOptions = {
    overscrollBehavior: "none",
    records,
    taskListTable: {
      columns,
      tableWidth: 250,
      minTableWidth: 100,
      maxTableWidth: 600,
      theme: {
        headerStyle: { borderColor: "#e1e4e8", borderLineWidth: 1, fontSize: 18, fontWeight: "bold", color: "red", bgColor: "#EEF1F5" },
        bodyStyle: { borderColor: "#e1e4e8", borderLineWidth: [1, 0, 1, 0], fontSize: 16, color: "#4D4D4D", bgColor: "#FFF" }
      },
      frozenRowCount: 1,
      rightFrozenColCount: 0
    },
    frame: {
      outerFrameStyle: { borderLineWidth: 2, borderColor: "#e1e4e8", cornerRadius: 8 },
      verticalSplitLine: { lineColor: "#e1e4e8", lineWidth: 3 },
      horizontalSplitLine: { lineColor: "#e1e4e8", lineWidth: 3 },
      verticalSplitLineMoveable: true,
      verticalSplitLineHighlight: { lineColor: "green", lineWidth: 3 }
    },
    grid: {
      verticalLine: { lineWidth: 1, lineColor: "#09f" },
      horizontalLine: { lineWidth: 1, lineColor: "#09f" }
    },
    headerRowHeight: 40,
    rowHeight: 40,
    taskBar: {
      startDateField: "start",
      endDateField: "end",
      progressField: "progress",
      resizable: true,
      moveable: true,
      hoverBarStyle: { barOverlayColor: "rgba(241, 255, 119, 0.5)" },
      labelText: "{title}  完成 {progress}%",
      labelTextStyle: { fontFamily: "Arial", fontSize: 16, textAlign: "left", textOverflow: "ellipsis" },
      barStyle: {
        width: 20,
        /** 任务条的颜色 */
        barColor: "#4facfe",
        /** 已完成部分任务条的颜色 */
        completedBarColor: "#3bff45",
        /** 任务条的圆角 */
        cornerRadius: 8,
        /** 任务条的边框 */
        borderLineWidth: 1,
        /** 边框颜色 */
        borderColor: "black"
      }
    },
    timelineHeader: {
      colWidth: 100,
      weekendColWidth: 20,
      backgroundColor: "#EEF1F5",
      horizontalLine: { lineWidth: 1, lineColor: "#e1e4e8" },
      verticalLine: { lineWidth: 1, lineColor: "#e1e4e8" },
      scales: [
        {
          unit: "week",
          step: 1,
          startOfWeek: "sunday",
          format(date) {
            return `Week ${date.dateIndex}`;
          },
          style: {
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
            strokeColor: "black",
            textAlign: "right",
            textBaseline: "bottom",
            backgroundColor: "#EEF1F5",
            textStick: true
            // padding: [0, 30, 0, 20]
          }
        },
        {
          unit: "day",
          step: 1,
          format(date) {
            return date.dateIndex.toString();
          },
          style: {
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
            strokeColor: "black",
            textAlign: "right",
            textBaseline: "bottom",
            backgroundColor: "#EEF1F5"
          }
        }
      ]
    },
    markLine: [
      {
        date: "2024/8/02",
        scrollToMarkLine: true,
        position: "left",
        style: { lineColor: "red", lineWidth: 1 }
      }
    ],
    rowSeriesNumber: {
      title: "行号",
      dragOrder: true,
      headerStyle: { bgColor: "#EEF1F5", borderColor: "#e1e4e8" },
      style: { borderColor: "#e1e4e8" }
    },
    scrollStyle: {
      scrollRailColor: "RGBA(246,246,246,0.5)",
      visible: "scrolling",
      width: 6,
      scrollSliderCornerRadius: 2,
      scrollSliderColor: "#5cb85c"
    }
  };
  return option;
}

// pivot-table
function getPivotTableData(): VTable.PivotTableConstructorOptions {
  const data = [
    { Category: "Office Supplies", Quantity: "3", City: "Aberdeen" },
    { Category: "Office Supplies", Sales: "25.5", City: "Aberdeen" },
    { Category: "Office Supplies", Profit: "6.630000114440918", City: "Aberdeen" },
    { Category: "Technology", Quantity: null, City: "Aberdeen" },
    { Category: "Technology", Sales: null, City: "Aberdeen" },
    { Category: "Technology", Profit: null, City: "Aberdeen" },
    { Category: "Furniture", Quantity: null, City: "Aberdeen" },
    { Category: "Furniture", Sales: null, City: "Aberdeen" },
    { Category: "Furniture", Profit: null, City: "Aberdeen" },
    { Category: "Office Supplies", Quantity: "2", City: "Abilene" },
    { Category: "Office Supplies", Sales: "1.3919999599456787", City: "Abilene" },
    { Category: "Office Supplies", Profit: "-3.757999897003174", City: "Abilene" },
    { Category: "Technology", Quantity: null, City: "Abilene" },
    { Category: "Technology", Sales: null, City: "Abilene" },
    { Category: "Technology", Profit: null, City: "Abilene" },
    { Category: "Furniture", Quantity: null, City: "Abilene" },
    { Category: "Furniture", Sales: null, City: "Abilene" },
    { Category: "Furniture", Profit: null, City: "Abilene" },
    { Category: "Office Supplies", Quantity: "45", City: "Akron" },
    { Category: "Office Supplies", Sales: "1113.3880207538605", City: "Akron" },
    { Category: "Office Supplies", Profit: "22.31399953365326", City: "Akron" },
    { Category: "Technology", Quantity: "15", City: "Akron" },
    { Category: "Technology", Sales: "1183.0019836425781", City: "Akron" },
    { Category: "Technology", Profit: "-136.85100328922272", City: "Akron" },
    { Category: "Furniture", Quantity: "5", City: "Akron" },
    { Category: "Furniture", Sales: "433.59600830078125", City: "Akron" },
    { Category: "Furniture", Profit: "-72.09900188446045", City: "Akron" },
    { Category: "Office Supplies", Quantity: "41", City: "Albuquerque" },
    { Category: "Office Supplies", Sales: "943.1220030784607", City: "Albuquerque" },
    { Category: "Office Supplies", Profit: "384.5169929265976", City: "Albuquerque" },
    { Category: "Technology", Quantity: "24", City: "Albuquerque" },
    { Category: "Technology", Sales: "1277.0379962921143", City: "Albuquerque" },
    { Category: "Technology", Profit: "249.57199335098267", City: "Albuquerque" },
    { Category: "Furniture", Quantity: null, City: "Albuquerque" },
    { Category: "Furniture", Sales: null, City: "Albuquerque" },
    { Category: "Furniture", Profit: null, City: "Albuquerque" },
    { Category: "Office Supplies", Quantity: "48", City: "Alexandria" },
    { Category: "Office Supplies", Sales: "4879.789813041687", City: "Alexandria" },
    { Category: "Office Supplies", Profit: "153.12399864196777", City: "Alexandria" },
    { Category: "Technology", Quantity: "16", City: "Alexandria" },
    { Category: "Technology", Sales: "372.32000160217285", City: "Alexandria" },
    { Category: "Technology", Profit: "61.040998458862305", City: "Alexandria" },
    { Category: "Furniture", Quantity: "20", City: "Alexandria" }
  ];
  const option: VTable.PivotTableConstructorOptions = {
    records: data,
    rows: [
      {
        dimensionKey: "City",
        title: "城市",
        headerStyle: { textStick: true },
        width: "auto"
      }
    ],
    columns: [
      {
        dimensionKey: "Category",
        title: "Category",
        headerStyle: { textStick: true },
        width: "auto"
      }
    ],
    indicators: [
      {
        indicatorKey: "Quantity",
        title: "数量",
        width: "auto",
        showSort: false,
        headerStyle: { fontWeight: "normal" },
        style: {
          padding: [16, 28, 16, 28],
          color(args) {
            if (args.dataValue >= 0) return "black";
            return "red";
          }
        }
      },
      {
        indicatorKey: "Sales",
        title: "销售",
        width: "auto",
        showSort: false,
        headerStyle: { fontWeight: "normal" },
        format: (rec) => {
          return "$" + Number(rec).toFixed(2);
        },
        style: {
          padding: [16, 28, 16, 28],
          color(args) {
            if (args.dataValue >= 0) return "black";
            return "red";
          }
        }
      },
      {
        indicatorKey: "Profit",
        title: "利润",
        width: "auto",
        showSort: false,
        headerStyle: {
          fontWeight: "normal"
        },
        format: (rec) => {
          return "$" + Number(rec).toFixed(2);
        },
        style: {
          padding: [16, 28, 16, 28],
          color(args) {
            if (args.dataValue >= 0) return "black";
            return "red";
          }
        }
      }
    ],
    corner: {
      titleOnDimension: "row",
      headerStyle: { textStick: true }
    },
    dataConfig: {
      sortRules: [{ sortField: "Category", sortBy: ["办公用品", "技术", "家具"] }]
    },
    widthMode: "standard"
  };

  return option;
}
</script>

<style lang="scss" scoped></style>
