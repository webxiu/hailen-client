# 海阔天空 · WORK 办公系统（Electron 客户端）

一套基于 **Electron + Vue 3 + 内置 Koa 服务 + SQLite** 的桌面办公系统。应用把后台服务打包进客户端进程内，安装后无需额外部署服务端，断网环境下也能登录和使用本地数据。

- 应用名：`海阔天空`
- 包名：`hailen-client`，版本见 `package.json`
- 应用 ID：`com.hailen-client`

---

## 一、功能

### 1. 主框架

- 单窗口 + 系统托盘，关闭窗口不退出（macOS 保留在 Dock），托盘左键唤起主窗口
- 动态路由：登录后按后端下发的菜单渲染页面，菜单由后端 `menu` 表维护
- 主题、暗色模式、标签页（多页签）等基础布局能力

### 2. 工作台

- 首页仪表盘（`src/vue/views/home/dashboard`）

### 3. AI 聚合（webAI）

- 多个 AI 网页（DeepSeek / 通义千问 / 文心一言 / 智谱清言 / 豆包等）并排内嵌为 `webview`
- 顶部按钮控制每个页面显示/隐藏，拖拽分隔条调整栏宽，宽度和显隐状态持久化到 `localStorage`
- 底部公共输入框：**回车一次，同时把同一段文字发送到所有显示中的 AI 页面**
  - 写入走 Electron 真实输入管线（Slate 等富文本编辑器只认这条）
  - 写入后延时再回车，避免「只填不发」；回车后校验输入框是否清空，未清空则补一次合成回车
- 每个页面标题右侧有清理按钮，可**按页面所属域名**清理 Cookie 或 Storage，不影响其他页面
- 右键页面标题可修改标题和地址

### 4. 工具集（`src/vue/views/home/tool`）

| 模块 | 说明 |
| --- | --- |
| `SyncPlayer` | 同步播放器 |
| `canvas` | 画布 |
| `drawTools` | 绘图工具 |
| `editor` | 编辑器（Monaco） |
| `formatConversion` | 格式转换 |
| `hiprint` | 打印设计 |
| `json2ts` | JSON 转 TypeScript 类型 |
| `kimi` | Kimi 对话 |
| `map` | 地图（天地图 + AG Grid） |
| `screenRecord` | 屏幕录制 |
| `transform` | 数据转换 |

### 5. 系统管理（`src/vue/views/system`）

- 用户管理、菜单管理
- 登录 / 注册 / 权限校验，未登录跳转登录页

### 6. 其他

- 指令模块（`src/vue/views/home/command`，区分 macOS / Windows）
- 403 / 404 页面

---

## 二、技术栈

| 分类 | 选型 |
| --- | --- |
| 桌面容器 | Electron 44、electron-builder 26 |
| 渲染端 | Vue 3.5 + Element Plus + Vue Router 4 + Pinia（另有 React 18 + Ant Design 渲染端，可选） |
| 构建 | Vite、TypeScript、electron-cli-service（自研命令行） |
| 后台服务 | Koa、koa-router、koa-bodyparser、koa-static、jsonwebtoken、bcryptjs |
| 数据库 | SQLite（sqlite3） |
| 其他 | axios、AG Grid、Monaco Editor、xlsx / exceljs、ws |

---

## 三、目录结构

```
hailen-client
├── build/                  # Vite 构建插件（CDN 替换、压缩、优化、构建信息）
├── public/                 # 静态资源（favicon 等），打包时解包到 app.asar.unpacked
├── scripts/
│   ├── command.js          # start / build / kill 实现，含版本号自动递增
│   └── config.js           # 主进程启动配置（本地服务地址、磁盘目录）
├── source/                 # 外部资源与数据，打包时作为 extraFiles 复制到安装目录
│   ├── database/           # SQLite 数据库文件
│   ├── ffmpeg/             # 音视频处理二进制
│   ├── language/           # 语言资源
│   └── ...
├── src/
│   ├── Main/               # 主进程
│   │   ├── index.ts        # 入口：单例锁、挂载全局
│   │   ├── client/         # 窗口、托盘、IPC、preload、koa 启动、appInfo
│   │   ├── server/         # 内嵌 Koa 服务：路由、控制器、中间件、数据库
│   │   └── utils/
│   ├── vue/                # Vue 渲染端
│   │   ├── views/          # 页面（按目录自动生成菜单与路由）
│   │   ├── router/         # 动态路由
│   │   ├── store/          # Pinia
│   │   ├── api/            # 接口
│   │   └── utils/http/     # axios 封装
│   ├── react/              # React 渲染端
│   └── lib/
├── typings/                # 全局类型（$$ 全局对象、window.electronAPI 等）
├── electron-cli-service    # 命令行入口（node electron-cli-service <命令>）
├── vite.com.ts             # Vue / React 共用的 Vite 配置
├── tsconfig.app.json       # 渲染端 TS 配置
├── tsconfig.main.json      # 主进程 TS 配置
└── package.json            # 依赖 + electron-builder 打包配置
```

---

## 四、环境要求

