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

          <el-table :data="fileList" max-height="400">
            <el-table-column prop="name" label="文件名" show-overflow-tooltip />
            <el-table-column label="格式" width="80">
              <template #default="{ row }">
                {{ row.format }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="120">
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
                <el-option label="wav" value="wav" />
              </el-select>
            </el-form-item>

            <!-- 视频专属参数 -->
            <el-form-item v-if="isVideo" label="分辨率">
              <el-select v-model="formData.scale" placeholder="请选择分辨率">
                <el-option label="720p" value="1280:720" />
                <el-option label="1080p" value="1920:1080" />
              </el-select>
            </el-form-item>

            <!-- 音频专属参数 -->
            <template v-if="!isVideo">
              <el-form-item label="码率">
                <el-select v-model="formData.bitrate" placeholder="请选择码率">
                  <el-option label="128k" value="128k" />
                  <el-option label="320k" value="320k" />
                </el-select>
              </el-form-item>

              <!-- 新增：采样率 -->
              <el-form-item label="采样率">
                <el-select v-model="formData.sampleRate" placeholder="请选择采样率">
                  <el-option label="44100 Hz" :value="44100" />
                  <el-option label="48000 Hz" :value="48000" />
                  <el-option label="22050 Hz" :value="22050" />
                </el-select>
              </el-form-item>

              <!-- 新增：声道 (报错要求 mono 单声道) -->
              <el-form-item label="声道">
                <el-select v-model="formData.channels" placeholder="请选择声道">
                  <el-option label="单声道 (Mono)" :value="1" />
                  <el-option label="立体声 (Stereo)" :value="2" />
                </el-select>
              </el-form-item>

              <!-- 新增：位深 (报错要求 16bit) -->
              <el-form-item label="位深">
                <el-select v-model="formData.bitDepth" placeholder="请选择位深">
                  <el-option label="16bit" value="s16" />
                  <el-option label="32bit" value="s32" />
                  <el-option label="8bit" value="u8" />
                </el-select>
              </el-form-item>

              <!-- 新增：字节序 (报错要求 little-endian) -->
              <el-form-item label="字节序">
                <el-select v-model="formData.endianness" placeholder="请选择字节序">
                  <el-option label="小端序 (Little-endian)" value="le" />
                  <el-option label="大端序 (Big-endian)" value="be" />
                </el-select>
              </el-form-item>
            </template>

            <el-form-item label="命名规则">
              <el-input v-model="formData.suffix" placeholder="_ok" />
            </el-form-item>
          </el-form>

          <el-button type="primary" style="width: 100%" @click="startConvert" :loading="sLoading"> 开始转换 </el-button>
        </el-card>
      </el-col>
    </el-row>

    <!-- 播放弹窗 -->
    <el-dialog v-model="previewData.visible" width="600px" title="文件预览">
      <video v-if="previewData.isVideo" :src="previewData.url" controls style="width: 100%" />
      <audio v-else :src="previewData.url" controls style="width: 100%" />
      <!-- 如果是音频且带有自定义波形组件，可以在这里展示 -->
      <WavePlayer v-if="!previewData.isVideo && previewData.path" :filePath="previewData.path" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: "HomeToolFormatConversionIndex", title: "格式转换" });
import { message } from "@/vue/utils/message";
import WavePlayer from "@/vue/components/WavePlayer/index.vue";
import { ref, computed, reactive } from "vue";

const fileList = ref([]);
const fileInput = ref(null);
const sLoading = ref(false);

// 完善 formData，为音频参数设置默认值（默认符合报错要求的格式）
const formData = reactive({
  outputDir: "",
  format: "mp3",
  suffix: "_ok",
  scale: "",
  bitrate: "128k",
  // 新增音频参数
  sampleRate: 44100,
  channels: 1, // 默认单声道 (mono)
  bitDepth: "s16", // 默认 16bit
  endianness: "le" // 默认小端序 (little-endian)
});

const previewData = reactive({ url: "", path: "", visible: false, isVideo: false });
const isVideo = computed(() => formData.format === "mp4");

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
  const url = URL.createObjectURL(row.file);
  previewData.url = url;
  previewData.path = row.path;
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
  if (dotIndex === -1) return `${outputDir}/${fileName}${suffix}.${format}`;
  const name = fileName.slice(0, dotIndex);
  return `${outputDir}/${name}${suffix}.${format}`;
}

// 开始转换
async function startConvert() {
  const { scale, bitrate, outputDir, sampleRate, channels, bitDepth, endianness } = formData;
  if (!fileList.value.length) return message.error("请选择文件");
  if (!outputDir) return message.error("请选择输出目录");
  sLoading.value = true;

  const tasks = fileList.value.map(async (item) => {
    const options = [];
    const output = addSuffix(item.name, formData);

    // 视频参数
    if (isVideo.value && scale) options.push("-vf", `scale=${scale}`);

    // 音频参数
    if (!isVideo.value) {
      if (bitrate) options.push("-b:a", bitrate);
      if (sampleRate) options.push("-ar", sampleRate);
      if (channels) options.push("-ac", channels);
      // 针对位深和字节序，通常用于 raw 格式或特定 wav 编码，这里按标准 ffmpeg 参数拼接
      if (bitDepth) options.push("-sample_fmt", bitDepth);
      // 字节序通常由 FFmpeg 根据输出格式自动处理，如果必须强制指定，可能需要特定编码器参数
      // 如果是 raw 格式输出，可能需要 -f s16le 这种写法，这里仅作参数传递示例
      if (endianness === "be" && bitDepth) {
        // 简单示例：如果是大端序，替换 sample_fmt 的后缀（视具体 FFmpeg 封装而定）
        // 实际项目中建议根据后端具体要求的命令行格式来调整这里的拼接逻辑
      }
    }

    try {
      await window.fileAPI.convert({ input: item.path, output, options });
      return { item, status: "success" };
    } catch (err) {
      console.error(err);
      message.error(`转换失败：${item.name}`);
      return { item, status: "fail" };
    }
  });
  const results = await Promise.all(tasks);
  const successCount = results.filter((r) => r.status === "success").length;
  const failCount = results.length - successCount;

  if (failCount > 0) {
    message.warning(`完成：${successCount}个成功，${failCount}个失败`);
  } else {
    message.success(`全部转换完成（共 ${results.length} 个）`);
  }
  sLoading.value = false;
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
  border: 1.5px dashed #aaa;
  padding: 30px;
  text-align: center;
  margin-bottom: 10px;
  color: #666;
  cursor: pointer;
}
.drop-zone:hover {
  border-color: #409eff;
}
</style>
