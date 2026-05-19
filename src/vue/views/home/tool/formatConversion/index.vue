<template>
  <div class="app">
    <el-row :gutter="20">
      <!-- 左侧文件区 -->
      <el-col :span="12">
        <el-card>
          <template #header>文件列表</template>

          <div class="drop-zone" @drop.prevent="onDrop" @dragover.prevent @click="onOpenFile(false)">
            拖拽文件或文件夹到这里
            <p>或点击选择<span class="link">文件</span> / <span class="link" @click.stop="onOpenFile(true)">文件夹</span></p>
          </div>
          <!-- 隐藏 input -->
          <input ref="fileInput" type="file" multiple style="display: none" @change="onSelect" />

          <el-table :data="fileList">
            <el-table-column prop="name" label="文件名" />
            <el-table-column label="格式">
              <template #default="{ row }">
                {{ row.format }}
              </template>
            </el-table-column>

            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" link @click="preview(row)">预览</el-button>
                <el-button type="danger" link @click="remove(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧配置区 -->
      <el-col :span="12">
        <el-card>
          <template #header>转换配置</template>

          <el-form label-width="100px">
            <el-form-item label="输出目录">
              <el-input v-model="formData.outputDir">
                <template #append>
                  <el-button size="small" @click.stop="selectDir">选择</el-button>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="格式">
              <el-select v-model="formData.format">
                <el-option label="mp3" value="mp3" />
                <el-option label="mp4" value="mp4" />
              </el-select>
            </el-form-item>

            <!-- 动态参数 -->
            <el-form-item v-if="isVideo" label="分辨率">
              <el-select v-model="formData.scale">
                <el-option label="720p" value="1280:720" />
                <el-option label="1080p" value="1920:1080" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="isAudio" label="码率">
              <el-select v-model="formData.bitrate">
                <el-option label="128k" value="128k" />
                <el-option label="320k" value="320k" />
              </el-select>
            </el-form-item>
            <el-form-item label="命名规则">
              <el-input v-model="formData.suffix" placeholder="_ok" />
            </el-form-item>
          </el-form>

          <el-button type="primary" @click="startConvert"> 开始转换 </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 播放弹窗 -->
    <el-dialog v-model="previewData.visible" width="600px">
      <video v-if="previewData.isVideo" :src="previewData.url" controls />
      <audio v-else :src="previewData.url" controls />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: "HomeToolFormatConversionIndex", title: "格式转换" });
import { message } from "@/vue/utils/message";
import { ref, computed, reactive } from "vue";

const fileList = ref([]);
const fileInput = ref(null);
const formData = reactive({
  outputDir: "",
  format: "mp3",
  suffix: "_ok",
  scale: "",
  bitrate: ""
});
const previewData = reactive({ url: "", visible: false, isVideo: true });
const isVideo = computed(() => formData.format === "mp4");
const isAudio = computed(() => formData.format === "mp3");

function onOpenFile(isDirectory) {
  if (isDirectory) {
    fileInput.value?.setAttribute("webkitdirectory", "");
  } else {
    fileInput.value?.removeAttribute("webkitdirectory");
  }
  fileInput.value.click();
}

function onSelect(e) {
  const files = [...e.target.files];
  addFileList(files);
  e.target.value = "";
}

function onDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  const files = [...e.dataTransfer.files];
  addFileList(files);
}

function addFileList(files) {
  const paths = window.fileAPI.getPaths(files);
  paths.forEach((f) => {
    if (fileList.value.some((s) => s.name === f.name)) {
      return message.error(`文件已存在：${f.name}`);
    }
    fileList.value.push(f);
  });
  console.log("文件详细信息 :>> ", fileList.value);
}

function preview(row) {
  console.log("row :>> ", row);
  const url = URL.createObjectURL(row.file);
  previewData.url = url;
  previewData.isVideo = row.type === "视频";
  previewData.visible = true;
}

function remove(file) {
  const index = fileList.value.findIndex((f) => f.path === file.path);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
}

async function selectDir() {
  formData.outputDir = await window.fileAPI.selectDir();
}

// 文件名称添加后缀
function addSuffix(fileName, formData) {
  const { outputDir, suffix, format } = formData;
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return `${outputDir}\\${fileName}${suffix}.${format}`; // 没有扩展名
  const name = fileName.slice(0, dotIndex);
  return `${outputDir}\\${name}${suffix}.${format}`;
}

// 开始转换
async function startConvert() {
  if (!fileList.value.length) return message.error("请选择文件");
  const { scale, bitrate } = formData;
  for (const item of fileList.value) {
    const options = [];
    const output = addSuffix(item.name, formData);
    if (isVideo.value && scale) options.push("-vf", `scale=${scale}`);
    if (isAudio.value && bitrate) options.push("-b:a", bitrate);
    const params = { input: item.path, output, options };
    console.log("params :>> ", params);
    try {
      const res = await window.fileAPI.convert(params);
      console.log("转换结果 :>> ", res);
    } catch (err) {
      console.error("转换报错:", err);
      message.error(`转换失败：${item.name}`);
    }
  }
  message.success("全部转换完成");
}
</script>

<style scoped>
.app {
  padding: 20px;
}
.link {
  color: #409eff;
  cursor: pointer;
}

.drop-zone {
  border: 2px dashed #aaa;
  padding: 30px;
  text-align: center;
  margin-bottom: 10px;
}
</style>
