<template>
  <div class="flex-col flex-1">
    <h3>JSON转TS</h3>
    <div class="json2ts flex flex-1">
      <div class="flexf-4 p-10">
        <el-form label-position="top" label-width="auto" :model="formData" style="max-width: 600px">
          <el-form-item label="标题">
            <el-input v-model="formData.title" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="接口地址">
            <el-input v-model="formData.url" placeholder="请输入" />
          </el-form-item>
          <el-form-item label="请求参数">
            <el-input type="textarea" v-model="formData.request" placeholder="请输入" :rows="6" />
          </el-form-item>
          <el-form-item label="响应参数">
            <el-input type="textarea" v-model="formData.reaponse" placeholder="请输入" :rows="15" />
          </el-form-item>
        </el-form>
      </div>
      <div class="flexf-6 ml-10">
        <el-form-item label="TS类型" label-position="top">
          <el-input type="textarea" v-model="result" readonly placeholder="请输入" :rows="32" />
        </el-form-item>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Json2Ts } from "./hook";
import { computed, reactive, ref } from "vue";

// 接口-请求参数
const request = {
  id: 171317590,
  name: "Hailen",
  age: 18,
  address: "深圳"
};

// 接口-响应数据
const reaponse = {
  records: [
    {
      id: 2935,
      taskName: "人工智障",
      children: [
        {
          id: 2936,
          taskName: "很复杂的数据类型",
          good: [
            {
              wodiu: "111",
              wocao: {
                abc: 11,
                home: [{ ww: 90, cc: "dddd" }],
                info: {
                  mpg: true,
                  ak: 12,
                  null: null,
                  undefined: undefined
                }
              }
            }
          ]
        }
      ]
    },
    {
      id: 2900,
      taskName: "信息中心",
      children: [{ id: 2901, taskName: "解决方案", good: [] }]
    }
  ],
  detail: {
    id: 1,
    name: "张三",
    address: null,
    xxxs: [{ wodiu: "22", wocao: true, null: null, undefined: undefined }]
  },
  total: 5,
  count: true
};

const formData = reactive({
  url: "/v1/manage/list",
  title: "用户管理",
  request: JSON.stringify(request, null, 2),
  reaponse: JSON.stringify(reaponse, null, 2)
});

const result = computed(() => {
  let request = "{}";
  let reaponse = "{}";
  let res = "";
  try {
    request = JSON.parse(formData.request);
    reaponse = JSON.parse(formData.reaponse);
    const { result } = Json2Ts({ ...formData, request, reaponse });
    res = result;
  } catch (error) {}
  return res;
});
</script>
