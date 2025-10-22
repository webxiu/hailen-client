/*
 * @Author: Hailen
 * @Date: 2025-08-18 18:17:30
 * @LastEditors: Hailen
 * @LastEditTime: 2025-10-22 11:03:30
 * @Description: 拖拽元素配置
 */

var customElementTypeProvider = (function () {
  return function (options) {
    // 文本样式默认配置
    var textOptions = {
      // width: 140,
      // height: 26,
      // lineHeight: 26,
      // fontSize: 10,
      // fontWeight: "700",
      // textAlign: "center",
      // hideTitle: false,
    };
    var addElementTypes = function (context) {
      context.addPrintElementTypes("configModule", [
        /**
         * field字段配置可用于加载测试数据: printData
         * field字段未配置, 也无需配置data字段
         */
        new hiprint.PrintElementTypeGroup("文本", [
          { tid: "configModule.text", title: "文本", text: "文本", type: "text", options: textOptions },
          { tid: "configModule.longText", title: "长文本", text: "长文本", type: "longText", options: textOptions },
          {
            tid: "configModule.customText",
            title: "自定义文本",
            text: "自定义文本",
            customText: "自定义文本",
            type: "text",
            custom: true,
            options: textOptions,
          },
        ]),
        new hiprint.PrintElementTypeGroup("图片", [
          {
            tid: "configModule.image",
            type: "image",
            data: "./assets/image/hi.png",
            title: "图片",
            text: "图片",
            options: { width: 80, height: 80, hideTitle: false, src: "./assets/image/hi.png" },
          },
          {
            tid: "configModule.qrcode",
            title: "123546789", // 二维码
            // field: "qrcode", // 配置字段只能加载测试数据, 不配置字段默认显示title, 并支持设计时修改
            data: "123546789",
            type: "text",
            text: "二维码",
            options: { width: 80, height: 80, textType: "qrcode" },
          },
          {
            tid: "configModule.barcode",
            title: "1234567890",
            // field: "barcode",
            data: "1234567890",
            type: "text",
            text: "条形码",
            options: { width: 140, height: 35, textType: "barcode" },
          },
        ]),
        new hiprint.PrintElementTypeGroup("表格", [
          {
            tid: "configModule.table",
            field: "table",
            type: "table",
            title: "表格",
            text: "表格",
            editable: true,
            columnDisplayEditable: true, //列显示是否能编辑
            columnDisplayIndexEditable: true, //列顺序显示是否能编辑
            columnTitleEditable: true, //列标题是否能编辑
            columnResizable: true, //列宽是否能调整
            isEnableEdit: true, // 启用编辑
            columnAlignEditable: true, //列对齐是否调整
            isEnableEditField: true, //编辑字段
            isEnableEditText: true, //编辑文本
            isEnableContextMenu: true, //开启右键菜单 默认true
            isEnableInsertRow: true, //插入行
            isEnableDeleteRow: true, //删除行
            isEnableInsertColumn: true, //插入列
            isEnableDeleteColumn: true, //删除列
            isEnableMergeCell: true, //合并单元格
            columns: [
              [
                { title: "职位", align: "center", field: "position", width: 100 },
                { title: "公司", align: "center", field: "company", width: 100 },
                { title: "地点", align: "center", field: "address", width: 100 },
                { title: "时间", align: "center", field: "date", width: 100 },
                { title: "主要工作", align: "center", field: "work", width: 200 },
              ],
            ],
          },
          {
            tid: "configModule.tableMulHead",
            field: "tableMulHead",
            type: "table",
            title: "多头表格",
            text: "多头表格",
            editable: true,
            columnDisplayEditable: true, //列显示是否能编辑
            columnDisplayIndexEditable: true, //列顺序显示是否能编辑
            columnTitleEditable: true, //列标题是否能编辑
            columnResizable: true, //列宽是否能调整
            columnAlignEditable: true, //列对齐是否调整
            isEnableContextMenu: true, //开启右键菜单 默认true
            isEnableInsertRow: true, //插入行
            isEnableDeleteRow: true, //删除行
            isEnableInsertColumn: true, //插入列
            isEnableDeleteColumn: true, //删除列
            isEnableMergeCell: true, //合并单元格
            columns: [
              [
                { title: "职位", align: "center", field: "position", width: 100, rowspan: 2 },
                { title: "多表头", align: "center", field: "company", width: 100, colspan: 5 },
              ],
              [
                { title: "职位", align: "center", field: "position", width: 100 },
                { title: "公司", align: "center", field: "company", width: 100 },
                { title: "地点", align: "center", field: "address", width: 100 },
                { title: "时间", align: "center", field: "date", width: 100 },
                { title: "主要工作", align: "center", field: "work", width: 200 },
              ],
            ],
          },
          {
            tid: "configModule.groupTable",
            field: "groupTable",
            type: "table",
            title: "分组表格",
            text: "分组表格",
            groupFields: ["name"],
            groupFooterFormatter: function (group, option) {
              return "这里自定义统计脚信息";
            },
            columns: [
              [
                { title: "行号", fixed: true, rowspan: 2, field: "id", width: 70 },
                { title: "人员信息", colspan: 2 },
                { title: "销售统计", colspan: 2 },
              ],
              [
                { title: "姓名", align: "left", field: "name", width: 100 },
                { title: "性别", field: "gender", width: 100 },
                { title: "销售数量", field: "count", width: 100 },
                { title: "销售金额", field: "amount", width: 100 },
              ],
            ],
          },
          { tid: "configModule.tableCustom", text: "自定义表格", title: "自定义表格", type: "tableCustom" },
        ]),
        new hiprint.PrintElementTypeGroup("辅助", [
          { tid: "configModule.hline", text: "横线", title: "横线", type: "hline" },
          { tid: "configModule.vline", text: "竖线", title: "竖线", type: "vline" },
          { tid: "configModule.rect", text: "矩形", title: "矩形", type: "rect" },
          { tid: "configModule.oval", text: "椭圆", title: "椭圆", type: "oval" },
        ]),
        new hiprint.PrintElementTypeGroup("扩展", [
          {
            tid: "configModule.html",
            type: "html",
            title: "通用HTML",
            text: "通用HTML",
            formatter: function (data, options) {
              return '<div style="font-size:16px; color:#2196f3">通用型HTML文本渲染, 不可分页</div>';
            },
          },
          {
            tid: "configModule.shtml",
            type: "shtml",
            text: "增强SHTML",
            title: "增强SHTML",
            formatter: function (data, options) {
              return `<div style="font-size:16px; color:blue">增强型SHTML, 内容超出自动分页</div>`;
            },
          },
          {
            tid: "configModule.echarts",
            type: "echarts",
            title: "Echarts图表",
            text: "Echarts图表",
            options: {
              echartsTool: true,
              echartsOption: $tool.objToString({
                title: { text: "柱状图", textStyle: { fontSize: 16 } },
                grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
                xAxis: { type: "category", data: ["一月", "二月", "三月", "四月"] },
                yAxis: { type: "value", axisLine: { show: true } },
                legend: [{ top: "8%" }],
                tooltip: {
                  trigger: "item", // item axis
                  backgroundColor: "rgba(0,0,0,0.6)",
                  borderColor: "transparent",
                  textStyle: { color: "#fff" },
                },
                toolbox: {
                  show: true,
                  feature: {
                    magicType: { type: ["line", "bar"], title: { bar: "切换柱状图", line: "切换折线图" } },
                    dataView: { show: true, title: "数据视图", lang: ["数据视图", "关闭", "刷新"] },
                    saveAsImage: { title: "下载", show: true, type: "png", pixelRatio: 2 },
                  },
                },
                series: [
                  {
                    type: "bar",
                    name: "服装",
                    label: { show: true, position: "top" },
                    data: [
                      { name: "衬衫", value: 150 },
                      { name: "羊毛衫", value: 320 },
                      { name: "雪纺衫", value: 224 },
                      { name: "裤子", value: 410 },
                    ],
                  },
                  {
                    type: "line",
                    name: "水果",
                    smooth: true,
                    label: { show: true, position: "top" },
                    data: [
                      { name: "苹果", value: 40 },
                      { name: "菠萝", value: 180 },
                      { name: "香蕉", value: 460 },
                      { name: "橘子", value: 126 },
                    ],
                  },
                ],
              }),
            },
          },
          {
            tid: "configModule.canvas",
            type: "canvas",
            text: "Canvas画板",
            title: "Canvas画板",
            options: {
              canvasDrawMode: false,
              canvasOption: $tool.objToString({
                eraseWidth: 10,
                lineWidth: 2,
                lineStyle: "rgba(0, 0, 0)",
                fillStyle: "rgba(255, 255, 255, 0)",
              }),
            },
          },
          {
            tid: "configModule.web",
            type: "web",
            title: "Web网页",
            text: "Web网页",
          },
        ]),
      ]);
    };

    return { addElementTypes: addElementTypes };
  };
})();
