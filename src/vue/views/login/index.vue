<template>
  <div class="login flex-col just-center align-center">
    <div>
      <h3>标题</h3>
    </div>
    <div class="login-form flex-col just-center align-center flex-1">
      <h3>欢迎使用WORK系统</h3>
      <el-form :model="formData" label-width="60px" style="max-width: 300px" class="mt-20">
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="用户名">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isLogin" label="手机号">
          <el-input v-model="formData.phone" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="formData.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button v-if="isLogin" type="primary" @click="onSubmit" class="ui-w-100">登录</el-button>
          <el-button v-else type="primary" @click="onRegister" class="ui-w-100">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="ui-w-100 login-footer flex just-end">
      <div v-if="isLogin">没有账号? 去<span class="tip-btn" @click="isLogin = false">注册</span></div>
      <div v-else>已有账号? 去<span class="tip-btn" @click="isLogin = true">登录</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { login, register } from "@/vue/api/user";
import { message } from "@/vue/utils/message";
import { useUserStore } from "@/vue/store/modules/user";

const isLogin = ref(true);
const useStore = useUserStore();

const formData = reactive({
  username: "123",
  password: "123",
  phone: "1888888888",
  email: "123@qq.com"
});

function onSubmit() {
  useStore.userLogin(formData).then(() => {
    message.success("登录成功");
  });
}
function onRegister() {
  register(formData).then(({ data }) => {
    if (!data) return message.error("注册失败");
    message.success("注册成功");
  });
}
</script>

<style lang="scss" scoped>
.login {
  background: #eee;
  height: 100vh;
  .login-footer {
    padding: 20px;
    .tip-btn {
      cursor: pointer;
      color: #409eff;
    }
  }
}
</style>
