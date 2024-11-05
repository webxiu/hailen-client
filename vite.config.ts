import { UserConfig, defineConfig } from "vite";

import { createHtmlPlugin } from "vite-plugin-html";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }): UserConfig => {
  const isVue = mode === "vue";
  const isReact = mode === "react";

  const mConfig = {
    vue: {
      input: resolve(__dirname, "src/vue/main.ts"),
      outDir: "dist-vue",
      port: 8500,
      id: "app",
      scriptEntry: "/src/vue/main.ts",
    },
    react: {
      input: resolve(__dirname, "src/react/main.tsx"),
      outDir: "dist-react",
      port: 8600,
      id: "root",
      scriptEntry: "/src/react/main.tsx",
    },
  }[mode as keyof typeof mConfig];

  return {
    base: "./", // 部署在根目录下 , ./vue/  ./react/ 部署在子目录下
    plugins: [
      vue(),
      isReact ? react() : null,
      createHtmlPlugin({
        inject: {
          // 动态控制 script 标签的保留或移除
          tags: [
            {
              tag: "div",
              attrs: { id: mConfig.id },
              injectTo: "body", // 或 'head'
            },
            {
              tag: "script",
              attrs: { type: "module", src: mConfig.scriptEntry },
              injectTo: "body",
            },
          ],
        },
      }),
    ],
    build: {
      outDir: mConfig.outDir,
      rollupOptions: {
        // input: { [mode]: mConfig.input },
      },
    },
    server: {
      port: mConfig.port,
    },
  };
});
