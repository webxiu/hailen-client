/*
 * @Author: Hailen
 * @Date: 2025-08-19 11:41:58
 * @LastEditors: Hailen
 * @LastEditTime: 2025-11-08 15:19:05
 * @Description: 布局组件模块
 */

const _Templates = "_templates"; // 模板记录
const _Preview = "_preview"; // 模板预览

function setTemplate(data) {
  localStorage.setItem(_Templates, JSON.stringify(data));
}

function getTemplate() {
  try {
    const data = localStorage.getItem(_Templates);
    return JSON.parse(data || "[]");
  } catch (e) {
    return [];
  }
}

/** 根据模板获取打印数据 */
function getPrintData(template) {
  const _testData = {};
  if (Array.isArray(template?.panels)) {
    template.panels.forEach((f) => {
      f.printElements.forEach((el) => {
        const { field, testData, src } = el.options || {};
        if (field) {
          _testData[field] = src || testData;
          if (typeof testData === "object") {
            // 数组对象数据量大, 删除数据字段
            delete el.options.testData;
          }
        }
      });
    });
  }
  return _testData;
}

const MyHeader = {
  name: "MyHeader",
  emits: ["updateTemplate"],
  template: genTemplate("headerTemplate"),
  setup(props, { expose, emit, slots, attrs }) {
    const docVisible = ref(false);
    const iconList = reactive([
      { title: "保存模板", icon: "⚛️", click: onSubmit, hide: !Design.isIframe() },
      { title: "新窗口预览", icon: "❇️", click: onOpenNew },
      { title: "打印配置", icon: "🔔", click: onInfo },
    ]);
    const templateArr = computed(() => {
      const data = getTemplate();
      const _newData = testTemplate.filter((f) => !data.some((s) => f.name === s.name));
      const _data = data.map((m) => ({ ...m, ...(testTemplate.find((f) => m.name === f.name) || {}) }));
      _data.unshift(..._newData);
      return setTemplate(_data), _data;
    });
    const tableData = ref(templateArr.value);

    var docText = `    1️⃣.使用说明:
          1. 数据打印需设置[字段名], 未设置则使用标题作为值
          2. 设置字段名, 修改数据预览和打印均无效, 删除字段即可
          3. 导出PDF需使用base64图片,或 选择图片转base64上传
          4. 禁止元素拖动: 在options中配置draggable为false
          5. 快捷键: 
              ① 按 Space + 鼠标拖拽\t拖拽画布
              ② 按 Alt + 鼠标滚轮\t\t缩放画布
              ③ 按 Shift + 鼠标滚轮\t横向滚动
              ④ 按 ctrl + z\t\t\t\t撤销画布
              ⑤ 按 ctrl + shift + z\t\t恢复画布

    2️⃣.创建打印窗口:
          var postMsg = {
              // 基础配置
              title: "文件标题",\t\t// 导出PDF标题
              printCount: 1,\t\t\t// 打印份数(默认1), 若testData为数组, 按testData的长度打印份数
              showGridLine: true,\t\t// 是否显示网格
              showLandscape: false,\t// 是否横向打印(默认false)
              testData: testData,\t\t// 打印数据 (默认数据对象, 打印多份传入数组)
              template: template,\t\t// 打印模板 查看3️⃣ 或 文档地址: http://hiprint.io/demo
              // 其他可选配置
              history: true,\t\t\t\t\t\t\t// 是否记录历史, 默认true
              dataMode: true,\t\t\t\t\t\t\t// 变化回调获取方式: true(getJson)|false(getJsonTid)
              onDataChange: (type, json) => {}\t\t// 数据变化回调
              fontList: [{ title: "楷体", value: "KaiTi" }]  // 配置字体,合并到内部配置
          };

          openPrintIframe({ 
              title: "打印窗口标题", 
              width: "96%", 
              postMsg: postMsg, 
              showPrint: false,\t\t// 是否直接打印, 不会显示设计窗口
          }); 

    3️⃣.模板配置: 
          1. 配置多页: panels数组项中的每项都是一个分页, 表格和长文本超出页码自动新增分页
          2. 打印多份: 所有分页打印数据集中配置在testData对象中, 每页字段名不能重复
                      testData为对象时, 按printCount设置的值打印份数
                      testData为数组时, 按testData数组的长度打印份数
          3. 模板配置: 
              template: {
                panels: [
                  {
                    index: 0, \t\t\t\t\t\t// 分页索引, 多页累加
                    width: 210, \t\t\t\t\t// 宽度
                    height: 297, \t\t\t\t\t// 高度
                    paperType: "A4", \t\t\t// 尺寸
                    paperHeader: 49.5,\t\t\t// 页眉高度
                    paperFooter: 800, \t\t\t// 页脚高度
                    paperNumberDisabled: true, // 禁用页码
                    watermarkOptions: { \t\t// 配置水印
                        content: "内部文件 请勿外传",
                        rotate: 25,
                        timestamp: true,
                        format: "YYYY-MM-DD HH:mm"
                    },
                    printElements: [ ... ]\t\t\t// 表格函数配置, 查看4️⃣
                  },
                  // 继续配置其他分页
                  { ... }
                ]
              }

    4️⃣.表格函数配置: 配置在options中(注意options中的函数为字符串函数):
        printElements: [
         {
            options: { 
              ...省略其他配置
              title: "",\t\t\t\t\t\t\t\t\t// 标题默认显示冒号(：), 设置title为""则不显示冒号
              styler: \`()=>{}\`,\t\t\t\t\t\t\t// 样式函数
              rowStyler: \`()=>{}\`,\t\t\t\t\t\t// 行样式函数
              formatter: \`()=>{}\`,\t\t\t\t\t\t// 格式化函数
              rowsColumnsMerge: \`()=>{}\`,\t\t\t// 行/列合并函数
              footerFormatter: \`()=>{}\`,\t\t\t\t// 表格脚函数 (方式1, 优先级高)
              gridColumnsFooterFormatter: \`()=>{}\`,\t// 多组表格脚函数 (方式1, 优先级高)
            },
            printElementType: {  
              footerFormatter: ()=>{},\t\t\t\t\t// 表格脚函数 (方式2)
              gridColumnsFooterFormatter: ()=>{},\t// 多组表格脚函数 (方式2)
            }
          }
          // 继续配置其他元素
          { ... }
        ]
    `;

    function updateTableData(data) {
      tableData.value = data;
    }
    function onCurrentChange(row) {
      if (!row) return;
      emit("updateTemplate", row);
    }

    function onDelete(row) {
      tableData.value.splice(tableData.value.indexOf(row), 1);
      localStorage.setItem("_templates", JSON.stringify(tableData.value));
    }

    function onOpenNew() {
      window.open(location.href, "_blank");
    }

    function onInfo() {
      docVisible.value = true;
    }

    function onSubmit() {
      const template = Design.getJson();
      const testData = getPrintData(template);
      const data = { ...designData, testData, template };
      window.parent.postMessage({ event: "HiPrint", data }, "*");
    }

    expose({ updateTableData });
    return { docVisible, docText, tableData, iconList, onCurrentChange, onDelete };
  },
};

