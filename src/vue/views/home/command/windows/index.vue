<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="24" v-for="(item, index) in commandList" :key="index">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>{{ item.title }}</span>
            </div>
          </template>
          <div v-for="(cmd, cmdIndex) in item.commands" :key="cmdIndex" @click="onClick(cmd)" type="primary" class="mb-2 command">{{ cmd.title }}</div>
          <template #footer>Footer content</template>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, toRaw } from "vue";
import { EventName } from "@/Main/client/utils/eventName";
const commandList = reactive([
  {
    title: "Windows Command",
    commands: [
      { command: "calc", title: "计算器", description: "打开系统计算器" },
      { command: "notepad", title: "记事本", description: "打开系统记事本" },
      { command: "mspaint", title: "画板", description: "打开系统画板" },
      { command: "osk", title: "屏幕键盘", description: "打开屏幕键盘" },
      { command: "snippingtool", title: "截图工具", description: "打开截图工具" },
      { command: "explorer.exe", title: "资源管理器", description: "打开资源管理器" },
      { command: "explorer .", title: "当前目录资源管理器", description: "在当前目录打开资源管理器" },
      { command: "explorer D:\\", title: "指定目录资源管理器", description: "在指定目录打开资源管理器" },
      { command: "start .", title: "当前目录资源管理器(新窗口)", description: "在当前目录打开资源管理器(新窗口)" },
      { command: "start D:\\", title: "指定目录资源管理器(新窗口)", description: "在指定目录打开资源管理器(新窗口)" },
      { command: "explorer", title: "资源管理器", description: "打开资源管理器" },
      { command: "start cmd /k", title: "命令提示符", description: "打开命令提示符" },
      { command: `start "窗口标题" /d D:\\ cmd /k`, title: "命令提示符(带标题)", description: "打开命令提示符" },
      { command: "start /d D:\\  powershell -NoExit", title: "PowerShell", description: "打开 PowerShell" },
      { command: "taskmgr", title: "任务管理器", description: "打开任务管理器" },
      { command: "control", title: "控制面板", description: "打开控制面板" },
      { command: "services.msc", title: "服务管理器", description: "打开服务管理器" },
      { command: "msinfo32", title: "系统信息", description: "打开系统信息" },
      { command: "eventvwr", title: "事件查看器", description: "打开事件查看器" },
      { command: "regedit", title: "注册表编辑器", description: "打开注册表编辑器" },
      { command: "gpedit.msc", title: "组策略编辑器", description: "打开组策略编辑器" },
      { command: "diskmgmt.msc", title: "磁盘管理", description: "打开磁盘管理" },
      { command: "devmgmt.msc", title: "设备管理器", description: "打开设备管理器" },
      { command: "ms-settings:about", title: "关于设置", description: "打开关于设置" },
      { command: "ms-settings:bluetooth", title: "蓝牙设置", description: "打开蓝牙设置" },
      { command: "ms-settings:notifications", title: "通知设置", description: "打开通知设置" },
      { command: "ms-settings:personalization", title: "个性化设置", description: "打开个性化设置" },
      { command: "ms-settings:", title: "设置", description: "打开系统设置" },
      { command: "ms-settings:network", title: "网络设置", description: "打开网络设置" },
      { command: "ms-settings:display", title: "显示设置", description: "打开显示设置" },
      { command: "ms-settings:sound", title: "声音设置", description: "打开声音设置" },
      { command: "ms-settings:privacy", title: "隐私设置", description: "打开隐私设置" }
    ]
  }
]);

function onClick(cmd) {
  window.electronAPI.invoke(EventName.WindowCommand, toRaw(cmd)).then(res=>{
    console.log("成功:", res);
  }).catch(err => {
    console.error("失败:", err);
  });
}
</script>
<style lang="scss" scoped>
.command {
  margin: 5px;
  padding: 5px;
  width: 180px;
  height: 40px;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #3f315f80;
  border-radius: 4px;
}
</style>