- **Node.js >= 22.12**（推荐 24 LTS）
  > electron-builder 26 依赖纯 ESM 的 `@noble/hashes` 2.x，而它自身产物是 CommonJS。Node 22.12 之前不支持 `require()` 加载 ESM，打包会报 `ERR_REQUIRE_ESM`。
- **yarn**（仓库使用 `yarn.lock`）

```bash
# 安装依赖
yarn
```

---

## 五、开发与打包

### 1. 命令

| 命令 | 作用 |
| --- | --- |
| `yarn start` | 开发模式：Vite dev（Vue + React）+ 主进程 tsc watch + 启动 Electron |
| `yarn start:vue` | 只启动 Vue 渲染端 |
| `yarn start:react` | 只启动 React 渲染端 |
| `yarn build` | 打包：编译主进程 → 构建渲染端 → 版本号 +1 → electron-builder |
| `yarn build:vue` | 只构建 Vue 渲染端后打包 |
| `yarn build:react` | 只构建 React 渲染端后打包 |
| `yarn kill` | 结束残留的 Electron 进程 |
| `yarn lint` | ESLint 检查（提交前建议执行） |

底层入口是 `electron-cli-service`，也可以直接调用：

```bash
node electron-cli-service start --vue
node electron-cli-service build --publish -- --x64
```

### 2. 打包流程（`scripts/command.js`）

1. `tsc -p tsconfig.main.json` 编译主进程到 `dist/`
2. 清空 `dist/vue`、`dist/react`，分别执行 Vite 构建
3. 清空 `output/`
4. **版本号自动递增**：末位 +1，满 10 进位为次版本（`1.0.9 → 1.1.0`、`1.2.9 → 1.3.0`），写回 `package.json`
5. 执行 `electron-builder --win / --mac / --linux`（按当前系统自动选择）
6. 打包失败时自动回滚版本号

### 3. 产物路径

全部输出到项目根目录的 `output/`：

| 平台 | 产物 |
| --- | --- |
| macOS | `海阔天空.app`、`海阔天空-<version>.dmg`、`海阔天空-<version>-mac.zip` |
| Windows | NSIS 安装包（可改安装目录、中文界面）、`zip` 免安装包 |
| Linux | `deb` |

### 4. 安装后的目录结构（macOS）

```
海阔天空.app/Contents/
├── MacOS/海阔天空                        # 可执行文件
├── Resources/
│   ├── app.asar                          # 应用代码（dist、node_modules 等）
│   └── app.asar.unpacked/                # asarUnpack 内容
│       ├── public/                       # 静态资源
│       └── node_modules/sqlite3/         # SQLite 原生模块
└── source/                               # extraFiles：外部资源与数据库
    └── database/database.db
```

Windows 为安装目录下的 `resources/`（asar）与 `source/`（外部资源）。

### 5. 路径约定（重要）

打包后 `process.cwd()` 不可靠（macOS 从 Finder 启动时是 `/`）。主进程里取路径请使用：

| 场景 | 用法 |
| --- | --- |
| 可执行文件所在目录 | `path.dirname(process.execPath)` |
| 应用资源根目录 | `process.resourcesPath`（macOS 为 `Contents/Resources`） |
| asar 内的代码 | `__dirname`、`app.getAppPath()` |
| 需要可写的用户数据 | `app.getPath("userData")` |

> 数据库、`source` 等随安装包分发的文件，都是相对**可执行文件目录**定位的。

---

## 六、配置

### 1. 环境变量

开发：`.env.development`

```ini
VITE_VUE_PORT = 8050                     # Vue 开发端口
VITE_REACT_PORT = 8060                   # React 开发端口
VITE_BASE_API = '/api'                   # 前端请求前缀，开发时经 Vite proxy 转发
```

生产：`.env.production`

```ini
VITE_PUBLIC_PATH = ./                    # 资源相对路径（打包后为 file:// 加载）
VITE_VUE_PORT = 7050
VITE_REACT_PORT = 7060
VITE_BASE_API = 'http://127.0.0.1:3080'  # 打包后直连本地服务
VITE_ROUTER_HISTORY = "hash"             # hash / h5
VITE_CDN = false                         # 是否用 CDN 替换本地库
VITE_COMPRESSION = "none"                # gzip / brotli / both / none
VITE_KIMI_API_KEY = '...'                # Kimi API Key（请替换为自己的，勿提交真实密钥）
```

开发模式下 Vite 会按 `VITE_BASE_API` 配置代理，转发到本地 Koa 服务。

### 2. 主进程启动配置（`scripts/config.js`）

```js
const startOption = {
  host: "http://127.0.0.1:3080", // 本地服务地址，前端与菜单初始化都用它
  diskPath: JoinCwd("source"),
  nodemon: true                  // 主进程改动自动重启
};
```

### 3. Electron Builder 配置（`package.json` 的 `build` 字段）

