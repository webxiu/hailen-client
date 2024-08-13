import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "./dist", // 输出目录
    assetsDir: "assets", // 静态资源目录
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "./index.html"),
        preload: resolve(__dirname, "src/Main/preload.ts"),
        main: resolve(__dirname, "src/Main/index.ts"),
      },
      external: ["electron", "fs", "os", "path", "url"],
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "preload") {
            return "preload.cjs"; // 为特殊文件自定义名称
          }
          return "[name].js"; // 其他文件使用默认名称
        },
        globals: {
          electron: "electron",
          fs: "fs",
          os: "os",
          path: "path",
          url: "url",
        },
      },
    },
  },
  server: {
    port: 3000,
  },
});
