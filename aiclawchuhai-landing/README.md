# AIClaw 出海 Landing Page

静态落地页，适合部署到 Cloudflare Pages。

## 文件结构

- `index.html`：页面主文件
- `styles.css`：样式
- `app.js`：复制微信号等交互
- `robots.txt`：搜索爬虫规则
- `sitemap.xml`：站点地图
- `_headers`：Cloudflare Pages 响应头配置

## 部署到 Cloudflare Pages

1. 新建 GitHub 仓库并上传全部文件。
2. 在 Cloudflare Pages 中选择 **Connect to Git**。
3. 连接 GitHub 仓库。
4. 该项目是静态 HTML：
   - Build command: 留空
   - Build output directory: `/`
5. 首次部署完成后，给 Pages 项目绑定 `aiclawchuhai.shop`。

## 上线前建议

- 把 `logo.png` 与 `og-cover.jpg` 上传到仓库根目录。
- 根据业务继续扩展行业页、案例页、博客页，强化 SEO / GEO。
- 在 Google Search Console 和 Bing Webmaster Tools 提交 `sitemap.xml`。
