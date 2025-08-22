<!--
 * @Author: Hailen
 * @Date: 2025-08-22 11:27:52
 * @LastEditors: Hailen
 * @LastEditTime: 2025-08-22 18:07:12
 * @Description: 
-->
<template>
  <div class="ui-h-100" v-loading="loading">
    <iframe v-if="!loading" ref="iframeRef" id="iframe" width="100%" height="100%" @load="loaded" :src="printUrl" style="border: 0" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

type GraphDataType = {
  eventName: "save" | "init";
  data: { xml: string; svg: string; filename: string };
};

interface Props {
  type?: "add" | "edit";
  row?: any;
}

const props = withDefaults(defineProps<Props>(), {
  type: "add",
  row: () => ({})
});

const iframeRef = ref();
const loading = ref(false);

const printUrl = computed(() => {
  if (import.meta.env.DEV) return "/hiprint/print.html";
  return `file://${$$.appInfo.buildPath}/public/hiprint/print.html`;
});

onMounted(() => {
  loadData();
  window.addEventListener("message", onMessage);
});

const onMessage = (event) => {
  const data: GraphDataType = event.data;
  console.log("接收message:", data);
  // message.success("保存成功");
};

// 请求xml数据
const loadData = () => {
  loading.value = true;
  const { row } = props;
  if (props.type === "edit") {
    // http.get(row?.virtualPath).then((res: any) => {
    //   loading.value = false;
    //   xml.value = res;
    // });
  } else {
    loading.value = false;
  }
};

