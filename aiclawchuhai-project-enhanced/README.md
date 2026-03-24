# AICL 增强版（Cloudflare Pages + GitHub，零数据库）

这是按你的新要求重做的增强版：

- **不使用服务器类型数据库**
- **只适配 Cloudflare Pages + GitHub**
- 静态 SEO / GEO 落地页
- 后台可管理：站点、价格、文章、GEO 页面、插件、手动 CRM
- 后台支持：
  - 导出 all-content.json
  - 下载 content/*.json
  - **直接推送到 GitHub 仓库**（浏览器里填 GitHub Token）
- Cloudflare Pages 每次从 GitHub 构建，自动更新页面

## 为什么这个版本更适合你现在

你明确说了：

- 不要 D1 / 服务器数据库
- 主要目标是官网搜索排名
- 卖的是 **AI 外贸获客软件**
- 需要 SEO 自动优化、文章内容、GEO 页面、外链、后台改价格

所以这个版本的核心不是“炫后台”，而是：

1. **让页面可收录**
2. **让内容可扩张**
3. **让后台能自己改内容**
4. **让修改能直接进 GitHub，再由 Cloudflare Pages 自动部署**

## 项目结构

- `content/` 内容源（后台最终同步的核心目录）
- `public/` 静态资源与后台页面
- `src/` HTML 模板
- `scripts/build.mjs` 静态构建脚本
- `dist/` 构建结果（可直接部署到 Pages）

## 本地构建

```bash
npm install
npm run build
```

Cloudflare Pages 推荐配置：

- Build command: `npm run build`
- Build output directory: `dist`

## 后台怎么工作

访问：

- `/admin/`

默认后台口令：

- `change-me-2026!`

> 登录后请立刻改掉。注意：这是静态站点版的轻量保护，不是严肃身份系统。真正的写权限来自 GitHub Token。

### 后台可做的事

- 改首页文案和 SEO
- 改价格
- 改博客文章
- 改 GEO 国家页
- 上传 JSON 内容插件
- 管理手动 CRM 看板
- 导出全量 JSON
- 推送 content/*.json 到 GitHub

## GitHub 一键推送的逻辑

在后台填：

- owner
- repo
- branch
- content path（默认 `content`）
- GitHub token

然后点击“一键推送到 GitHub”。

它会更新：

- `content/site.json`
- `content/posts.json`
- `content/geo.json`
- `content/plugins.json`

Cloudflare Pages 监听仓库更新后会自动重新部署。

## 重要限制（必须看）

这个版本为了满足“零数据库”约束，做了这些取舍：

### 1. 没有公开表单自动入库

因为如果前台访客提交表单要入库，你就需要数据库、KV、第三方表单服务或后端 API。

当前版本改成：

- 生成咨询消息
- 直接跳 WhatsApp / Telegram
- 或复制到微信

这更适合你当前阶段先冲转化和排名。

### 2. CRM 是手动版

后台 CRM 看板用于：

- 手动录入
- 手动跟进
- 导出/同步

如果你以后需要“前台表单自动进 CRM”，下一阶段再接 Cloudflare Workers / KV / 第三方表单工具。

### 3. 插件不是任意执行 JS

为了安全和稳定，这里的插件是 **SEO 内容插件**：

- rich-text
- links
- CTA 区
- 自定义模块

这样更适合落地页扩张，不会把页面结构搞坏。

## 适配你的业务重点

这个站点的内容结构已经围绕你给的资料重组：

- TikTok 拓客
- WhatsApp 拓客
- 社媒 AI 矩阵
- AI 广告
- 全渠道聚合拓客

这些方向都来自你上传的资料。fileciteturn0file0 fileciteturn0file1 fileciteturn0file2 fileciteturn0file3 fileciteturn0file4

## 下一阶段还能继续升级什么

如果你后面要继续升级，我建议加：

- Cloudflare Workers + KV 做自动线索入库
- 批量关键词页自动生成器
- 行业页生成器
- 国家 + 城市双层 GEO
- 更强的 GitHub 批量文件生成
- 自动 FAQ 扩写
- 更强内链图谱
