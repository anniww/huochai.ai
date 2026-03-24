# Cloudflare Pages 部署步骤（零数据库版）

## 1. 上传到 GitHub
把整个项目上传到你的 GitHub 仓库。

## 2. 在 Cloudflare Pages 创建项目
连接你的 GitHub 仓库。

## 3. Build 设置
- Build command: `npm run build`
- Build output directory: `dist`

## 4. 部署成功后访问
- 前台：`/`
- 后台：`/admin/`

## 5. 后台首次登录
默认口令：

- `change-me-2026!`

登录后请立刻修改。

## 6. GitHub 一键同步（推荐）
在后台填：

- owner
- repo
- branch
- content path（默认 `content`）
- GitHub token

然后点“推送到 GitHub”。

### Token 权限建议
需要能写入仓库内容（Contents: Read and Write）。

## 7. 如果你不想填 Token
可以直接：

- 导出 `all-content.json`
- 或下载 `content/*.json`
- 手动覆盖仓库里的 `content/` 目录
- 提交到 GitHub

Cloudflare Pages 会自动重新部署。
