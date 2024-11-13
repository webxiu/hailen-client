<template>
  <div class="login flex-col align-center just-center">
    <div>
      <h3>登录</h3>
    </div>

    <el-form :model="formData" label-width="110px" style="max-width: 300px">
      <el-form-item label="用户名">
        <el-input v-model="formData.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="formData.password" placeholder="请输入密码" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit" class="ui-w-100"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { reactive } from "vue";
import { setLoginInfo } from "@/vue/utils/storage";

const router = useRouter();

const formData = reactive({
  username: "admin",
  password: "123",
});

function onSubmit() {
  console.log("submit!", formData);
  setLoginInfo({ userInfo: formData, token: Date.now().toString() });
  router.push("/");
}
</script>

<style lang="scss" scoped>
.login {
  background: #eee;
  height: 100vh;
}
</style>