const MyTool = {
  name: "MyTool",
  emits: ["resetDesign", "updateDesign", "updateLivePreview"],
  template: genTemplate("toolTemplate"),
  setup(props, { emit }) {
    const isMore = ref(null);
    const dialogVisible = ref(false);
    const tplForm = reactive({ compress: false, disabled: false, content: "" });

    function getType(item) {
      const { action, type } = item;
      if (action === "onRotate") return designData.landscape ? "success" : "default";
      if (action === "onGridLine") return designData.gridLine ? "success" : "default";
      if (action === "onLivePreview") return designData.livePreview ? "success" : "default";
      return active.value === action || (isMore.value && action === "more") ? "success" : type;
    }

    function onOperate(item, moreFlag = false) {
      const { action } = item;
      isMore.value = moreFlag;
      if (action === "more") return;
      const sizes = paperSizes.map((m) => m.action);
      if (sizes.includes(action)) {
        active.value = action; // 是纸张才设置激活状态
      }
      // 设置纸张
      if (window.papers.includes(action)) return Design.setPaperSize(action);
      // 自定义纸张
      if (["customSize"].includes(action)) {
        if (!formData.widthInput || !formData.heightInput) return ElMessage.error("请输入宽高");
        return Design.setPaperSize(formData.widthInput, formData.heightInput);
      }
      // 缩放比例
      if (["scaleMinus", "scalePlus"].includes(action)) setScale(action);
      // 旋转
      if (["onRotate"].includes(action)) {
        designData.landscape = !designData.landscape;
        return Design.onRotate(designData.landscape);
      }
      // 网格
      if (["onGridLine"].includes(action)) {
        designData.gridLine = !designData.gridLine;
        return Design.onGridLine(designData.gridLine);
      }
      // 实时预览
      if (["onLivePreview"].includes(action)) {
        designData.livePreview = !designData.livePreview;
        return emit("updateLiveView", designData.livePreview);
      }
      if (action === "onReset") return onReset();
      if (action === "onTemplate") return onTemplate();
      // 按钮点击时间
      if (Design[action]) Design[action]();
    }
    // 重置
    function onReset() {
      Design.onResetScale();
      Design.onClear();
      emit("resetDesign");
    }

    // 模板配置
    function onTemplate() {
      dialogVisible.value = true;
      const jsonData = Design.getJson();
      const template = removeEmpty(jsonData, ["paperNumberLeft", "paperNumberTop"]);
      const json = $tool.objToString(template);
      const pressJson = $tool.objToString(template, false);

      // 1.更新压缩状态
      tplForm.content = tplForm.compress ? pressJson : json;
      // 2.更新禁用状态
      updateCheck(getDragStatus());

      function getDragStatus() {
        const { draggable } = template.panels[0]?.printElements[0]?.options || {};
        return draggable; // 获取拖拽状态
      }
      function updateCheck(disabled) {
        if (disabled === false) {
          tplForm.disabled = true;
        } else {
          tplForm.disabled = false;
        }
      }
    }

    // 设置到输入框
    function onPressCode(press, template) {
      if (!template) template = eval(`(${tplForm.content})`);
      if (press) {
        tplForm.content = $tool.objToString(template, false);
      } else {
        tplForm.content = $tool.objToString(template);
      }
    }

    // 勾选拖拽及压缩
    function onTplChange(field, value) {
      if (field === "compress") {
        isPress = value;
        onPressCode(value);
      }
      if (field === "disabled") onDisabled(value);
    }

    // 设置禁用
    function onDisabled(disabled) {
      const template = eval(`(${tplForm.content})`);
      template.panels.forEach((f) => {
        f.printElements.forEach((el) => {
          if (disabled) {
            el.options.draggable = false;
          } else {
            el.options.draggable = true;
          }
        });
      });
      onPressCode(isPress, template);
    }

    // 保存
    function onSave() {
      ElMessageBox.prompt("", "保存到本地", {
        inputValue: templateName.value,
        inputPlaceholder: "请输入模板名称 (若存在则覆盖)",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S/,
        inputErrorMessage: "模板名称不能为空",
      }).then(({ value }) => {
        value = value.trim();
        const item = {
          name: value,
          content: {
            title: value,
            testData: printConfig.testData,
            template: eval(`(${tplForm.content})`),
          },
          createDate: new Date().toLocaleString(),
        };
        templateName.value = value;
        const localData = getTemplate();
        const index = localData.findIndex((el) => el.name === value);
        // 已存在则删除再重新添加
        if (index > -1) localData.splice(index, 1);
        localData.unshift(item);
        setTemplate(localData);
        tableRef.value.updateTableData(localData);
        ElMessage.success("保存成功");
        dialogVisible.value = false;
      });
    }

    // 修改
    function onRewirite() {
      try {
        const template = eval(`(${tplForm.content})`);
        emit("updateDesign", { template });
        ElMessage.success("修改成功");
        dialogVisible.value = false;
      } catch (error) {
        console.log("error", error);
        ElMessage.warning("数据格式错误");
      }
    }

    // 复制
    function onCopy() {
      const content = tplForm.content || "{}";
      const template = eval(`(${content})`);
      const testData = getPrintData(template);
      const _testData = $tool.objToString(testData);
      const result = `testData: ${_testData},\n template: ${content}`;
      $tool.copyText(result, (err) => {
        if (err) return ElMessage.warning("复制失败");
        ElMessage.success("复制成功");
        dialogVisible.value = false;
      });
    }

    return {
      active,
      scaleValue,
      drawDef,
      tplForm,
      printVisible,
      dialogVisible,
      toolButtons,
      formData,
      isMore,
      Design,
      getType,
      setScale,
      onOperate,
      onTplChange,
      onSave,
      onRewirite,
      onCopy,
    };
  },
};
const WangEditor = {
  name: "WangEditor",
  emits: ["create"],
  template: `
    <div id="editor—wrapper">
      <div id="toolbar-container"><!-- 工具栏 --></div>
      <div id="editor-container"><!-- 编辑器 --></div>
    </div>
  `,
  setup(props, { emit }) {
    const editor = ref();
    const editVisible = ref(false);
    const { createEditor, createToolbar } = window.wangEditor;

    onMounted(() => onCreateEditor());

    function onCreateEditor() {
      const toolbarConfig = {};
      const editorConfig = {
        placeholder: "请输入内容...",
        onChange(editor) {},
      };

      editor.value = createEditor({
        selector: "#editor-container",
        html: "<p><br></p>",
        config: editorConfig,
        mode: "default", // or 'simple'
      });

      const toolbar = createToolbar({
        editor: editor.value,
        selector: "#toolbar-container",
        config: toolbarConfig,
        mode: "default", // or 'simple'
      });
      
      emit("create", editor.value);
    }
  },
};

const components = [MyHeader, MyTool, WangEditor];
function registerComponents(app) {
  components.forEach((c) => app.component(c.name, c));
}
