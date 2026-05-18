# Templiq

为 [ZKEACMS](https://www.zkea.net/zkeacms/templates) 设计的模板开发工具，使用 LiquidJS 进行模板渲染和管理。

## 简介

Templiq 是一个专门为 ZKEACMS 内容管理系统开发的模板创建和打包工具。它允许开发者创建可扩展的 Widget 模板，这些模板可以直接安装到 ZKEACMS 中使用。

## 功能特性

- 📝 **模板创建** - 快速创建新的网页组件模板
- 👁️ **实时预览** - 在线预览模板渲染效果
- 📦 **打包上传** - 将模板打包为 `.wgt` 文件并上传到云存储
- 🎨 **多种设计** - 内置多种精美的网页设计模板

## 安装

```bash
npm install
```

## 配置

创建 `.env` 文件（参考 `.env.example`）并配置以下环境变量：

```
PORT=3000
B2_APPLICATION_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_application_key
B2_BUCKET_NAME=your_b2_bucket_name
```

## 使用

### 开发模式

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

### 可用命令

- `npm start` - 启动服务器
- `npm run dev` - 开发模式启动
- `npm run build` - 编译 TypeScript
- `npm test` - 运行测试
- `npm run new` - 创建新的模板
- `npm run pack` - 打包模板
- `npm run upload` - 上传模板

## 项目结构

```
├── src/
│   ├── app.ts           # 主应用文件
│   ├── data/            # 模板数据和 Schema 定义文件
│   ├── designs/         # 设计源文件 (HTML/CSS/JS)
│   ├── public/          # 静态资源
│   ├── templates/       # Liquid 模板文件
│   └── tools/           # 工具脚本
├── output/              # 打包输出目录 (.wgt 文件)
└── package.json
```

## ZKEACMS 模板开发

### 模板结构

每个模板包含三个核心文件：

1. **Liquid 模板** (`src/templates/section-{id}.liquid`) - 模板渲染逻辑
2. **数据文件** (`src/data/section-{id}.json`) - 模板示例数据
3. **Schema 定义** (`src/data/section-{id}.def.json`) - 字段定义

### 支持的字段类型

- `SingleLine` - 单行文本
- `Paragraph` - 段落文本
- `HtmlBox` - HTML 编辑器
- `Address` - 地址字段
- `Checkbox` - 复选框
- `Radio` - 单选框
- `Date` - 日期选择
- `Dropdown` - 下拉选择
- `Email` - 邮箱输入
- `Number` - 数字输入
- `Phone` - 电话输入
- `Media` - 媒体上传
- `Array` - 数组字段

### 打包格式

打包后的 `.wgt` 文件是一个 gzip 压缩的 JSON 包，包含：

- Widget 配置信息
- Liquid 模板文件
- 缩略图图片
- 媒体资源文件

## 技术栈

- Node.js + Express
- TypeScript
- LiquidJS (模板引擎)
- Playwright (截图)
- Sharp (图像处理)
- Backblaze B2 (云存储)

## License

MIT
