import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import babel from "@rollup/plugin-babel";
import createHtmlPlugin from "vite-plugin-html";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";
import react from "@vitejs/plugin-react";
import svgLoader from "vite-svg-loader";
import { viteBuildInfo } from "./info";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// import { cdn } from "./cdn";
// import { configCompressPlugin } from "./compress";

// import legacy from "@vitejs/plugin-legacy";

export function getPlugins({ isVue, isReact, modeObj, VITE_COMPRESSION }) {
  return [
    vue({
      template: {
        // 将 webview 视为原生自定义元素
        compilerOptions: { isCustomElement: (tag) =>["webview"].includes(tag) }
      }
    }),
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
        tags: [
          { tag: "div", injectTo: "body", attrs: { id: modeObj.id } },
          { tag: "script", injectTo: "body", attrs: { type: "module", src: modeObj.src } }
        ]
      }
    }),
    viteBuildInfo(),
    // 1.svg组件化支持
    // svgLoader()
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/vue/assets/icons")], // 你的 SVG 目录
      symbolId: "icon-[name]" // 支持目录层级: icon-[dir]-[name]
    })

    // 2.代码压缩
    // configCompressPlugin(VITE_COMPRESSION)

    // 3.打包报错
    // babel({
    //   babelHelpers: "bundled",
    //   presets: ["@babel/preset-env", "@vue/babel-preset-jsx", "@babel/preset-typescript"]
    // })

    // 4.mock支持
    // viteMockServe({
    //   mockPath: "mock",
    //   localEnabled: command === "serve",
    //   prodEnabled: command !== "serve" && prodMock,
    //   injectCode: `
    //       import { setupProdMockServer } from './mockProdServer';
    //       setupProdMockServer();
    //     `,
    //   logger: false
    // }),

    // 5.兼容处理(代码降级)
    // legacy({
    //   targets: ["Chrome 47"],
    //   modernPolyfills: true
    // })
  ];
}
