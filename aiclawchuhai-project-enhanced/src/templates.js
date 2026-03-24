import fs from 'fs';

const escapeHtml = (str = '') => str
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function layout({ site, seoTitle, seoDescription, keywords = [], canonical, body, ldJson = '', ogType = 'website' }) {
  const title = seoTitle || site.seo.title;
  const desc = seoDescription || site.seo.description;
  const keywordText = keywords.join(', ');
  const fullCanonical = canonical.startsWith('http') ? canonical : `${site.site.domain.replace(/\/$/, '')}${canonical}`;
  return `<!doctype html>
<html lang="${site.site.language || 'zh-CN'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}" />
  <meta name="keywords" content="${escapeHtml(keywordText)}" />
  <link rel="canonical" href="${escapeHtml(fullCanonical)}" />
  <meta property="og:type" content="${ogType}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:url" content="${escapeHtml(fullCanonical)}" />
  <meta property="og:site_name" content="${escapeHtml(site.site.name)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(desc)}" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="stylesheet" href="/assets/styles.css" />
  ${ldJson}
</head>
<body>
${header(site)}
${body}
${footer(site)}
<script src="/assets/main.js"></script>
</body>
</html>`;
}

function header(site) {
  return `<header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="/">${escapeHtml(site.site.name)}</a>
      <nav class="nav-links">
        <a href="/#features">功能</a>
        <a href="/#pricing">套餐</a>
        <a href="/#blog">文章</a>
        <a href="/#geo">GEO</a>
        <a href="/admin/">后台</a>
      </nav>
    </div>
  </header>`;
}