const loaded = () => {
  const { processName } = props.row;
  var testData = {
    logo: "./assets/image/hi.png",
    logoName: "./assets/image/company.png",
    barcode: "D100861122", // 条码数据
    provider: "深圳不怕影子斜科技有限公司",
    number: "T100861122",
    concat: "张三丰",
    createDate: " 2025-05-26 17:30:52",
    phone: "135555555",
    way: "月结30天",
    mobilePhone: "185555555",
    purchaser: "霍元甲",
    fax: "0755-1008611",
    telephone: "185555555",
    remark: " VK2025040825-DS073D13黑-制程不良补料",
    address: " 深圳市南山区科技园",
    table: new Array(30).fill(1).map((_, i) => {
      const id = i + 1,
        xxx = "_" + id.toString().padStart(2, "0");
      return {
        id: id,
        materialCode: "2.00.007316" + xxx,
        materialName: "DS073D固定架配件" + xxx,
        specifications: "哑光深灰渐变浅灰PET" + xxx,
        unit: "Pcs",
        number: 50 + id,
        rate: 13 + id,
        price: 0.475 + id,
        priceTotal: 300.5 + id,
        deliveryDate: "2020-01-01"
      };
    }),
    table2: new Array(30).fill(1).map((_, i) => {
      const id = i + 1;
      return {
        name: "张三" + id,
        age: 18 + id,
        email: "123@qq.com",
        address: "广东省深圳市南山区",
        phone: "123456789" + id,
        sex: "<div style='color:red'>男</div>",
        hobbies: "篮球",
        type: "学生",
        status: "在职"
      };
    }),
    statement: "按物料周期备货及按德龙采购安排按时交付",
    longText: `
              1、请供方在收到本订单1个工作日内确认并加盖公章签回，逾期视为供方无条件接受本订单；
              2、如有质量异常及逾期交货，我司将按订单总金额5%自动从货款中扣除违约金，按日累计，不另行通知；
              3、供方产品经我公司品质部检验后有质量异常，我方将无条件退回。
              &nbsp; 供方应及时补足，三天内如供方不处理，我公司有权自行处理；
              &nbsp; 如供方产品因品质异常而退货，但我公司又急需生产而致使我公司返工或挑选使用，
              &nbsp; 我公司将按人工费用RMB 50元/小时在当月货款中扣出；造成我公司停线将按RMB 200元/小时在当月货款中扣出；
              &nbsp; 如本公司收到客户投诉有涉及到或可能涉及到供方材料质量、安全或有害物质的问题，
              &nbsp; 供方应积极配合本公司采取纠正和纠正措施；
              4、本公司每月对账为整个自然月，逾期未传对账单至我司将延至下月；
              &nbsp; 我司对账单回签后5个工作日内务必将增值税发票送至我公司财务部签收；
              &nbsp; 如逾期，此付款将顺延至下个月；月结方式为每张订单交清后计月结；
              5、供应商须规范填写送货单，否则仓库拒收：
              &nbsp; A、必须规范填写我司的“采购单号”、“工单号”；
              &nbsp; B、产品名称、规格型号必须按我司订单填写；
              &nbsp; C、如我司订单有标注“物料编号”，则送货单也必须填写“物料编号”；
              6、本公司所有采购物料必须符合最新ROHS、Reach的环保要求。 
              `,
    qrcode: "https://www.baidu.com/",
    advice: "投诉建议",
    supplier: "张三",
    supplierSign: "",
    purchaserAudit: "张三1",
    purchaserSign: "李四2"
  };

  var template = {
    // 可以配置多个panels, 每个panel都重新开始分页
    panels: [
      {
        index: 0,
        height: 297,
        width: 210,
        paperHeader: 120, // 页眉高度(在此高度上的元素 每页重复)
        paperFooter: 795, // 页脚高度(在此高度下的元素 每页重复)
        paperNumberLeft: 565.5,
        paperNumberTop: 813,
        paperNumberDisabled: true, // 隐藏页码
        printElements: [
          { options: { left: 60, top: 20, height: 48, src: "", field: "logo", fit: "contain" }, printElementType: { title: "图片", type: "image" } },
          { options: { left: 150, top: 20, width: 380, src: "", field: "logoName" }, printElementType: { title: "图片", type: "image" } },
          // 中线 (布局辅助线, 上线需删除)
          // { options: { ...middle(0), height: 838, width: 9, fixed: true, borderStyle: "dotted" }, printElementType: { type: "vline", title: "中线" } },
          // 标题
          {
            options: {
              title: "采 购 订 单",
              left: 167.5,
              top: 78,
              height: 27,
              width: 259,
              fontSize: 19,
              fontWeight: "600",
              textAlign: "center",
              lineHeight: 26
            },
            printElementType: { title: "文本", type: "text" }
          },
          // 条形码
          {
            options: {
              title: "条形码",
              left: 465,
              top: 75,
              height: 28.5,
              width: 108,
              fontFamily: "微软雅黑",
              field: "barcode",
              textType: "barcode",
              textAlign: "center"
            },
            printElementType: { title: "条形码", type: "text" }
          },
          // 矩形
          { options: { left: 21, top: 130, width: 552, height: 116 }, printElementType: { title: "矩形", type: "rect" } },
          // 订单信息
          { options: { title: "供应商", left: 39, top: 134, height: 13, width: 251, field: "provider" }, printElementType: { title: "文本", type: "text" } },
          { options: { title: "编 号", left: 319.5, top: 134, height: 13, width: 246.5, field: "number" }, printElementType: { title: "文本", type: "text" } },
          { options: { title: "联系人", left: 39, top: 151, height: 13, width: 251, field: "concat" }, printElementType: { title: "文本", type: "text" } },
          {
            options: { title: "日 期", left: 319.5, top: 151, height: 13, width: 246.5, field: "createDate" },
            printElementType: { title: "文本", type: "text" }
          },
          { options: { title: "电 话", left: 43.5, top: 168, height: 13, width: 246.5, field: "phone" }, printElementType: { title: "文本", type: "text" } },
          { options: { title: "月结方式", left: 306, top: 168, height: 13, width: 260, field: "way" }, printElementType: { title: "文本", type: "text" } },
          {
            options: { title: "移动电话", left: 30, top: 185, height: 13, width: 260, field: "mobilePhone" },
            printElementType: { title: "文本", type: "text" }
          },
          { options: { title: "采购人", left: 315, top: 185, height: 13, width: 251, field: "purchaser" }, printElementType: { title: "文本", type: "text" } },
          { options: { title: "传 真", left: 43.5, top: 202, height: 13, width: 246.5, field: "fax" }, printElementType: { title: "文本", type: "text" } },
          {
            options: { title: "电 话", left: 319.5, top: 202, height: 13, width: 246.5, field: "telephone" },
            printElementType: { title: "文本", type: "text" }
          },
          { options: { title: "备 注", left: 43.5, top: 219, height: 13, width: 246.5, field: "remark" }, printElementType: { title: "文本", type: "text" } },
          { options: { title: "送货地址", left: 306, top: 219, height: 13, width: 260, field: "address" }, printElementType: { title: "文本", type: "text" } },
          // 订单表格
          {
            options: {
              left: 21,
              top: 245,
              height: 60,
              width: 552,
              field: "table",
              columns: [
                [
                  { title: "物料代码", field: "materialCode", width: 100 },
                  { title: "物料名称", field: "materialName", width: 100 },
                  { title: "规格型号", field: "specifications", width: 160 },
                  { title: "单位", field: "unit", width: 30 },
                  { title: "数量", field: "number", width: 40, align: "right" },
                  { title: "税率(%)", field: "rate", width: 45, align: "right" },
                  { title: "含税单价", field: "price", width: 50, align: "right" },
                  { title: "价税合计", field: "priceTotal", width: 50, align: "right" },
                  { title: "交货日期", field: "deliveryDate", width: 100 }
                ]
              ],
              footerFormatter: `function (options, rows, testData, gridRowsData) {
                const total = rows.reduce((total, row) => total + +row.priceTotal, 0) || 0;
                return \`<tr>
                  <td colspan='7' align='center'>合计</td>
                  <td align='center'>\${total.toFixed(2)}</td>
                  <td></td>
                </tr>\`
            }`
            },
            printElementType: { title: "表格", type: "table" }
          },
          {
            options: { left: 24, top: 320, lineHeight: 18, height: 18, width: 300, field: "statement", textType: "text" },
            printElementType: { title: "重点声明", type: "text" }
          },
          { options: { left: 22, top: 340, width: 550, height: 240 }, printElementType: { title: "矩形", type: "rect" } },
          {
            options: { left: 30, top: 350, height: 230, width: 520, field: "longText", textType: "longText", lineHeight: 14 },
            printElementType: { title: "", type: "longText" }
          },
          // 二维码
          {
            options: { title: "二维码", width: 60, height: 60, left: 430, top: 466, field: "qrcode", textType: "qrcode", qrCodeLevel: 2, color: "#f60" },
            printElementType: { title: "自定义文本", type: "text" }
          },
          // 签名
          {
            options: { title: "投诉建议", width: 60, height: 14, left: 430, top: 535, lineHeight: 14, textAlign: "center", testData: "投诉建议" },
            printElementType: { title: "文本", type: "text" }
          },
          {
            options: { title: "采购批准", left: 89, top: 602, height: 13, width: 171, field: "supplier", testData: "" },
            printElementType: { title: "文本", type: "text" }
          },
          {
            options: { title: "供方盖章", left: 350, top: 602, height: 13, width: 140, field: "supplierSign", testData: "" },
            printElementType: { title: "文本", type: "text" }
          },
          {
            options: { title: "购方审核", left: 89, top: 632, height: 13, width: 171, field: "purchaserAudit", testData: "" },
            printElementType: { title: "文本", type: "text" }
          },
          {
            options: { title: "供方代表签名", left: 332, top: 632, height: 13, width: 158, field: "purchaserSign", testData: "" },
            printElementType: { title: "文本", type: "text" }
          }
        ]
      },
      {
        index: 1,
        paperType: "A4",
        height: 297,
        width: 210,
        paperHeader: 120,
        paperFooter: 841,
        paperNumberDisabled: true,
        printElements: [
          {
            options: {
              left: 98,
              top: 42,
              height: 27,
              width: 366,
              title: "深圳不怕影子斜有限公司汇总表（当月）",
              fontSize: 12,
              fontWeight: "600",
              textAlign: "center",
              lineHeight: 26,
              textType: "text",
              hideTitle: false
            },
            printElementType: {
              title: "文本",
              type: "text"
            }
          },
          {
            options: {
              left: 21,
              top: 80,
              height: 58.5,
              width: 550,
              field: "table2",
              textType: "table",
              columns: [
                [
                  { width: 100, title: "基本信息", field: "", rowspan: 1, colspan: 2, align: "center" },
                  { width: 84, title: "性别", field: "sex", rowspan: 2, colspan: 1, align: "center" },
                  { width: 84, title: "检查信息", field: "", rowspan: 1, colspan: 3, align: "center" },
                  { width: 100, title: "状态", field: "status", rowspan: 2, colspan: 1, align: "center" },
                  { width: 100, title: "其他信息", field: "", rowspan: 1, colspan: 2, align: "center" }
                ],
                [
                  { width: 77, title: "姓名", field: "name", align: "center" },
                  { width: 77, title: "年龄", field: "age", align: "center" },
                  { width: 77, title: "电话", field: "phone", align: "center" },
                  { width: 84, title: "邮箱", field: "email", align: "center" },
                  { width: 77, title: "地址", field: "address", align: "center", width: 130 },
                  { width: 77, title: "类型", field: "type", align: "center" },
                  { width: 77, title: "爱好", field: "hobbies", align: "center" }
                ]
              ]
            },
            printElementType: {
              title: "表格(多表头)",
              type: "table"
            }
          }
        ],
        paperNumberFormat: "paperNo/paperCount"
      }
    ]
  };

  const postMsg = {
    title: "采购订单",
    size: "A4",
    showGridLine: true,
    showLandscape: false,
    printType: "auto",
    testData: testData,
    template: template
  };
  iframeRef.value?.contentWindow.postMessage({ type: "HiPrint", data: postMsg }, "*");
};
</script>
