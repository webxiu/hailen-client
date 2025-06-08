import { UserConfig, defineConfig, loadEnv } from "vite";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import babel from "@rollup/plugin-babel";
import { createHtmlPlugin } from "vite-plugin-html";
import { getPlugins } from "./build/plugins";
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
  if (!args.length) return process.cwd();
  return path.join(process.cwd(), ...args);
};

export default (mode: string, env: Record<string, any>): UserConfig => {
  const isVue = mode === "vue";
  const isReact = mode === "react";
  const { VITE_BASE_API, VITE_BASE_URL, VITE_VUE_PORT, VITE_REACT_PORT, VITE_COMPRESSION } = env;
  const modeConfig = {
    vue: {
      id: "app",
      src: "/src/vue/main.ts",
      input: resolve("src/vue/main.ts"),
      outDir: "dist/vue",
      port: VITE_VUE_PORT
    },
    react: {
      id: "root",
      src: "/src/react/main.tsx",
      input: resolve("src/react/main.tsx"),
      outDir: "dist/react",
      port: VITE_REACT_PORT
    }
  };
  const modeObj = modeConfig[mode as keyof typeof modeConfig];

  return {
    base: "./", // 部署在根目录下 , ./vue/  ./react/ 部署在子目录下
    resolve: {
      alias: {
        "~": JoinCwd(),
        "@": resolve("src")
      },
      extensions: [".js", ".ts", ".tsx", ".jsx"]
    },
    plugins: getPlugins({ isVue, isReact, modeObj, VITE_COMPRESSION }),
    build: {
      outDir: modeObj.outDir,
      rollupOptions: {
        // input: { [mode]: modeObj.input },
      }
    },
    server: {
      port: modeObj.port,
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
      "process.env": JSON.stringify(env)
    }
  };
};