function footer(site) {
  const seoLinks = (site.seo.footerLinks || []).map(link => `<a href="${link.url}">${escapeHtml(link.label)}</a>`).join('');
  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <h3>${escapeHtml(site.site.name)}</h3>
        <p>${escapeHtml(site.site.tagline)}</p>
        <div class="cta-row">
          <a class="btn btn-primary" href="${site.site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="btn btn-secondary" href="${site.site.telegram}" target="_blank" rel="noopener">Telegram</a>
          <button class="btn btn-ghost" data-copy-wechat="${escapeHtml(site.site.wechat)}">复制微信</button>
        </div>
      </div>
      <div>
        <h3>重点页面</h3>
        <div class="seo-link-list">${seoLinks}</div>
      </div>
      <div>
        <h3>后台与同步</h3>
        <p>零数据库版后台支持导出 JSON 和 GitHub 一键推送。</p>
        <a class="btn btn-secondary" href="/admin/">打开后台</a>
      </div>
    </div>
    <div class="container footer-bottom">© ${new Date().getFullYear()} ${escapeHtml(site.site.name)} · Built for Cloudflare Pages + GitHub</div>
  </footer>`;
}

function pluginHtml(plugin) {
  if (!plugin?.enabled) return '';
  if (plugin.type === 'links') {
    const links = (plugin.links || []).map(l => `<a href="${l.url}">${escapeHtml(l.label)}</a>`).join('');
    return `<section class="section"><div class="container"><div class="plugin-card"><h2>${escapeHtml(plugin.title || plugin.name)}</h2><div class="seo-link-list">${links}</div></div></div></section>`;
  }
  return `<section class="section"><div class="container"><div class="plugin-card"><h2>${escapeHtml(plugin.title || plugin.name)}</h2>${plugin.bodyHtml || ''}${plugin.ctaText && plugin.ctaLink ? `<div class="cta-row"><a class="btn btn-primary" href="${plugin.ctaLink}" target="_blank" rel="noopener">${escapeHtml(plugin.ctaText)}</a></div>` : ''}</div></div></section>`;
}

export function renderHome(site, posts, geo, plugins) {
  const afterFeatures = plugins.filter(p => p.placement === 'home_after_features').map(pluginHtml).join('');
  const afterPricing = plugins.filter(p => p.placement === 'home_after_pricing').map(pluginHtml).join('');
  const beforeFaq = plugins.filter(p => p.placement === 'home_before_faq').map(pluginHtml).join('');
  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site.site.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: site.seo.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Pricing managed in admin panel' },
    url: site.site.domain
  })}</script>`;
  const body = `<main>
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="eyebrow">${escapeHtml(site.hero.eyebrow)}</span>
          <h1>${escapeHtml(site.hero.title)}</h1>
          <p class="hero-sub">${escapeHtml(site.hero.subtitle)}</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="${site.site.whatsapp}" target="_blank" rel="noopener">${escapeHtml(site.hero.primaryCtaText)}</a>
            <a class="btn btn-secondary" href="${site.site.telegram}" target="_blank" rel="noopener">${escapeHtml(site.hero.secondaryCtaText)}</a>
            <button class="btn btn-ghost" data-copy-wechat="${escapeHtml(site.site.wechat)}">${escapeHtml(site.hero.tertiaryCtaText)}</button>
          </div>
          <div class="badges">${(site.hero.badges || []).map(b => `<span>${escapeHtml(b)}</span>`).join('')}</div>
        </div>
        <div class="card hero-card">
          <h3>你要的不是普通官网，而是搜索增长系统</h3>
          <ul>
            ${site.painPoints.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
          <div class="geo-box">
            <strong>当前架构：</strong>
            <p>静态页面 + JSON CMS + GitHub 同步 + Cloudflare Pages 构建</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section metrics alt">
      <div class="container metric-grid">
        ${site.metrics.map(item => `<div class="metric-card"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join('')}
      </div>
    </section>

    <section class="section" id="features">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">围绕 AI 外贸获客业务重做信息结构</span>
          <h2>首页只讲和你的商品真正相关的增长逻辑</h2>
          <p>根据你上传的资料，内容重心围绕 TikTok 拓客、WhatsApp 拓客、社媒矩阵、AI 广告与 SEO 页面扩张，而不是做成泛展示型企业站。TikTok、WhatsApp、社媒矩阵与 AI 广告能力都已经被整合进页面结构中。fileciteturn0file0 fileciteturn0file1 fileciteturn0file2 fileciteturn0file3</p>
        </div>
        <div class="feature-grid">
          ${site.features.map(f => `<div class="feature-card"><h3>${escapeHtml(f.title)}</h3><p>${escapeHtml(f.desc)}</p><ul>${(f.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`).join('')}
        </div>
      </div>
    </section>

    ${afterFeatures}

    <section class="section alt" id="pricing">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">价格可在后台随时修改</span>
          <h2>价格不写死，管理员自己改</h2>
          <p>你已经明确说过价格你自己在后台设置，所以这里做成可编辑套餐，而不是硬编码价格。</p>
        </div>
        <div class="pricing-grid">
          ${site.pricing.map(p => `<div class="price-card ${p.highlight ? 'is-highlight' : ''}"><h3>${escapeHtml(p.name)}</h3><div class="price">${escapeHtml(p.priceText)}</div><p class="price-note">${escapeHtml(p.billingNote)}</p><ul>${(p.features || []).map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul><div class="cta-row"><a class="btn btn-primary" href="${p.ctaLink}" target="_blank" rel="noopener">${escapeHtml(p.ctaText)}</a></div></div>`).join('')}
        </div>
      </div>
    </section>

    ${afterPricing}

    <section class="section" id="blog">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">自动扩张搜索入口</span>
          <h2>文章页 = 长尾词入口</h2>
          <p>博客用于覆盖问题词、教程词、对比词、平台词，帮助你从搜索引擎和 AI 检索获取更广的入口。</p>
        </div>
        <div class="blog-grid">
          ${posts.slice(0, 6).map(post => `<article class="blog-card"><div class="notice">${escapeHtml(post.heroLabel || '')} · ${escapeHtml(post.updatedAt || '')}</div><h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.excerpt)}</p><a class="text-link" href="/blog/${post.slug}/">查看文章 →</a></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="section alt" id="geo">
      <div class="container split-grid">
        <div>
          <span class="eyebrow">GEO 页面</span>
          <h2>国家页 = 地理搜索入口</h2>
          <p>GEO 页面用于承接国家 / 城市 / 区域词，适合把外贸获客、WhatsApp、TikTok、社媒矩阵等词和不同地区组合成更多可收录页面。</p>
          <div class="seo-link-list">${geo.map(g => `<a href="/geo/${g.slug}/">${escapeHtml(g.title)}</a>`).join('')}</div>
        </div>
        <div class="form-card">
          <h3>${escapeHtml(site.contact.headline)}</h3>
          <p>${escapeHtml(site.contact.text)}</p>
          <form data-chat-form>
            <div class="form-grid">
              <label><span>姓名</span><input name="name" placeholder="Your name" /></label>
              <label><span>公司</span><input name="company" placeholder="Company" /></label>
              <label><span>国家</span><input name="country" placeholder="Target country" /></label>
              <label><span>联系目标</span>
                <div class="card" style="padding:12px;display:flex;gap:12px;flex-wrap:wrap;">
                  <label style="display:flex;align-items:center;gap:8px;"><input type="radio" name="target" value="whatsapp" checked style="width:auto;min-height:auto;" /> WhatsApp</label>
                  <label style="display:flex;align-items:center;gap:8px;"><input type="radio" name="target" value="telegram" style="width:auto;min-height:auto;" /> Telegram</label>
                  <label style="display:flex;align-items:center;gap:8px;"><input type="radio" name="target" value="wechat" style="width:auto;min-height:auto;" /> 微信</label>
                </div>
              </label>
              <label class="full"><span>需求</span><textarea name="need" placeholder="例如：我要做 AI 外贸获客软件官网，重点做 SEO 排名、GEO 页面、引流到 WhatsApp。">${escapeHtml(site.contact.defaultMessage)}</textarea></label>
            </div>
            <div class="cta-row"><button class="btn btn-primary" type="submit">生成咨询消息并跳转</button></div>
          </form>
        </div>
      </div>
    </section>

    ${beforeFaq}

    <section class="section">
      <div class="container faq-wrap">
        <div class="section-head">
          <span class="eyebrow">FAQ</span>
          <h2>你后面最容易问到的问题</h2>
        </div>
        <div class="faq-list">
          ${site.faqs.map(f => `<details class="faq-item"><summary>${escapeHtml(f.q)}</summary><div>${escapeHtml(f.a)}</div></details>`).join('')}
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container banner-inner">
        <div>
          <span class="eyebrow">下一步</span>
          <h2>把站点推到 GitHub，然后让 Cloudflare Pages 自动更新</h2>
          <p>你现在没有服务器数据库，所以这版就是专门为你这个条件定制的：更轻、更稳、更适合快速做排名。</p>
        </div>
        <div class="cta-row">
          <a class="btn btn-primary" href="/admin/">进入后台</a>
          <a class="btn btn-secondary" href="${site.site.telegram}" target="_blank" rel="noopener">Telegram 咨询</a>
        </div>
      </div>
    </section>
  </main>`;
  return layout({ site, seoTitle: site.seo.title, seoDescription: site.seo.description, keywords: site.seo.keywords, canonical: '/', body, ldJson: jsonLd });
}

function articleSidebar(site, posts, geo) {
  return `<aside class="article-sidebar">
    <div class="panel">
      <h3>继续扩张入口</h3>
      <div class="seo-link-list">${posts.slice(0, 4).map(p => `<a href="/blog/${p.slug}/">${escapeHtml(p.title)}</a>`).join('')}</div>
    </div>
    <div class="panel" style="margin-top:16px;">
      <h3>GEO 页面</h3>
      <div class="seo-link-list">${geo.slice(0, 4).map(g => `<a href="/geo/${g.slug}/">${escapeHtml(g.country || g.title)}</a>`).join('')}</div>
    </div>
    <div class="panel" style="margin-top:16px;">
      <h3>直接咨询</h3>
      <div class="cta-row">
        <a class="btn btn-primary" href="${site.site.whatsapp}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn btn-secondary" href="${site.site.telegram}" target="_blank" rel="noopener">Telegram</a>
      </div>
    </div>
  </aside>`;
}

export function renderPostPage(site, post, posts, geo) {
  const ldJson = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: post.title, dateModified: post.updatedAt, description: post.seoDescription || post.excerpt, url: `${site.site.domain}/blog/${post.slug}/` })}</script>`;
  const body = `<main class="article-main"><div class="container article-layout"><article class="article-card"><a class="back-link" href="/">← 返回首页</a><div class="notice">${escapeHtml(post.heroLabel || '文章')} · ${escapeHtml(post.updatedAt || '')}</div><h1>${escapeHtml(post.title)}</h1><p class="article-excerpt">${escapeHtml(post.excerpt)}</p><div class="keyword-list">${(post.keywords || []).map(k => `<span>${escapeHtml(k)}</span>`).join('')}</div><div class="article-content">${post.bodyHtml}</div><div class="geo-box"><strong>下一步动作：</strong><p>把这个关键词扩展成国家页、FAQ 页和专题页，然后统一把咨询导入 WhatsApp / Telegram。</p></div></article>${articleSidebar(site, posts, geo)}</div></main>`;
  return layout({ site, seoTitle: post.seoTitle || post.title, seoDescription: post.seoDescription || post.excerpt, keywords: post.keywords || [], canonical: `/blog/${post.slug}/`, body, ldJson, ogType: 'article' });
}

export function renderGeoPage(site, page, posts, geo) {
  const ldJson = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.seoDescription || page.intro, url: `${site.site.domain}/geo/${page.slug}/` })}</script>`;
  const body = `<main class="article-main"><div class="container article-layout"><article class="article-card"><a class="back-link" href="/">← 返回首页</a><div class="notice">GEO 页面 · ${escapeHtml(page.country || '')} ${page.city ? '· ' + escapeHtml(page.city) : ''}</div><h1>${escapeHtml(page.title)}</h1><p class="article-excerpt">${escapeHtml(page.intro)}</p><div class="keyword-list">${(page.keywords || []).map(k => `<span>${escapeHtml(k)}</span>`).join('')}</div><div class="article-content">${page.bodyHtml}</div><div class="geo-box"><strong>GEO 扩张建议：</strong><p>继续复制到更多国家、城市和平台词，形成更大的页面矩阵。</p></div></article>${articleSidebar(site, posts, geo)}</div></main>`;
  return layout({ site, seoTitle: page.seoTitle || page.title, seoDescription: page.seoDescription || page.intro, keywords: page.keywords || [], canonical: `/geo/${page.slug}/`, body, ldJson });
}

export function render404(site) {
  return layout({ site, seoTitle: 'Page Not Found', seoDescription: 'Page not found', keywords: [], canonical: '/404.html', body: `<main class="article-main"><div class="container"><div class="article-card"><h1>404</h1><p>页面不存在。</p><div class="cta-row"><a class="btn btn-primary" href="/">返回首页</a></div></div></div></main>` });
}
