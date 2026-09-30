<template>
  <div class="login flex">
    <!-- 左侧品牌展示区 -->
    <div class="login-brand ui-p-r ui-ov-h">
      <div class="brand-inner flex-col">
        <div class="brand-logo flex align-center">
          <div class="logo-mark flex just-center align-center">
            <el-icon :size="24"><Monitor /></el-icon>
          </div>
          <span class="logo-name">海阔天空 · WORK</span>
        </div>

        <div class="brand-slogan">
          <h1>安全、高效、优雅的<br />桌面办公工作台</h1>
          <p>数据本地化 · 多端协同 · 极致体验</p>
        </div>

        <ul class="brand-features">
          <li v-for="feat in features" :key="feat.title" class="flex">
            <el-icon :size="18">
              <component :is="feat.icon" />
            </el-icon>
            <div>
              <h4>{{ feat.title }}</h4>
              <p>{{ feat.desc }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="brand-decor decor-a"></div>
      <div class="brand-decor decor-b"></div>
      <div class="brand-decor decor-c"></div>
    </div>

    <!-- 右侧表单区 -->
    <div class="login-main flex-col just-center align-center ui-p-r">
      <div class="login-box">
        <div class="login-head">
          <h2>{{ isLogin ? "欢迎回来" : "创建账号" }}</h2>
          <p>{{ isLogin ? "登录 WORK 系统，开启高效协作" : "注册账号以使用系统的全部功能" }}</p>
        </div>

        <!-- 登录方式切换(仅登录态显示) -->
        <div v-show="isLogin" class="login-tabs flex">
          <div class="login-tab flex-1 ui-ta-c pointer" :class="{ active: loginMode === 'account' }" @click="loginMode = 'account'">账号登录</div>
          <div class="login-tab flex-1 ui-ta-c pointer" :class="{ active: loginMode === 'gesture' }" @click="loginMode = 'gesture'">手势解锁</div>
        </div>

        <el-form v-show="!isLogin || loginMode === 'account'" :model="formData" label-position="top" class="login-form">
          <el-form-item label="邮箱">
            <el-input v-model="formData.email" size="large" :prefix-icon="Message" placeholder="请输入邮箱" clearable />
          </el-form-item>
          <el-form-item v-if="!isLogin" label="用户名">
            <el-input v-model="formData.username" size="large" :prefix-icon="User" placeholder="请输入用户名" clearable />
          </el-form-item>
          <el-form-item v-if="!isLogin" label="手机号">
            <el-input v-model="formData.phone" size="large" :prefix-icon="Iphone" placeholder="请输入手机号" clearable />
          </el-form-item>
          <el-form-item label="密码">
            <div class="flex ui-w-100">
              <el-input
                v-model="formData.password"
                size="large"
                :prefix-icon="Lock"
                type="password"
                placeholder="请输入密码"
                show-password
                class="flex-1"
              />
              <!-- 注册: 点击绘制手势密码 -->
              <el-button v-if="!isLogin" size="large" :icon="Grid" class="gesture-btn" title="绘制手势密码" @click="gestureVisible = true" />
            </div>
          </el-form-item>
          <el-form-item label="验证码">
            <div class="flex ui-w-100">
              <el-input
                ref="authcode"
                v-model="formData.authcode"
                size="large"
                :prefix-icon="Key"
                placeholder="请输入验证码"
                name="authcode"
                type="text"
                tabindex="3"
                autocomplete="on"
                class="flex-1"
              />
              <AuthCode :getCode="getCode" :width="112" :height="40" />
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="large" class="login-btn ui-w-100" @click="isLogin ? onSubmit() : onRegister()">
              {{ isLogin ? "登 录" : "注 册" }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 手势解锁(保持挂载, canvas 隐藏时绘制不受影响) -->
        <div v-show="isLogin && loginMode === 'gesture'" class="login-gesture flex-col align-center">
          <NineGridUnlock :size="280" title="按住鼠标绘制图案即可解锁" @unlock="onUnlock" />
        </div>

        <!-- 手势密码绘制弹窗(注册时设置密码) -->
        <el-dialog v-model="gestureVisible" title="绘制手势密码" width="340px" align-center @open="onGestureOpen">
          <div class="flex-col align-center">
            <NineGridUnlock ref="gestureUnlockRef" :size="280" title="按住鼠标绘制图案，松开完成" @unlock="onGestureDraw" />
            <div class="gesture-drawn" :class="{ active: gesturePassword }">
              {{ gesturePassword ? `已绘制 ${gesturePassword.length} 个点，可重新绘制覆盖` : "图案将作为密码填入密码框" }}
            </div>
          </div>
          <template #footer>
            <el-button @click="gestureVisible = false">取 消</el-button>
            <el-button type="primary" @click="onGestureConfirm">确 定</el-button>
          </template>
        </el-dialog>

        <div class="login-switch ui-ta-c">
          <template v-if="isLogin">还没有账号？<span class="switch-btn" @click="isLogin = false">立即注册</span></template>
          <template v-else>已有账号？<span class="switch-btn" @click="isLogin = true">返回登录</span></template>
        </div>
      </div>

      <div class="login-footer ui-ta-c">© {{ year }} 海阔天空 · WORK 办公系统</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw, reactive, ref } from "vue";
import { Connection, Grid, Iphone, Key, Lock, Message, Monitor, User } from "@element-plus/icons-vue";
import { login, register } from "@/vue/api/user";
import { message } from "@/vue/utils/message";
import { useUserStore } from "@/vue/store/modules/user";
import AuthCode from "./components/AuthCode.vue";
import NineGridUnlock from "./components/NineGridUnlock.vue";

const authCode = ref("");
const isLogin = ref(true);
/** 登录方式: account 账号密码 / gesture 手势解锁 */
const loginMode = ref<"account" | "gesture">("account");
const year = new Date().getFullYear();
const useStore = useUserStore();
const formData = reactive({
  username: "123",
  password: "123",
  authcode: "",
  phone: "1888888888",
  email: "123@qq.com"
});

/** 左侧品牌区特性介绍 */
const features = [
  { icon: markRaw(Lock), title: "安全可靠", desc: "数据本地加密存储，隐私无忧" },
  { icon: markRaw(Connection), title: "高效协同", desc: "团队信息实时同步，协作畅通" },
  { icon: markRaw(Monitor), title: "桌面体验", desc: "原生窗口运行，操作流畅自然" }
];

function getCode(code) {
  formData.authcode = code;
  authCode.value = code;
}
function onSubmit() {
  if (formData.authcode !== authCode.value) {
    return message.error("验证码错误");
  }
  useStore.userLogin(formData).then(() => {
    message.success("登录成功");
  });
}
function onRegister() {
  register(formData).then(({ data }) => {
    if (!data) return message.error("注册失败");
    message.success("注册成功");
    isLogin.value = true;
  });
}

function onUnlock(path) {
  console.log("解锁路径:", path);
  formData.password = path;
  useStore.userLogin(formData).then(() => {
    message.success("登录成功");
  });
}

/* ===================== 手势密码弹窗(注册) ===================== */
const gestureVisible = ref(false);
/** 手势绘制的图案, 确认后才写入密码框 */
const gesturePassword = ref("");
const gestureUnlockRef = ref<InstanceType<typeof NineGridUnlock>>();

/** 打开弹窗: 清空上次绘制的残留 */
function onGestureOpen() {
  gesturePassword.value = "";
  gestureUnlockRef.value?.reset();
}

/** 手势绘制完成, 暂存图案 */
function onGestureDraw(password: string) {
  gesturePassword.value = password;
}

/** 确认: 图案写入密码框 */
function onGestureConfirm() {
  if (gesturePassword.value.length < 4) {
    return message.warning("手势图案至少连接 4 个点");
  }
  formData.password = gesturePassword.value;
  gestureVisible.value = false;
}
</script>

<style lang="scss" scoped>
.login {
  height: 100vh;
  min-width: 760px;
  overflow: hidden;

  /* ===================== 左侧品牌区 ===================== */
  &-brand {
    flex: 1.15;
    color: #fff;
    background: linear-gradient(140deg, #4d7cfe 0%, #2a5af8 45%, #1e3fd0 100%);

    .brand-inner {
      position: relative;
      z-index: 1;
      height: 100%;
      padding: 48px 56px;
    }

    .brand-logo {
      gap: 12px;

      .logo-mark {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.18);
        border: 1px solid rgba(255, 255, 255, 0.35);
        backdrop-filter: blur(4px);
      }

      .logo-name {
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 1px;
      }
    }

    .brand-slogan {
      margin-top: 84px;

      h1 {
        font-size: 32px;
        font-weight: 600;
        line-height: 1.55;
        letter-spacing: 2px;
      }

      p {
        margin-top: 14px;
        font-size: 14px;
        letter-spacing: 3px;
        color: rgba(255, 255, 255, 0.78);
      }
    }

    .brand-features {
      gap: 26px;
      margin-top: auto;
      list-style: none;

      li {
        gap: 14px;
        align-items: flex-start;
      }

      .el-icon {
        margin-top: 2px;
        padding: 8px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.14);
      }

      h4 {
        font-size: 15px;
        font-weight: 600;
      }

      p {
        margin-top: 4px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.72);
      }
    }

    /* 装饰圆 */
    .brand-decor {
      position: absolute;
      border-radius: 50%;

      &.decor-a {
        top: -110px;
        right: -90px;
        width: 320px;
        height: 320px;
        background: rgba(255, 255, 255, 0.08);
      }

      &.decor-b {
        bottom: -180px;
        left: -160px;
        width: 420px;
        height: 420px;
        background: rgba(255, 255, 255, 0.06);
      }

      &.decor-c {
        bottom: 120px;
        right: 60px;
        width: 160px;
        height: 160px;
        border: 1px dashed rgba(255, 255, 255, 0.25);
      }
    }
  }

  /* ===================== 右侧表单区 ===================== */
  &-main {
    flex: 1;
    padding: 40px;
    background: #f5f7fd;
  }

  &-box {
    width: 360px;
  }

  &-head {
    h2 {
      font-size: 26px;
      font-weight: 600;
      color: #1f2d3d;
    }

    p {
      margin-top: 10px;
      font-size: 14px;
      color: #8a94a6;
    }
  }

  &-tabs {
    gap: 32px;
    margin-top: 28px;
    padding-bottom: 1px;
    border-bottom: 1px solid #e4e8f0;

    .login-tab {
      position: relative;
      padding: 10px 2px;
      font-size: 15px;
      color: #8a94a6;
      transition: color 0.2s;

      &.active {
        font-weight: 600;
        color: #2a5af8;

        &::after {
          content: "";
          position: absolute;
          right: 25%;
          bottom: -1px;
          left: 25%;
          height: 2px;
          border-radius: 2px;
          background: #2a5af8;
        }
      }
    }
  }

  &-form {
    margin-top: 24px;

    :deep(.el-form-item) {
      margin-bottom: 20px;
    }

    :deep(.el-form-item:last-child) {
      margin-bottom: 0;
    }

    :deep(.el-form-item__label) {
      color: #4a5568;
    }
  }

  &-btn {
    height: 44px;
    margin-top: 4px;
    font-size: 16px;
    letter-spacing: 6px;
    border: none;
    border-radius: 8px;
    background: linear-gradient(90deg, #4d7cfe, #2a5af8);
    box-shadow: 0 8px 20px rgba(42, 90, 248, 0.28);

    &:hover {
      background: linear-gradient(90deg, #6289ff, #3a68fa);
    }
  }

  &-gesture {
    margin-top: 28px;
  }

  /* 手势密码按钮与弹窗 */
  .gesture-btn {
    margin-left: 12px;
    padding: 0 16px;
  }

  .gesture-drawn {
    margin-top: 8px;
    font-size: 13px;
    color: #8a94a6;

    &.active {
      color: #2a5af8;
    }
  }

  &-switch {
    margin-top: 20px;
    font-size: 14px;
    color: #8a94a6;

    .switch-btn {
      color: #2a5af8;
      cursor: pointer;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &-footer {
    position: absolute;
    right: 0;
    bottom: 24px;
    left: 0;
    font-size: 12px;
    color: #b0b8c8;
  }

  /* 窗口较窄时隐藏品牌区, 表单区自适应 */
  @media (max-width: 900px) {
    .login-brand {
      display: none;
    }
  }
}
</style>
