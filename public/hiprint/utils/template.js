/*
 * @Author: Hailen
 * @Date: 2025-08-19 11:41:58
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-30 17:51:12
 * @Description: 初始化模板
 */

// 水印配置
var watermarkOptions = {
  content: "内部文件 请勿外传",
  rotate: 25,
  timestamp: true,
  format: "YYYY-MM-DD HH:mm",
};

var defaultConfig = {
  title: "默认",
  showLandscape: false,
  showGridLine: true,
  history: true,
  dataMode: true,
  // fontList: [{ title: "苹果黑体", value: "STHeitiSC-Light" }],
  // onDataChange: (type, json) => {console.log(type, json); },
  testData: {},
  template: {
    panels: [
      {
        index: 0,
        paperType: "A4",
        height: 297,
        width: 210,
        paperHeader: 49.5,
        paperFooter: 800,
        paperNumberDisabled: true,
        printElements: [],
        watermarkOptions: watermarkOptions,
      },
    ],
  },
};

var testTemplate = [
  {
    name: "默认",
    createDate: new Date().toLocaleString(),
    content: Object.assign({}, defaultConfig),
  },
  {
    name: "内置模板",
    createDate: new Date().toLocaleString(),
    content: {
      title: "内置模板",
      showGridLine: true,
      showLandscape: false,
      testData: {
        barcode: "123456789",
        name: "古力娜扎",
        logo: "https://dlpctest.deogra.com/static/png/logo-0c9a0132.1751693932184.png",
        logoName: "https://dlpctest.deogra.com/static/png/titleLogo-d6d96c8f.1751693932184.png",
        longText:
          "浙江在线3月29日讯最近，\n一篇小学五年级学生写的作文引起了钱报记者的关注这篇作文的题目叫做《脏话风波》，讲述的是小作者班级里发生的一种不文明现象——讲脏话的同学越来越多，有的人说话甚至句句“带把儿”。班主任为了遏制这种现象，煞费苦心想了很多办法，跟学生斗智斗勇……看到这篇作文，记者突然想到，自己读六年级的儿子有天突然冒出一句脏话。此前，他是从不说脏话的。问他怎么学会的，他也说不出个所以然来。于是，记者做了这个小学生脏话现象调查。经过了解才发现，小学生爱说脏话竟然较为普遍，一般三年级会冒出苗头。无论是学习成绩好的，还是平时不太起眼的，都会说脏话。而且，说脏话会“传染”，一旦冒头不制止，到了五六年级甚至可能在班里大爆发。以下为作文《脏话风波》浙江在线3月29日讯最近，一篇小学五年级学生写的作文引起了钱报记者的关注。这篇作文的题目叫做《脏话风波》，讲述的是小作者班级里发生的一种不文明现象——讲脏话的同学越来越多，有的人说话甚至句句“带把儿”。班主任为了遏制这种现象，煞费苦心想了很多办法，跟学生斗智斗勇……看到这篇作文，记者突然想到，自己读六年级的儿子有天突然冒出一句脏话。此前，他是从不说脏话的。问他怎么学会的，他也说不出个所以然来。于是，记者做了这个小学生脏话现象调查。经过了解才发现，小学生爱说脏话竟然较为普遍，一般三年级会冒出苗头。无论是学习成绩好的，还是平时不太起眼的，都会说脏话。而且，说脏话会“传染”，一旦冒头不制止，到了五六年级甚至可能在班里大爆发。以下为作文《脏话风波》浙江在线3月29日讯最近，一篇小学五年级学生写的作文引起了钱报记者的关注。这篇作文的题目叫做《脏话风波》，讲述的是小作者班级里发生的一种不文明现象——讲脏话的同学越来越多，有的人说话甚至句句“带把儿”。班主任为了遏制这种现象，煞费苦心想了很多办法，跟学生斗智斗勇……看到这篇作文，记者突然想到，自己读六年级的儿子有天突然冒出一句脏话。此前，他是从不说脏话的。问他怎么学会的，他也说不出个所以然来。于是，记者做了这个小学生脏话现象调查。经过了解才发现，小学生爱说脏话竟然较为普遍，一般三年级会冒出苗头。无论是学习成绩好的，还是平时不太起眼的，都会说脏话。而且，说脏话会“传染”，一旦冒头不制止，到了五六年级甚至可能在班里大爆发。以下为作文《脏话风波》浙江在线3月29日讯最近，一篇小学五年级学生写的作文引起了钱报记者的关注。这篇作文的题目叫做《脏话风波》，讲述的是小作者班级里发生的一种不文明现象——讲脏话的同学越来越多，有的人说话甚至句句“带把儿”。班主任为了遏制这种现象，煞费苦心想了很多办法，跟学生斗智斗勇……看到这篇作文，记者突然想到，自己读六年级的儿子有天突然冒出一句脏话。此前，他是从不说脏话的。问他怎么学会的，他也说不出个所以然来。于是，记者做了这个小学生脏话现象调查。经过了解才发现，小学生爱说脏话竟然较为普遍，一般三年级会冒出苗头。无论是学习成绩好的，还是平时不太起眼的，都会说脏话。而且，说脏话会“传染”，一旦冒头不制止，到了五六年级甚至可能在班里大爆发。以下为作文《脏话风波》浙江在线3月29日讯最近，一篇小学五年级学生写的作文引起了钱报记者的关注。这篇作文的题目叫做《脏话风波》，讲述的是小作者班级里发生的一种不文明现象——讲脏话的同学越来越多，有的人说话甚至句句“带把儿”。班主任为了遏制这种现象，煞费苦心想了很多办法，跟学生斗智斗勇……看到这篇作文，记者突然想到，自己读六年级的儿子有天突然冒出一句脏话。此前，他是从不说脏话的。问他怎么学会的，他也说不出个所以然来。于是，记者做了这个小学生脏话现象调查。经过了解才发现，小学生爱说脏话竟然较为普遍，一般三年级会冒出苗头。无论是学习成绩好的，还是平时不太起眼的，都会说脏话。而且，说脏话会“传染”，一旦冒头不制止，到了五六年级甚至可能在班里大爆发。以下为作文讲述的是小作者班级里发生的一种不文明现象——讲脏话的同学越来越多，有的人说话甚至句句“带把儿”。班主任为了遏制这种现象，煞费苦心想了很多办法，跟学生斗智斗勇……看到这篇作文，记者突然想到，自己读六年级的儿子有天突然冒出一句脏话。此前，他是从不说脏话的。问他怎么学会的，他也说不出个所以然来。于是，记者做了这个小学生脏话现象调查。经过了解才发现，小学生爱说脏话竟然较为普遍，一般三年级会冒出苗头。无论是学习成绩好的，还是平时不太起眼的，都会说脏话。而且，说脏话会“传染”，一旦冒头不制止，到了五六年级甚至可能在班里大爆发。以下为作文经过了解才发现，小学生爱说脏话竟然较为普遍，一般三年级会冒出苗头。无论是学习成绩好的，还是平时不太起眼的，都会说脏话。而且，说脏话会“传染”，一旦冒头不制止，到了五六年级甚至可能在班里大爆发。以下为作文讲述的是小作者班级里发生的一种不文明现象——讲脏话的同学越来越多，有的人说话甚至句句“带把儿”。班主任为了遏制这种现象，煞费苦心想了很多办法，跟学生斗智斗勇……看到这篇作文，记者突然想到，自己读六年级的儿子有天突然冒出一句脏话。此前，他是从不说脏话的。问他怎么学会的，他也说不出个所以然来。于是，记者做了这个小学生脏话现象调查。经过了解才发现，小学生爱说脏话竟然较为普遍，一般三年级会冒出苗头。无论是学习成绩好的，还是平时不太起眼的，都会说脏话。而且，说脏话会“传染”，一旦冒头不制止，到了五六年级甚至可能在班里大爆发。以下为作文",
        table: new Array(3).fill(1).map((_, i) => {
          const id = i + 1;
          return {
            name: "张三" + id,
            age: 18 + id,
            email: "123@qq.com",
            address: "广东省深圳市",
            phone: "123456789" + id,
            sex: "<div style='color:red'>男</div>",
            hobbies: "篮球",
            type: "学生",
            status: "在职",
          };
        }),
      },
      template: {
        panels: [
          {
            index: 0,
            paperType: "A4",
            height: 297,
            width: 210,
            paperHeader: 49.5,
            paperFooter: 780,
            paperNumberDisabled: true,
            watermarkOptions: watermarkOptions,
            printElements: [
              {
                options: {
                  left: 175.5,
                  top: 10.5,
                  height: 27,
                  width: 259,
                  title: "HiPrint自定义模块打印插件",
                  fontSize: 19,
                  fontWeight: "600",
                  textAlign: "center",
                  lineHeight: 26,
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: { left: 60, top: 27, height: 13, width: 52, title: "页眉线", textAlign: "center", textType: "text", hideTitle: false },
                printElementType: { title: "自定义文本", type: "text" },
              },
              { options: { left: 25.5, top: 57, height: 705, width: 9, fixed: true, borderStyle: "dotted" }, printElementType: { type: "vline" } },
              {
                options: { left: 60, top: 61.5, height: 48, width: 87, src: "./assets/image/hi.png", fit: "contain" },
                printElementType: { title: "图片", type: "image" },
              },
              {
                options: {
                  left: 153,
                  top: 64.5,
                  height: 39,
                  width: 276,
                  title: "二维码以及条形码均采用svg格式打印。不同打印机打印不会造成失真。图片打印：不同DPI打印可能会导致失真，",
                  fontFamily: "微软雅黑",
                  textAlign: "center",
                  lineHeight: 18,
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 457.5,
                  top: 79.5,
                  height: 13,
                  width: 120,
                  title: "姓名",
                  field: "name",
                  testData: "古力娜扎",
                  color: "#f00808",
                  textDecoration: "underline",
                  textAlign: "center",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "文本", type: "text" },
              },
              {
                options: { left: 499.5, top: 120, height: 43, width: 51, title: "123456789", textType: "qrcode", hideTitle: false },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 285,
                  top: 130.5,
                  height: 34,
                  width: 175,
                  testData: "123456789",
                  field: "barcode",
                  title: "123456789",
                  fontFamily: "微软雅黑",
                  textAlign: "center",
                  textType: "barcode",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 60,
                  top: 132,
                  height: 19,
                  width: 213,
                  title: "所有打印元素都可已拖拽的方式来改变元素大小",
                  fontFamily: "微软雅黑",
                  textAlign: "center",
                  lineHeight: 18,
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 153,
                  top: 189,
                  height: 13,
                  width: 238,
                  title: "单击元素，右侧可自定义元素属性",
                  textAlign: "center",
                  fontFamily: "微软雅黑",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: { left: 60, top: 190.5, height: 13, width: 51, title: "横线", textAlign: "center", textType: "text", hideTitle: false },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 415.5,
                  top: 190.5,
                  height: 13,
                  width: 164,
                  title: "可以配置各属性的默认值",
                  textAlign: "center",
                  fontFamily: "微软雅黑",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              { options: { left: 60, top: 214.5, height: 10, width: 475.5, borderWidth: 0.75 }, printElementType: { title: "横线", type: "hline" } },
              {
                options: {
                  left: 235.5,
                  top: 220.5,
                  height: 32,
                  width: 342,
                  title: "自定义表格：用户可左键选中表头，右键查看可操作项，操作类似Excel，双击表头单元格可进行编辑。内容：title#field",
                  fontFamily: "微软雅黑",
                  textAlign: "center",
                  lineHeight: 15,
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 156,
                  top: 265.5,
                  height: 13,
                  width: 94,
                  title: "表头列大小可拖动",
                  fontFamily: "微软雅黑",
                  textAlign: "center",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 300,
                  top: 265.5,
                  height: 13,
                  width: 120,
                  title: "行列合并及背景颜色配置",
                  fontFamily: "微软雅黑",
                  textAlign: "center",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 60,
                  top: 265.5,
                  height: 13,
                  width: 90,
                  title: "红色区域可拖动",
                  fontFamily: "微软雅黑",
                  textAlign: "center",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 60,
                  top: 285,
                  height: 50,
                  width: 511.5,
                  field: "table",
                  rowsColumnsMerge: `function(row,colum,rowIndex,colIndex,tableData) {
                    if (rowIndex === 0) {
                      return {
                        trStyle: { 'background-color': '#85e9d3' },
                        trClass: 'xxx',
                      };
                    }
                    if (rowIndex === 1 && colIndex === 1) {
                      return {
                        rowspan: 2,
                        colspan: 1,
                        trStyle: { 'background-color': '#cfc3c3' },
                        tdStyle: { 'background-color': '#31f5a4' },
                        trClass: 'xxx',
                        tdClass: 'sss',
                      };
                    }
                  }`,
                  columns: [
                    [
                      { title: "基本信息", width: 100, align: "center", colspan: 2, rowspan: 1, checked: true },
                      { title: "性别", field: "sex", width: 54, align: "center", colspan: 1, rowspan: 2, checked: true, columnId: "sex" },
                      { title: "检查信息", width: 84, align: "center", colspan: 3, rowspan: 1, checked: true },
                      { title: "状态", field: "status", width: 65, align: "center", colspan: 1, rowspan: 2, checked: true, columnId: "status" },
                      { title: "其他信息", width: 100, align: "center", colspan: 2, rowspan: 1, checked: true },
                    ],
                    [
                      { title: "姓名", field: "name", width: 50, align: "center", colspan: 1, rowspan: 1, checked: true, columnId: "name" },
                      { title: "年龄", field: "age", width: 50, align: "center", colspan: 1, rowspan: 1, checked: true, columnId: "age" },
                      { title: "电话", field: "phone", width: 50, align: "center", colspan: 1, rowspan: 1, checked: true, columnId: "phone" },
                      { title: "邮箱", field: "email", width: 54, align: "center", colspan: 1, rowspan: 1, checked: true, columnId: "email" },
                      { title: "地址", field: "address", width: 84, align: "center", colspan: 1, rowspan: 1, checked: true, columnId: "address" },
                      { title: "类型", field: "type", width: 50, align: "center", colspan: 1, rowspan: 1, checked: true, columnId: "type" },
                      { title: "爱好", field: "hobbies", width: 50, align: "center", colspan: 1, rowspan: 1, checked: true, columnId: "hobbies" },
                    ],
                  ],
                },
                printElementType: { title: "表格", type: "tableCustom" },
              },
              {
                options: {
                  left: 21,
                  top: 346.5,
                  height: 61.5,
                  width: 15,
                  title: "装订线",
                  lineHeight: 18,
                  fixed: true,
                  contentPaddingTop: 3.75,
                  backgroundColor: "#ffffff",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { type: "text" },
              },
              {
                options: {
                  left: 225,
                  top: 349.5,
                  height: 13,
                  width: 346.5,
                  title: "自定义模块：主要为开发人员设计，能够快速，简单，实现自己功能",
                  textAlign: "center",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: { left: 60, top: 370.5, height: 18, width: 79, title: "配置项表格", textAlign: "center", textType: "text", hideTitle: false },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 225,
                  top: 385.5,
                  height: 38,
                  width: 346.5,
                  title: "配置模块：主要为客户使用，开发人员可以配置属性，字段，标题等，客户直接使用，配置模块请参考实例2",
                  fontFamily: "微软雅黑",
                  lineHeight: 15,
                  textAlign: "center",
                  color: "#d93838",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 60,
                  top: 488,
                  height: 13,
                  width: 123,
                  field: "",
                  title: "长文本会自动分页",
                  textAlign: "center",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: { left: 60, top: 507, height: 40, width: 511.5, field: "longText", hideTitle: false },
                printElementType: { title: "长文", type: "longText" },
              },
              { options: { left: 475.5, top: 565.5, height: 100, width: 100 }, printElementType: { title: "矩形", type: "rect" } },
              {
                options: { left: 174, top: 568.5, height: 13, width: 90, title: "竖线", textAlign: "center", textType: "text", hideTitle: false },
                printElementType: { title: "自定义文本", type: "text" },
              },
              { options: { left: 60, top: 574.5, height: 100, width: 10 }, printElementType: { title: "竖线", type: "vline" } },
              {
                options: { left: 210, top: 604.5, height: 13, width: 120, title: "横线", textAlign: "center", textType: "text", hideTitle: false },
                printElementType: { title: "自定义文本", type: "text" },
              },
              { options: { left: 130.5, top: 625.5, height: 10, width: 277, borderWidth: 0.75 }, printElementType: { title: "横线", type: "hline" } },
              {
                options: { left: 364.5, top: 649.5, height: 13, width: 101, title: "矩形", textAlign: "center", textType: "text", hideTitle: false },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: { left: 525, top: 784.5, height: 13, width: 63, title: "页尾线", textAlign: "center", textType: "text", hideTitle: false },
                printElementType: { title: "自定义文本", type: "text" },
              },
              { options: { left: 12, top: 786, height: 49, width: 49 }, printElementType: { title: "html", type: "html" } },
              {
                options: {
                  left: 75,
                  top: 790.5,
                  height: 13,
                  width: 137,
                  title: "红色原型是自动定义的Html",
                  textAlign: "center",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
              {
                options: {
                  left: 334.5,
                  top: 810,
                  height: 13,
                  width: 205,
                  title: "页眉线已上。页尾下以下每页都会重复打印",
                  textAlign: "center",
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "自定义文本", type: "text" },
              },
            ],
          },
          {
            index: 1,
            paperType: "A4",
            height: 297,
            width: 210,
            paperHeader: 53,
            paperFooter: 811,
            paperNumberDisabled: true,
            watermarkOptions: watermarkOptions,
            printElements: [
              {
                options: {
                  left: 108,
                  top: 13,
                  height: 27,
                  width: 366,
                  title: "第二项配置自动开始分页",
                  fontSize: 12,
                  fontWeight: "600",
                  textAlign: "center",
                  lineHeight: 26,
                  textType: "text",
                  hideTitle: false,
                },
                printElementType: { title: "文本", type: "text" },
              },
              { options: { left: 171, top: 110, height: 90, width: 90 }, printElementType: { type: "rect" } },
              { options: { left: 306, top: 111, height: 90, width: 90 }, printElementType: { type: "oval" } },
            ],
            paperNumberFormat: "paperNo/paperCount",
          },
        ],
      },
    },
  },
];
