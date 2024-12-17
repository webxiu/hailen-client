import { UserConfig, defineConfig, loadEnv } from "vite";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import babel from "@rollup/plugin-babel";
import { createHtmlPlugin } from "vite-plugin-html";
import path from "path";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

/** 当前执行node命令时文件夹的地址（工作目录） */
const root: string = process.cwd();

function resolve(dir: string) {
  return path.resolve(__dirname, dir);
}

const JoinCwd = (...args) => {
  if (!args.length) {
    return process.cwd();
  }
  return path.join(process.cwd(), ...args);
};

export default defineConfig(({ mode }): UserConfig => {
  const isVue = mode === "vue";
  const isReact = mode === "react";
  const { VITE_BASE_API, VITE_BASE_URL, VITE_VUE_PORT, VITE_REACT_PORT } = process.env;

  const projectConf = {
    vue: {
      input: resolve("src/vue/main.ts"),
      outDir: "dist/vue",
      port: VITE_VUE_PORT,
      id: "app",
      scriptEntry: "/src/vue/main.ts"
    },
    react: {
      input: resolve("src/react/main.tsx"),
      outDir: "dist/react",
      port: VITE_REACT_PORT,
      id: "root",
      scriptEntry: "/src/react/main.tsx"
    }
  }[mode as keyof typeof projectConf];

  return {
    base: "./", // 部署在根目录下 , ./vue/  ./react/ 部署在子目录下
    resolve: {
      alias: {
        "@": resolve("src"),
        "~": JoinCwd("./")
      },
      extensions: [".js", ".ts", ".tsx", ".jsx"]
    },
    plugins: [
      vue(),
      isVue
        ? vueJsx({
            // 如果需要 Babel 特定功能，可以在这里配置
            optimize: true,
            transformOn: true
          })
        : null,
      isReact ? react() : null,
      createHtmlPlugin({
        inject: {
          // 动态控制 script 标签的保留或移除
          tags: [
            {
              tag: "div",
              attrs: { id: projectConf.id },
              injectTo: "body" // 或 'head'
            },
            {
              tag: "script",
              attrs: { type: "module", src: projectConf.scriptEntry },
              injectTo: "body"
            }
          ]
        }
      })
      // 打包报错
      // babel({
      //   babelHelpers: "bundled",
      //   presets: ["@babel/preset-env", "@vue/babel-preset-jsx", "@babel/preset-typescript"]
      // })
    ],
    build: {
      outDir: projectConf.outDir,
      rollupOptions: {
        // input: { [mode]: projectConf.input },
      }
    },
    server: {
      port: projectConf.port,
      host: "0.0.0.0",
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        [VITE_BASE_API]: {
          target: VITE_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(VITE_BASE_API, "")
        }
      }
    },
    define: {
      "process.env": JSON.stringify(envInfo)
    }
  };
});
