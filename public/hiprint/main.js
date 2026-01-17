const { ElMessage, ElMessageBox } = ElementPlus;
const { createApp, defineComponent, ref, onMounted, reactive, computed } = Vue;

var isPress = false; // 全局变量
var printConfig = {}; // 重置数据创建时记录一次
var hiprintTemplate = null;
const tableRef = ref();
const active = ref(null);
const scaleValue = ref(1);
const templateName = ref("");
const printVisible = ref(false);
const editVisible = ref(false);
const tempCallback = ref();
const editor = ref(null);
const designData = reactive({ gridLine: false, landscape: false, livePreview: false });
const formData = reactive({ heightInput: "", widthInput: "", scale: "100%" });

window.onload = () => {
  const App = defineComponent({
    name: "App",
    template: genTemplate("designTemplate"),
    setup(props, {}) {
      onMounted(() => {
        if (Design.isIframe()) {
          // 在iframe中打开, 监听消息
          window.addEventListener("message", onMessageOnce);
        } else {
          // 单独打开时, 新建空模板
          onInitHiPrint(defaultConfig);
        }
      });

      /** 监听消息 初始化数据模板 */
      const onMessageOnce = (ev) => {
        const { type, data } = ev.data;
        if (type !== "HiPrint") return;
        onInitHiPrint(data);
        window.removeEventListener("message", onMessageOnce);
      };

      // 重置数据模板
      function onResetDesign() {
        onInitHiPrint(printConfig);
      }

      // 修改数据模板
      function onUpdateDesign(data) {
        onInitHiPrint(data);
      }

      // 实时预览
      function onUpdateLiveView(isLivePreview) {
        Design.onLiveView();
      }

      /** 创建模板 */
      function onInitHiPrint(data = {}) {
        const options = Object.assign({ testData: {}, template: { panels: [] } }, data);
        const { title, printCount, printType, showLandscape, showGridLine, template, testData } = options;
        templateName.value = title;
        printConfig = options;

        // 1.自动分页处理
        if (printType !== "fixed" && Array.isArray(template.panels)) {
          options.template.panels.forEach((f, index) => {
            let _testData = testData;
            if (Array.isArray(testData)) _testData = testData[index] || {};
            f.printElements.forEach((el) => {
              const { field } = el.options || {};
              if (!field) return;
              const { type } = el.printElementType;
              let value = _testData[field];
              if (value && type === "image") el.options.src = value;
              else if (value && type === "html") el.options.content = value;
              else if (value && type === "echarts") el.options.echartsOption = typeof value == "string" ? eval(`(${value})`) : $tool.objToString(value);
              else if (value && field) el.options.testData = value;
            });
          });
        }
        // 打印多份
        if (printCount > 1 && !Array.isArray(testData)) {
          options.testData = new Array(printCount).fill(testData);
        }
        // 2.固定分页处理
        function fixed() {
          onCreateFixedPage(data);
        }

        createTemplate(options)
          .then(() => {
            const printHander = { fixed };
            printHander[printType]?.();
            const { showPrint, showPreview } = getQuery(location.href);
            const { paperType } = options.template.panels[0] || {};
            if (paperType) Design.setPaperSize(paperType);
            if (showGridLine) (designData.gridLine = true), Design.onGridLine(true);
            if (showLandscape) (designData.landscape = true), Design.onRotate();
            if (showPrint === "true") Design.onPrint();
            if (showPreview === "true") Design.onPreview();
          })
          .catch((err) => console.error("模板初始化失败", err));
      }

      // 新增、移动、删除、修改(参数调整)、大小、旋转
      function onDataChanged(type, json) {
        console.log(type, json);
        if (designData.livePreview) onUpdateLiveView();
      }

      /** 创建模板 */
      function createTemplate(options = {}) {
        const { template, showGridLine, dataMode, history, fontList, onDataChange = onDataChanged } = options;
        return new Promise((resolve) => {
          $("#designer").html("");
          //初始化打印插件
          hiprint.init({ providers: [new customElementTypeProvider()] });
          //设置左侧拖拽事件
          hiprint.PrintElementTypeManager.buildByHtml($(".ep-draggable-item"));
          hiprintTemplate = new hiprint.PrintTemplate({
            template: template,
            fontList: fontList,
            dataMode: dataMode,
            gridLine: showGridLine,
            history: history,
            onDataChange: onDataChange,
            layerOption: { icons: icons, el: "#ElementLayer" },
            settingContainer: "#PrintOptionSetting",
            paginationContainer: ".PrintPagination",
          });
          hiprintTemplate.design("#designer"); // 渲染设计器
          requestAnimationFrame(() => resolve());
        });
      }

      // 固定分页内容
      function onCreateFixedPage(data) {
        const { pages, isAllPaper, showLandscape } = data;
        const defaultPanelHeight = 297; // mm
        const _pages = pages.filter((f) => !(f.pageHeader || f.pageFooter));
        const _papers = pages.filter((f) => f.pageHeader || f.pageFooter);

        // 添加页眉页脚
        function addHeaderFooter(_papers, panel, isLastPage = false) {
          _papers.forEach((f) => {
            if (f.pageHeader) addElement(f.elements, panel); // 页眉
            if (f.pageFooter && isLastPage) addElement(f.elements, panel); // 页尾
          });
        }
        // 遍历数据生成每一页
        _pages.forEach((item, index) => {
          // 添加分页
          if (index > 0) {
            hiprintTemplate.addPrintPanel({
              height: showLandscape ? 210 : defaultPanelHeight,
              width: showLandscape ? defaultPanelHeight : 210,
              paperNumberDisabled: true,
              paperNumberFormat: "paperNo-paperCount",
              pageBreak: index < _pages.length - 1,
            });
          }
          const panel = hiprintTemplate.getPanel(index); // 获取当前页
          addHeaderFooter(_papers, panel, isAllPaper || index === _pages.length - 1);
          addElement(item.elements, panel);
        });
        hiprintTemplate.design("#designer");
      }

      /** 添加元素 */
      function addElement(elements = [], panel) {
        elements.forEach(({ method, templateType, testData, options }) => {
          if (templateType === "table") options.content = createPrint(testData).outerHTML;
          panel[method]({ options });
        });
      }

      /** 选中列表模板 */
      function onUpdateTemplate(row) {
        onInitHiPrint(row.content);
      }

      function onCreateEditor(wEditor) {
        editor.value = wEditor;
        window.wEditor = wEditor;
      }

      /** 打开富文本 */
      function openRichText(value, callback) {
        editVisible.value = true;
        if (value) {
          requestAnimationFrame(() => {
            editor.value.setHtml(value);
          });
        }
        tempCallback.value = callback;
      }

      /** 获取富文本 */
      function onConfirm(callback) {
        const content = editor.value.getHtml();
        if (tempCallback.value) {
          tempCallback.value({ editor: editor.value, content });
        }
        editVisible.value = false;
      }
      window.$tool.openRichText = openRichText;

      return {
        tableRef,
        designData,
        templateName,
        elements,
        papers,
        toolButtons,
        editVisible,
        printVisible,
        onCreateEditor,
        onConfirm,
        onInitHiPrint,
        onResetDesign,
        onUpdateDesign,
        onUpdateLiveView,
        onUpdateTemplate,
      };
    },
  });
  const app = createApp(App);
  app.use(ElementPlus);
  registerComponents(app);
  app.mount("#app");
};