| 配置 | 值 | 说明 |
| --- | --- | --- |
| `asar` | `true` | 代码打进 asar |
| `asarUnpack` | `["public", "node_modules/@spk"]` | 需要以真实文件存在的资源（sqlite3 等原生模块由 builder 自动解包） |
| `files` | `dist / public / index.js / source / scripts/config.js` | 打进 asar 的文件 |
| `extraFiles` | `["source"]` | 复制到安装目录（macOS 为 `Contents/source`） |
| `directories.output` | `output` | 产物目录 |

---

## 七、后台服务（内嵌 Koa）

- 启动：`src/Main/client/koaServer.ts`，在 `app.whenReady()` 之后调用
- 实现：`src/Main/server/app.ts`
- 监听：`http://127.0.0.1:3080`（端口来自 `scripts/config.js` 的 `host`）
- 中间件顺序：静态资源 → `bodyParser` → 日志 → Token 校验 → CORS → 业务路由

### 接口一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/user/login` | 登录 |
| POST | `/user/register` | 注册 |
| GET | `/user/list` | 用户列表 |
| POST | `/system/menu/create` | 创建菜单（开发模式自动调用） |
| GET | `/system/menu/list` | 菜单列表 |
| POST | `/system/menu/update` | 更新菜单 |
| GET | `/home/dashboard` | 工作台数据 |
| — | `/static/*` | 上传文件静态目录 |

### 鉴权

- JWT，密钥与有效期见 `src/Main/server/config/constant.ts`
- 白名单：`/static`、`/user/login`、`/user/register`、`/system/menu/create`

### 菜单与路由

- 开发模式启动时，`koaServer` 会扫描 `src/vue/views` 生成菜单并 POST 到 `/system/menu/create` 入库
- 页面目录里的 `_dir.json` 提供 `title` / `icon` / `sort`，例如：

  ```json
  { "title": "工作台", "icon": "HomeFilled", "sort": 0 }
  ```

- 前端按后端菜单地址匹配 `src/vue/views` 下的组件（`index.vue` 或同名 `.vue`），路由模式由 `VITE_ROUTER_HISTORY` 决定

---

## 八、数据库

- 类型：SQLite（`sqlite3`）
- 位置：
  - 开发：`source/database/database.db`
  - 打包后：macOS `Contents/source/database/database.db`，Windows `<安装目录>/source/database/database.db`
- 路径基于 **可执行文件所在目录**（`path.dirname(process.execPath)`），不使用 `process.cwd()`
- 首次启动自动建表（`Database.init()`），实例为单例
- 数据库文件随安装包分发（`extraFiles: ["source"]`），已有数据会保留

> 注意：如果把数据库放在 `.app` 包内，非安装者本人运行时可能没有写权限。需要多用户/只读安装环境时，建议改为首次启动把 `database.db` 复制到 `app.getPath("userData")` 下再使用。

---

## 九、常见问题

### 1. 打包报 `ERR_REQUIRE_ESM: require() of ES Module .../@noble/hashes/blake2.js`

electron-builder 26 的依赖 `@noble/hashes` 2.x 是纯 ESM，而当前 Node 不支持 `require()` 加载 ESM。

```bash
# 方案一（推荐）：升级 Node >= 22.12
node -v

# 方案二：打包时开启实验特性
NODE_OPTIONS=--experimental-require-module yarn build
```

### 2. 安装后白屏（界面出不来）

自定义 `protocol.handle("file")` 会覆盖 Electron 内置的 `file` 协议，导致 asar 内的页面资源读不到。**不要重写 `file` 协议**，`mainWindow.loadFile()` 原生支持 asar。

（`net.fetch` 默认会再次命中自定义协议 handler，加不加 `bypassCustomProtocolHandlers` 都无法让 asar 正常加载。）

### 3. 登录接口超时

本地服务没起来，或数据库路径不对。排查：

```bash
# 服务有没有监听
lsof -nP -iTCP:3080 -sTCP:LISTEN

# 接口通不通
curl -i -m 5 -X POST http://127.0.0.1:3080/user/login \
  -H 'Content-Type: application/json' -d '{"username":"x","password":"x"}'
```

- 无监听：查看主进程日志里的 `koa 服务启动失败` / `koa 服务监听失败`（端口被残留进程占用）
- 有监听但请求失败：检查数据库路径是否存在且可写

### 4. 打包报 `EPERM: operation not permitted, unlink ...node_sqlite3.node`

sqlite3 原生模块被占用（开发服务还开着）。

```bash
yarn kill        # 结束残留 Electron 进程
yarn add sqlite3 # 重新安装
```

### 5. 端口 3080 被占用

上一次进程未完全退出，或本机有其他服务占用：

```bash
lsof -nP -iTCP:3080 -sTCP:LISTEN
yarn kill
```

---

## 十、Git 提交规范

- `feat` 增加新的业务功能
- `fix` 修复业务问题 / BUG
- `perf` 优化性能
- `style` 更改代码风格，不影响运行结果
- `refactor` 重构代码
- `revert` 撤销更改
- `test` 测试相关，不涉及业务代码的更改
- `docs` 文档和注释相关
- `chore` 更新依赖 / 修改脚手架配置等琐事
- `workflow` 工作流改进
- `ci` 持续集成相关
- `types` 类型定义文件更改
- `wip` 开发中
