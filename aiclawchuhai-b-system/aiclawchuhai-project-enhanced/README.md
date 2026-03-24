# AI 出海获客 B System

这是半自动长期运营版本，核心不是纯手工，也不是全自动垃圾站，而是：
- 高保真前端 UI
- 平台页 / 方案页 / 场景页 / 资源中心
- 静态后台
- B 系统生成器
- Cloudflare Pages + GitHub 友好

## 长期运营推荐流程
1. 在 `/admin/generator.html` 维护种子词、国家、语言和数量
2. 导出配置 JSON
3. 用脚本扩展更多页面
4. 提交 GitHub
5. Cloudflare 自动部署

## Cloudflare 配置
- Framework preset: None
- Build command: 留空
- Build output directory: public
- Root directory: aiclawchuhai-project-enhanced