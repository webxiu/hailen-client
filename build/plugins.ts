import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import babel from "@rollup/plugin-babel";
import react from "@vitejs/plugin-react";
import { viteBuildInfo } from "./info";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

// import { cdn } from "./cdn";
// import { configCompressPlugin } from "./compress";
// import svgLoader from "vite-svg-loader";
// import legacy from "@vitejs/plugin-legacy";
// import { createHtmlPlugin } from "vite-plugin-html";

/** HTML注入标签元素 */
export function injectHtmlPlugin(options) {
  return {
    name: "vite-inject-html-plugin",
    enforce: "pre",
    transformIndexHtml(html) {
      const { tags } = options.inject;
      tags.forEach((tag) => {
        const { tag: tagName, injectTo, attrs } = tag;
        const attributes = Object.entries(attrs || {})
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ");
        const newTag = `<${tagName} ${attributes}></${tagName}>`;
        if (injectTo === "head") {
          html = html.replace(/<head>/, `<head>${newTag}`);
        } else if (injectTo === "body") {
          html = html.replace(/<body>/, `<body>${newTag}`);
        }
      });
      return html;
    }
  };
}

export function getPlugins({ isVue, isReact, modeObj, VITE_COMPRESSION }) {
  return [
    vue(),
    isVue
      ? vueJsx({
          // 如果需要 Babel 特定功能，可以在这里配置
          optimize: true,
          transformOn: true
        })
      : null,
    isReact ? react() : null,
    injectHtmlPlugin({
      inject: {
        tags: [
          { tag: "div", injectTo: "body", attrs: { id: modeObj.id } },
          { tag: "script", injectTo: "body", attrs: { type: "module", src: modeObj.src } }
        ]
      }
    }),
    viteBuildInfo()
    // 1.svg组件化支持
    // svgLoader()

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
