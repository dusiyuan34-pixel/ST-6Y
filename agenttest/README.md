# 思T-6 图像生成系统使用指南

## 快速开始

### 1. 配置 API 密钥

编辑 `.env.local` 文件，替换以下内容：

```env
API_KEY=你的实际API密钥
```

### 2. 安装依赖（如果需要）

```bash
npm install
```

### 3. 启动服务器

```bash
npm start
```

或者双击 `启动.bat` 文件

### 4. 访问应用

在浏览器中打开：
- http://localhost:3000/create.html （图像生成页面）

## 功能特性

### 图像生成
- ✅ 使用 GPT Image 2 API 生成高质量图像
- ✅ 支持多种宽高比：1:1, 16:9, 9:16, 4:3
- ✅ 实时任务状态显示
- ✅ 生成历史记录
- ✅ 一键重新生成

### 提示词标签
系统提供了快捷提示词标签：
- futuristic city
- organic architecture
- minimalist design
- cyberpunk style

点击标签可以快速添加到当前提示词中。

### 示例提示词
页面提供了三个示例提示词：
- Japanese Garden
- Cyberpunk City
- Abstract Art

点击即可直接生成对应图像。

## 环境变量配置

`.env.local` 文件包含以下配置项：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `API_BASE_URL` | API 基础地址 | https://api.kie.ai/api/v1 |
| `API_KEY` | 你的 API 密钥 | - |
| `MODEL_NAME` | 模型名称 | gpt-image-2-text-to-image |
| `DEFAULT_ASPECT_RATIO` | 默认宽高比 | auto |
| `MAX_POLLING_ATTEMPTS` | 最大轮询次数 | 60 |
| `POLLING_INTERVAL` | 轮询间隔（毫秒） | 2000 |
| `PORT` | 服务器端口 | 3000 |

## 获取 API 密钥

1. 访问 [kie.ai 文档](https://docs.kie.ai)
2. 注册账号并获取 API 密钥
3. 将密钥填入 `.env.local` 文件

## API 端点

### 获取配置
```
GET /api/config
```

### 创建图像生成任务
```
POST /api/generate
Body: { "prompt": "...", "aspectRatio": "auto" }
```

### 查询任务状态
```
GET /api/query?taskId=xxx
```

## 故障排除

### 服务器未启动
- 检查是否在正确的目录
- 检查端口 3000 是否被占用
- 查看服务器日志中的错误信息

### API 密钥未配置
- 确保 `.env.local` 文件中 `API_KEY` 已正确填写
- 不要保留默认值 `your_api_key_here`

### 图像生成失败
- 检查 API 余额是否充足
- 确认提示词是否符合 API 要求
- 查看浏览器控制台的错误信息

### CORS 错误
- 确保通过服务器访问（http://localhost:3000）
- 不要直接打开 HTML 文件

## 技术架构

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │ ---> │ Express Server│ ---> │  kie.ai API │
│  (Frontend) │ <--- │  (Backend)   │ <--- │   (GPT)    │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                     ┌──────┴──────┐
                     │  .env.local │
                     │  (Config)   │
                     └─────────────┘
```

## 注意事项

- ⚠️ 请勿将 `.env.local` 文件提交到代码仓库
- ⚠️ API 密钥应该保密，不要在前端代码中暴露
- ⚠️ 图像生成可能需要几秒钟时间，请耐心等待
- ⚠️ 确保服务器稳定运行后再进行图像生成

## 许可证

MIT License
