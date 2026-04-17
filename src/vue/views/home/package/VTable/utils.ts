import * as VTable from "@visactor/vtable";

import { createGroup, createText } from "@visactor/vtable/es/vrender";

export function createOpterate(actions, args) {

  const { table, row, col, rect } = args;
  const { height, width } = rect ?? table.getCellRect(col, row);
  // 创建容器
  const container = createGroup({
    height,
    width,
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    boundsPadding: [10, 0, 0, 10],
  });

  // 3. 循环渲染按钮
  actions.forEach((action, index) => {
    const btn = createText({
      text: action.text,
      fontSize: 13,
      fontFamily: "sans-serif",
      fill: "#2440b3", // #315efb
      boundsPadding: [10, 0, 0, 10],
      underline: 0,
      cursor: "pointer"
    });

    // 绑定 Hover 状态逻辑
    btn.stateProxy = (stateName) => {
      if (stateName === "hover") {
        return { fill: action.hoverColor, underline: 1 };
      }
    };

    btn.addEventListener("mouseenter", (e) => {
      btn.addState("hover", true, false);
      table.scenegraph.updateNextFrame();
    });

    btn.addEventListener("mouseleave", (e) => {
      btn.removeState("hover", false);
      table.scenegraph.updateNextFrame();
    });

    // 绑定点击事件，获取当前行数据
    btn.addEventListener("click", (e) => {
      // 兼容一下获取数据的方式，优先用 getRecordByCell
      const rowData = table.getRecordByCell ? table.getRecordByCell(col, row) : table.getRecord(col, row);
      action.onClick(rowData);
    });

    container.add(btn);
  });

  return {
    rootContainer: container,
    renderDefault: false
  };
}


