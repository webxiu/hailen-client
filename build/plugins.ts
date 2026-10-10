import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import ElementPlus from "unplugin-element-plus/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import babel from "@rollup/plugin-babel";
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
        compilerOptions: { isCustomElement: (tag) => ["webview"].includes(tag) }
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
    // 用 vite 原生 transformIndexHtml 注入挂载点与入口脚本(替代 vite-plugin-html:
    // 其 CJS 产物会 require("vite") 触发 CJS 弃用警告, 本项目仅用到其注入功能)
    // 必须用对象形式 + order: "pre": 函数形式的钩子一律归入 normalHooks,
    // 而 build 时 normalHooks 在 generateBundle(入口 script 提取之后)才执行,
    // 注入的入口脚本不会参与提取, 产物只剩一个空 index.html;
    // order: "pre" 使注入发生在 transform 阶段提取入口之前(dev 下亦先于 devHtmlHook)
    {
      name: "html-inject",
      transformIndexHtml: {
        order: "pre",
        handler: (html: string) =>
          html.replace(
            /<\/body>/i,
            `\n    <div id="${modeObj.id}"></div>\n    <script type="module" src="${modeObj.src}"></script>\n  </body>`
          )
      }
    },
    viteBuildInfo(),
    // 1.svg组件化支持
    // svgLoader()
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/vue/assets/icons")], // 你的 SVG 目录
      symbolId: "icon-[name]" // 支持目录层级: icon-[dir]-[name]
    }),

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

    {
      // 让 Vite 忽略 .node 文件，交给 Electron 的 Node 环境处理
      name: "node-loader",
      transform(code, id) {
        if (id.endsWith(".node")) {
          return `
            import { createRequire } from 'module';
            const require = createRequire(import.meta.url);
            export default require(${JSON.stringify(id)});
          `;
        }
      }
    }
  ];
}
