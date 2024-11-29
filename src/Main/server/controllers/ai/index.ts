import { Context } from "koa";
import { responseStatus } from "../../config/index";

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: "sk-G37tdZZBhaXukFYvVkMvxgPtRTB4xOS5ty3jeMay8IOFOmOe",
  baseURL: "https://api.moonshot.cn/v1"
});

let history: any[] = [
  {
    role: "system",
    content:
      "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。"
  }
];

async function chat(prompt) {
  history.push({ role: "user", content: prompt });
  const completion = await client.chat.completions
    .create({
      model: "moonshot-v1-8k",
      messages: history
    })
    .catch((err) => console.log("出错了:\n", err));

  history = history.concat(completion.choices[0].message);
  return completion.choices[0].message.content;
}

async function main() {
  let reply = await chat("写一个JS原型继承的例子");
  console.log("结果:\n", reply);
}

// main();

export const kimiController = async (ctx: Context) => {
  const data = ctx.request.body as { message: string };
  console.log("data", data);
  if (data?.message) {
    const reply = await chat(data.message);
    console.log("结果:\n", reply);
    ctx.body = responseStatus(200, reply);
    return;
  }
  ctx.body = responseStatus(200, "暂无消息");
};