export function getTableOption(): VTable.ListTableConstructorOptions {
  const records = new Array(50).fill(0).map((m, i) => {
    return {
      order: "CA-2018-156720" + (i + 1),
      status: i % 2 === 0 ? 0 : 1,
      customer: "JM-15580-" + (i + 1),
      product: "Bagged Rubber Bands",
      category: "Office Supplies",
      subCategory: "Fasteners",
      region: "West",
      city: "Loveland",
      date: "2018-12-30",
      quantity: "3",
      sales: "3.024",
      profit: "-0.605",
      progress: Math.floor(Math.random() * 101)
    };
  });

  const columns: VTable.ColumnDefine[] = [
    { field: "order", title: "订单 ID", width: "auto", headerStyle: { textAlign: "center" } },
    {
      field: "status",
      title: "状态",
      width: "auto",
      editor: (args) => "list-editor",
      dropDownMenu: [
        { text: "在列内部配置", type: "title" },
        { text: "苹果", type: "item", menuKey: "apple" },
        { text: "橘子", type: "item", menuKey: "orange" },
        { text: "分割线", type: "split" },
        { text: "大米", type: "item", menuKey: "item1" },
        { text: "小米", type: "item", menuKey: "item2" }
      ],
      style: {
        textAlign: "left",
        bgColor: "rgba(0, 0, 0, 0.05)",
        // padding: [16, 28, 16, 28],
        color(args) {
          return { 0: "red", 1: "green" }[args.dataValue];
        }
      },
      fieldFormat(record, value) {
        return { 0: "未完成", 1: "已完成" }[record.status];
      }
      // cellType(args) {   return "text"; }
    },
    {
      field: "customer",
      title: "客户 ID",
      width: "auto",
      editor: (args) => "name-editor",
      style: { textAlign: "right" }
    },
    { field: "product", title: "产品名称", width: "100" },
    { field: "category", title: "分类", width: "auto" },
    { field: "subCategory", title: "子分类", width: "auto" },
    { field: "region", title: "区域", width: "auto" },
    { field: "city", title: "城市", width: "auto" },
    { field: "date", title: "日期", width: "auto" },
    { field: "quantity", title: "数量", width: "auto" },
    {
      field: "progress",
      title: "进度",
      width: 100,
      cellType: "progressbar",
      style: {
        padding: [0, 15],
        barColor: "#0f0",
        barBgColor: "#ddd",
        barHeight: 20,
        barBottom: 5,
        textAlign: "right"
      },
      fieldFormat: (data: any) => {
        return data.progress + "%";
      }
    },
    { field: "sales", title: "卖价", width: "auto" },
    { field: "profit", title: "利润", width: "auto" },
    {
      field: "operation",
      title: "操作",
      style: {
        fontFamily: "Arial",
        fontSize: 12,
        fontWeight: "bold"
      },
      width: 110,
      customLayout: (args) => {
        const actions = [
          {
            text: "编辑",
            color: "#2440b3",
            hoverColor: "#315efb",
            onClick: (rowData) => {
              console.log("编辑", rowData);
              // 这里可以放你的编辑逻辑，比如打开弹窗
            }
          },
          {
            text: "删除",
            color: "#2440b3",
            hoverColor: "#315efb",
            onClick: (rowData) => {
              console.log("删除", rowData);
              // 这里可以放你的删除逻辑
            }
          }
        ];
        return createOpterate(actions, args);
      }
    }
  ];

  const option: VTable.ListTableConstructorOptions = {
    records,
    columns,
    widthMode: "standard",
    frozenRowCount: 2, // 冻结行
    frozenColCount: 1, // 冻结列(左)
    rightFrozenColCount: 2, // 冻结列(右)
    rowHeightConfig: new Array(records.length + 1).fill(0).map((_, i) => ({ key: i, height: 30 })),
    bottomFrozenRowCount: 2,
    rowResizeMode: "all", // 调整行高
    columnResizeMode: "all", // 调整列宽
    enableLineBreak: true, // 解析换行符
    editCellTrigger: "doubleclick", // 编辑方式: 'click' | 'doubleclick'
    // autoWrapText: true, // 自动折行
    // heightMode: "autoHeight", // 内容自动高度(autoWrapText使用)
    keyboardOptions: {
      selectAllOnCtrlA: true,
      copySelected: true,
      cutSelected: true
    },
    tooltip: {
      isShowOverflowTextTooltip: true
    },
    rowSeriesNumber: {
      title: "行号",
      dragOrder: true,
      headerStyle: { bgColor: "#EEF1F5", borderColor: "#e1e4e8" },
      style: { borderColor: "#e1e4e8" }
    },
    hover: {
      highlightMode: "cross" // 'cross' | 'column' | 'row' | 'cell';
    },
    menu: {
      // contextMenuItems: [
      //   { text: "复制表头", menuKey: "复制表头$1" },
      //   { text: "复制单元格", menuKey: "复制单元格$1" }
      // ],
      contextMenuItems: (field: string, row: number) => {
        console.log(field, row);
        return [
          { text: "复制", menuKey: "copy_cell" },
          { text: "粘贴", menuKey: "paste_cell" },
          { text: "删除", menuKey: "delete_cell" }
        ];
      },
      defaultHeaderMenuItems: [
        {
          text: "ascend",
          icon: {
            svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71 24L88 41.0286V53.0005L74.996 39.9755L74.9968 88.0005H66.9968L66.996 39.9835L54 53.0005V41.0286L71 24ZM48 80V88H8V80H48ZM48 44V52H8V44H48ZM88 8V16H8V8H88Z" fill="#2e2f32" fill-opacity="0.9"></path></svg>'
          },
          selectedIcon: {
            svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71 24L88 41.0286V53.0005L74.996 39.9755L74.9968 88.0005H66.9968L66.996 39.9835L54 53.0005V41.0286L71 24ZM48 80V88H8V80H48ZM48 44V52H8V44H48ZM88 8V16H8V8H88Z" fill="rgb(55,145,255)" fill-opacity="0.9"></path></svg>'
          },
          children: [
            {
              text: "ascend",
              icon: {
                svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71 24L88 41.0286V53.0005L74.996 39.9755L74.9968 88.0005H66.9968L66.996 39.9835L54 53.0005V41.0286L71 24ZM48 80V88H8V80H48ZM48 44V52H8V44H48ZM88 8V16H8V8H88Z" fill="#2e2f32" fill-opacity="0.9"></path></svg>'
              },
              selectedIcon: {
                svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71 24L88 41.0286V53.0005L74.996 39.9755L74.9968 88.0005H66.9968L66.996 39.9835L54 53.0005V41.0286L71 24ZM48 80V88H8V80H48ZM48 44V52H8V44H48ZM88 8V16H8V8H88Z" fill="rgb(55,145,255)" fill-opacity="0.9"></path></svg>'
              },
              menuKey: "ascend1"
            },
            {
              text: "descend",
              icon: {
                svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71 89.0005L54 71.9719L54 60L67.004 73.025L67.0032 25L75.0032 25L75.004 73.017L88 60V71.9719L71 89.0005ZM48 81V89H8V81H48ZM48 45V53H8V45H48ZM88 9V17H8V9H88Z" fill="#2e2f32" fill-opacity="0.9"></path></svg>'
              },
              selectedIcon: {
                svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71 89.0005L54 71.9719L54 60L67.004 73.025L67.0032 25L75.0032 25L75.004 73.017L88 60V71.9719L71 89.0005ZM48 81V89H8V81H48ZM48 45V53H8V45H48ZM88 9V17H8V9H88Z" fill="rgb(55,145,255)" fill-opacity="0.9"></path></svg>'
              },
              menuKey: "降序排序1"
            }
          ]
        },
        {
          text: "descend",
          icon: {
            svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71 89.0005L54 71.9719L54 60L67.004 73.025L67.0032 25L75.0032 25L75.004 73.017L88 60V71.9719L71 89.0005ZM48 81V89H8V81H48ZM48 45V53H8V45H48ZM88 9V17H8V9H88Z" fill="#2e2f32" fill-opacity="0.9"></path></svg>'
          },
          selectedIcon: {
            svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71 89.0005L54 71.9719L54 60L67.004 73.025L67.0032 25L75.0032 25L75.004 73.017L88 60V71.9719L71 89.0005ZM48 81V89H8V81H48ZM48 45V53H8V45H48ZM88 9V17H8V9H88Z" fill="rgb(55,145,255)" fill-opacity="0.9"></path></svg>'
          }
        },
        {
          text: "frozen",
          icon: {
            svg: '<svg width="14" height="14" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 8H22V88H8V8ZM34 88V8H88V88H34ZM80 16H42V80H80V16Z" fill="#2e2f32" fill-opacity="0.9"></path></svg>'
          }
        }
      ]
    }
  };
  return option;
}