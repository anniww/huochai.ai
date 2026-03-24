const STORAGE_KEY = 'aicl_admin_state_v2';
const GH_KEY = 'aicl_github_cfg_v2';
const AUTH_KEY = 'aicl_admin_authed';
const $ = (id) => document.getElementById(id);
const state = { data: null, gh: null };

function toast(msg) {
  const div = document.createElement('div');
  div.className = 'toast';
  div.textContent = msg;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 2600);
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function loadData() {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    state.data = JSON.parse(cached);
  } else {
    const [site, posts, geo, plugins] = await Promise.all([
      fetch('/content/site.json').then(r => r.json()),
      fetch('/content/posts.json').then(r => r.json()),
      fetch('/content/geo.json').then(r => r.json()),
      fetch('/content/plugins.json').then(r => r.json())
    ]);
    state.data = { site, posts, geo, plugins };
    persist();
  }
  state.gh = JSON.parse(localStorage.getItem(GH_KEY) || 'null') || {
    owner: state.data.site.site.repo.owner || '',
    repo: state.data.site.site.repo.name || '',
    branch: state.data.site.site.repo.branch || 'main',
    contentPath: state.data.site.site.repo.contentPath || 'content',
    token: ''
  };
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function jsonDownload(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setupTabs() {
  const tabs = [
    ['site', '站点'], ['pricing', '套餐'], ['posts', '文章'], ['geo', 'GEO'], ['plugins', '插件'], ['crm', 'CRM'], ['github', 'GitHub']
  ];
  $('tabs').innerHTML = tabs.map(([key, label], idx) => `<button class="tab-btn ${idx === 0 ? 'is-active' : ''}" data-key="${key}">${label}</button>`).join('');
  $('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.toggle('is-active', el === btn));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('is-active', panel.dataset.tab === btn.dataset.key));
  });
}

function fillSite() {
  const { site, seo, hero, manualCrm } = state.data.site;
  $('site_name').value = site.name || '';
  $('site_tagline').value = site.tagline || '';
  $('site_domain').value = site.domain || '';
  $('site_language').value = site.language || '';
  $('site_telegram').value = site.telegram || '';
  $('site_whatsapp').value = site.whatsapp || '';
  $('site_wechat').value = site.wechat || '';
  $('seo_title').value = seo.title || '';
  $('seo_description').value = seo.description || '';
  $('seo_keywords').value = (seo.keywords || []).join(', ');
  $('hero_eyebrow').value = hero.eyebrow || '';
  $('hero_title').value = hero.title || '';
  $('hero_subtitle').value = hero.subtitle || '';
  $('hero_badges').value = (hero.badges || []).join('\n');
  $('lead_status').innerHTML = (manualCrm.columns || []).map(c => `<option value="${c}">${c}</option>`).join('');
}

function fillGithub() {
  $('gh_owner').value = state.gh.owner || '';
  $('gh_repo').value = state.gh.repo || '';
  $('gh_branch').value = state.gh.branch || 'main';
  $('gh_contentPath').value = state.gh.contentPath || 'content';
  $('gh_token').value = state.gh.token || '';
}

function renderPricing() {
  $('pricingList').innerHTML = state.data.site.pricing.map((p, index) => `
    <div class="plugin-card">
      <h4>${p.name}</h4>
      <div class="notice">${p.priceText} · ${p.billingNote}</div>
      <div class="admin-actions">
        <button class="btn btn-secondary" onclick="window.editPlan(${index})">编辑</button>
        <button class="btn btn-ghost" onclick="window.removePlan(${index})">删除</button>
      </div>
    </div>
  `).join('');
}
window.editPlan = (index) => {
  const p = state.data.site.pricing[index];
  $('plan_index').value = index;
  $('plan_slug').value = p.slug || '';
  $('plan_name').value = p.name || '';
  $('plan_priceText').value = p.priceText || '';
  $('plan_billingNote').value = p.billingNote || '';
  $('plan_features').value = (p.features || []).join('\n');
  $('plan_ctaText').value = p.ctaText || '';
  $('plan_ctaLink').value = p.ctaLink || '';
  $('plan_highlight').value = String(!!p.highlight);
};
window.removePlan = (index) => {
  if (!confirm('删除这个套餐？')) return;
  state.data.site.pricing.splice(index, 1); persist(); renderPricing(); toast('已删除套餐');
};

function resetPlanForm() { ['plan_index','plan_slug','plan_name','plan_priceText','plan_billingNote','plan_features','plan_ctaText','plan_ctaLink'].forEach(id => $(id).value = ''); $('plan_highlight').value = 'false'; }

function renderPosts() {
  $('postsList').innerHTML = state.data.posts.map((p, index) => `
    <div class="plugin-card">
      <h4>${p.title}</h4>
      <div class="notice">/blog/${p.slug}/</div>
      <div class="admin-actions">
        <button class="btn btn-secondary" onclick="window.editPost(${index})">编辑</button>
        <button class="btn btn-ghost" onclick="window.removePost(${index})">删除</button>
        <a class="btn btn-secondary" href="/blog/${p.slug}/" target="_blank">预览</a>
      </div>
    </div>
  `).join('');
}
window.editPost = (index) => {
  const p = state.data.posts[index];
  $('post_index').value = index;
  $('post_slug').value = p.slug || '';
  $('post_title').value = p.title || '';
  $('post_excerpt').value = p.excerpt || '';
  $('post_seoTitle').value = p.seoTitle || '';
  $('post_seoDescription').value = p.seoDescription || '';
  $('post_keywords').value = (p.keywords || []).join(', ');
  $('post_category').value = p.category || '';
  $('post_heroLabel').value = p.heroLabel || '';
  $('post_updatedAt').value = p.updatedAt || currentDate();
  $('post_bodyHtml').value = p.bodyHtml || '';
};
window.removePost = (index) => {
  if (!confirm('删除这篇文章？')) return;
  state.data.posts.splice(index, 1); persist(); renderPosts(); toast('已删除文章');
};
function resetPostForm() { ['post_index','post_slug','post_title','post_excerpt','post_seoTitle','post_seoDescription','post_keywords','post_category','post_heroLabel','post_bodyHtml'].forEach(id => $(id).value = ''); $('post_updatedAt').value = currentDate(); }

function renderGeo() {
  $('geoList').innerHTML = state.data.geo.map((g, index) => `
    <div class="plugin-card">
      <h4>${g.title}</h4>
      <div class="notice">/geo/${g.slug}/</div>
      <div class="admin-actions">
        <button class="btn btn-secondary" onclick="window.editGeo(${index})">编辑</button>
        <button class="btn btn-ghost" onclick="window.removeGeo(${index})">删除</button>
        <a class="btn btn-secondary" href="/geo/${g.slug}/" target="_blank">预览</a>
      </div>
    </div>
  `).join('');
}
window.editGeo = (index) => {
  const g = state.data.geo[index];
  $('geo_index').value = index;
  $('geo_slug').value = g.slug || '';
  $('geo_title').value = g.title || '';
  $('geo_country').value = g.country || '';
  $('geo_city').value = g.city || '';
  $('geo_intro').value = g.intro || '';
  $('geo_seoTitle').value = g.seoTitle || '';
  $('geo_seoDescription').value = g.seoDescription || '';
  $('geo_keywords').value = (g.keywords || []).join(', ');
  $('geo_updatedAt').value = g.updatedAt || currentDate();
  $('geo_bodyHtml').value = g.bodyHtml || '';
};
window.removeGeo = (index) => {
  if (!confirm('删除这个 GEO 页？')) return;
  state.data.geo.splice(index, 1); persist(); renderGeo(); toast('已删除 GEO 页');
};
function resetGeoForm() { ['geo_index','geo_slug','geo_title','geo_country','geo_city','geo_intro','geo_seoTitle','geo_seoDescription','geo_keywords','geo_bodyHtml'].forEach(id => $(id).value = ''); $('geo_updatedAt').value = currentDate(); }

function renderPlugins() {
  $('pluginsList').innerHTML = state.data.plugins.map((p, index) => `
    <div class="plugin-card">
      <h4>${p.name}</h4>
      <div class="notice">${p.placement} · ${p.type} · enabled=${p.enabled}</div>
      <div class="admin-actions">
        <button class="btn btn-secondary" onclick="window.editPlugin(${index})">编辑</button>
        <button class="btn btn-ghost" onclick="window.removePlugin(${index})">删除</button>
      </div>
    </div>
  `).join('');
}
window.editPlugin = (index) => {
  const p = state.data.plugins[index];
  $('plugin_index').value = index;
  $('plugin_id').value = p.id || '';
  $('plugin_name').value = p.name || '';
  $('plugin_placement').value = p.placement || 'home_after_features';
  $('plugin_type').value = p.type || 'rich-text';
  $('plugin_enabled').value = String(!!p.enabled);
  $('plugin_title').value = p.title || '';
  $('plugin_bodyHtml').value = p.bodyHtml || '';
  $('plugin_ctaText').value = p.ctaText || '';
  $('plugin_ctaLink').value = p.ctaLink || '';
  $('plugin_links').value = JSON.stringify(p.links || [], null, 2);
};
window.removePlugin = (index) => {
  if (!confirm('删除这个插件？')) return;
  state.data.plugins.splice(index, 1); persist(); renderPlugins(); toast('已删除插件');
};
function resetPluginForm() { ['plugin_index','plugin_id','plugin_name','plugin_title','plugin_bodyHtml','plugin_ctaText','plugin_ctaLink'].forEach(id => $(id).value = ''); $('plugin_placement').value = 'home_after_features'; $('plugin_type').value = 'rich-text'; $('plugin_enabled').value = 'true'; $('plugin_links').value = '[]'; }

function renderCrm() {
  const leads = state.data.site.manualCrm.leads || [];
  $('crmTable').innerHTML = leads.map((lead, index) => `
    <tr>
      <td>${lead.name || ''}</td>
      <td>${lead.company || ''}</td>
      <td>${lead.country || ''}</td>
      <td>${lead.channel || ''}</td>
      <td>${lead.status || ''}</td>
      <td>${lead.notes || ''}</td>
      <td>
        <button class="btn btn-secondary" onclick="window.editLead(${index})">编辑</button>
        <button class="btn btn-ghost" onclick="window.removeLead(${index})">删除</button>
      </td>
    </tr>
  `).join('');
}
window.editLead = (index) => {
  const lead = state.data.site.manualCrm.leads[index];
  $('lead_index').value = index;
  $('lead_name').value = lead.name || '';
  $('lead_company').value = lead.company || '';
  $('lead_country').value = lead.country || '';
  $('lead_channel').value = lead.channel || '';
  $('lead_status').value = lead.status || state.data.site.manualCrm.columns[0] || '新线索';
  $('lead_notes').value = lead.notes || '';
};
window.removeLead = (index) => {
  if (!confirm('删除线索？')) return;
  state.data.site.manualCrm.leads.splice(index, 1); persist(); renderCrm(); toast('已删除线索');
};
function resetLeadForm() { ['lead_index','lead_name','lead_company','lead_country','lead_channel','lead_notes'].forEach(id => $(id).value = ''); $('lead_status').value = state.data.site.manualCrm.columns[0] || '新线索'; }

function saveSiteSection() {
  const s = state.data.site.site;
  s.name = $('site_name').value.trim();
  s.tagline = $('site_tagline').value.trim();
  s.domain = $('site_domain').value.trim();
  s.language = $('site_language').value.trim() || 'zh-CN';
  s.telegram = $('site_telegram').value.trim();
  s.whatsapp = $('site_whatsapp').value.trim();
  s.wechat = $('site_wechat').value.trim();
  persist(); toast('站点设置已保存到本地');
}

async function saveSeoSection() {
  const site = state.data.site;
  site.seo.title = $('seo_title').value.trim();
  site.seo.description = $('seo_description').value.trim();
  site.seo.keywords = $('seo_keywords').value.split(',').map(v => v.trim()).filter(Boolean);
  site.hero.eyebrow = $('hero_eyebrow').value.trim();
  site.hero.title = $('hero_title').value.trim();
  site.hero.subtitle = $('hero_subtitle').value.trim();
  site.hero.badges = $('hero_badges').value.split('\n').map(v => v.trim()).filter(Boolean);
  const newPass = $('site_new_pass').value.trim();
  if (newPass) {
    site.site.adminPassHash = await sha256(newPass);
    $('site_new_pass').value = '';
    toast('后台口令哈希已更新');
  }
  persist(); toast('SEO / Hero 已保存到本地');
}

function savePlan() {
  const plan = {
    slug: $('plan_slug').value.trim(),
    name: $('plan_name').value.trim(),
    priceText: $('plan_priceText').value.trim(),
    billingNote: $('plan_billingNote').value.trim(),
    features: $('plan_features').value.split('\n').map(v => v.trim()).filter(Boolean),
    ctaText: $('plan_ctaText').value.trim(),
    ctaLink: $('plan_ctaLink').value.trim(),
    highlight: $('plan_highlight').value === 'true'
  };
  const index = $('plan_index').value;
  if (index === '') state.data.site.pricing.push(plan); else state.data.site.pricing[Number(index)] = plan;
  persist(); renderPricing(); resetPlanForm(); toast('套餐已保存');
}

function savePost() {
  const post = {
    slug: $('post_slug').value.trim(),
    title: $('post_title').value.trim(),
    excerpt: $('post_excerpt').value.trim(),
    seoTitle: $('post_seoTitle').value.trim(),
    seoDescription: $('post_seoDescription').value.trim(),
    keywords: $('post_keywords').value.split(',').map(v => v.trim()).filter(Boolean),
    category: $('post_category').value.trim(),
    heroLabel: $('post_heroLabel').value.trim(),
    updatedAt: $('post_updatedAt').value.trim() || currentDate(),
    bodyHtml: $('post_bodyHtml').value.trim()
  };
  const index = $('post_index').value;
  if (index === '') state.data.posts.push(post); else state.data.posts[Number(index)] = post;
  persist(); renderPosts(); resetPostForm(); toast('文章已保存');
}

function saveGeo() {
  const geo = {
    slug: $('geo_slug').value.trim(),
    title: $('geo_title').value.trim(),
    country: $('geo_country').value.trim(),
    city: $('geo_city').value.trim(),
    intro: $('geo_intro').value.trim(),
    seoTitle: $('geo_seoTitle').value.trim(),
    seoDescription: $('geo_seoDescription').value.trim(),
    keywords: $('geo_keywords').value.split(',').map(v => v.trim()).filter(Boolean),
    updatedAt: $('geo_updatedAt').value.trim() || currentDate(),
    bodyHtml: $('geo_bodyHtml').value.trim()
  };
  const index = $('geo_index').value;
  if (index === '') state.data.geo.push(geo); else state.data.geo[Number(index)] = geo;
  persist(); renderGeo(); resetGeoForm(); toast('GEO 页面已保存');
}

function savePlugin() {
  let links = [];
  try { links = JSON.parse($('plugin_links').value || '[]'); } catch { return toast('Links JSON 格式不正确'); }
  const plugin = {
    id: $('plugin_id').value.trim(),
    name: $('plugin_name').value.trim(),
    placement: $('plugin_placement').value,
    type: $('plugin_type').value,
    enabled: $('plugin_enabled').value === 'true',
    title: $('plugin_title').value.trim(),
    bodyHtml: $('plugin_bodyHtml').value.trim(),
    ctaText: $('plugin_ctaText').value.trim(),
    ctaLink: $('plugin_ctaLink').value.trim(),
    links
  };
  const index = $('plugin_index').value;
  if (index === '') state.data.plugins.push(plugin); else state.data.plugins[Number(index)] = plugin;
  persist(); renderPlugins(); resetPluginForm(); toast('插件已保存');
}

function saveLead() {
  const lead = {
    name: $('lead_name').value.trim(),
    company: $('lead_company').value.trim(),
    country: $('lead_country').value.trim(),
    channel: $('lead_channel').value.trim(),
    status: $('lead_status').value,
    notes: $('lead_notes').value.trim()
  };
  const index = $('lead_index').value;
  if (index === '') state.data.site.manualCrm.leads.push(lead); else state.data.site.manualCrm.leads[Number(index)] = lead;
  persist(); renderCrm(); resetLeadForm(); toast('线索已保存');
}

function generatePostBatch() {
  const drafts = [
    {
      slug: 'how-to-get-overseas-buyers', title: 'How to Get Overseas Buyers with SEO and WhatsApp', excerpt: 'A simple landing-page structure for overseas buyer acquisition.', seoTitle: 'How to Get Overseas Buyers | SEO + WhatsApp', seoDescription: 'Use blog pages, country pages and chat-first CTAs to get overseas buyers.', keywords: ['how to get overseas buyers', 'SEO for exports', 'WhatsApp buyers'], category: 'batch', heroLabel: '批量草稿', updatedAt: currentDate(), bodyHtml: '<p>围绕问题词建立可收录页面，再把 CTA 统一导到聊天工具。</p>'
    },
    {
      slug: 'tiktok-lead-generation', title: 'TikTok Lead Generation for Export Businesses', excerpt: 'Build topic pages around TikTok lead generation and short-video acquisition.', seoTitle: 'TikTok Lead Generation for Export Businesses', seoDescription: 'Static landing pages for TikTok lead generation, AI video workflows and chat-first conversion.', keywords: ['TikTok lead generation', 'export business', 'short video leads'], category: 'batch', heroLabel: '批量草稿', updatedAt: currentDate(), bodyHtml: '<p>适合承接 TikTok 拓客、AI 视频、短视频矩阵等搜索词。</p>'
    }
  ];
  state.data.posts.push(...drafts); persist(); renderPosts(); toast('已生成文章草稿');
}

function generateGeoBatch() {
  const countries = ['Canada', 'Australia', 'Germany'];
  countries.forEach(country => {
    state.data.geo.push({
      slug: `${country.toLowerCase()}-ai-lead-generation`,
      title: `${country} AI Lead Generation for B2B Sales`,
      country,
      city: '',
      intro: `A GEO landing page for ${country} search traffic and AI lead generation.`,
      seoTitle: `${country} AI Lead Generation`,
      seoDescription: `Capture ${country} traffic with SEO-ready AI lead generation pages.`,
      keywords: [`${country} AI lead generation`, `${country} B2B leads`],
      updatedAt: currentDate(),
      bodyHtml: `<p>这是为 ${country} 自动生成的 GEO 草稿页，可继续补充行业词、平台词和 CTA。</p>`
    });
  });
  persist(); renderGeo(); toast('已生成国家页草稿');
}

function saveGithubConfig() {
  state.gh = {
    owner: $('gh_owner').value.trim(),
    repo: $('gh_repo').value.trim(),
    branch: $('gh_branch').value.trim() || 'main',
    contentPath: $('gh_contentPath').value.trim() || 'content',
    token: $('gh_token').value.trim()
  };
  localStorage.setItem(GH_KEY, JSON.stringify(state.gh));
  state.data.site.site.repo.owner = state.gh.owner;
  state.data.site.site.repo.name = state.gh.repo;
  state.data.site.site.repo.branch = state.gh.branch;
  state.data.site.site.repo.contentPath = state.gh.contentPath;
  persist();
  toast('GitHub 配置已保存');
}

async function githubPut(path, content, message) {
  const apiUrl = `https://api.github.com/repos/${state.gh.owner}/${state.gh.repo}/contents/${path}`;
  const headers = { Authorization: `Bearer ${state.gh.token}`, Accept: 'application/vnd.github+json' };
  let sha = undefined;
  const existing = await fetch(apiUrl + `?ref=${encodeURIComponent(state.gh.branch)}`, { headers });
  if (existing.ok) { const json = await existing.json(); sha = json.sha; }
  const res = await fetch(apiUrl, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, branch: state.gh.branch, content: btoa(unescape(encodeURIComponent(content))), sha })
  });
  if (!res.ok) throw new Error(await res.text());
}

async function pushToGithub() {
  saveGithubConfig();
  if (!state.gh.owner || !state.gh.repo || !state.gh.token) return toast('请先填写完整 GitHub 配置');
  const files = [
    ['site.json', JSON.stringify(state.data.site, null, 2)],
    ['posts.json', JSON.stringify(state.data.posts, null, 2)],
    ['geo.json', JSON.stringify(state.data.geo, null, 2)],
    ['plugins.json', JSON.stringify(state.data.plugins, null, 2)]
  ];
  try {
    for (const [name, content] of files) {
      await githubPut(`${state.gh.contentPath}/${name}`, content, `update ${name} from admin`);
    }
    toast('内容已推送到 GitHub，等待 Cloudflare Pages 自动部署');
  } catch (err) {
    console.error(err);
    toast('推送失败，请检查 Token 权限 / owner / repo / branch');
  }
}

function exportAll() { jsonDownload('all-content.json', state.data); }
function downloadContentFiles() {
  jsonDownload('site.json', state.data.site);
  setTimeout(() => jsonDownload('posts.json', state.data.posts), 200);
  setTimeout(() => jsonDownload('geo.json', state.data.geo), 400);
  setTimeout(() => jsonDownload('plugins.json', state.data.plugins), 600);
}

function bindEvents() {
  $('loginBtn').addEventListener('click', async () => {
    const input = $('passInput').value.trim();
    const hash = await sha256(input);
    if (hash !== state.data.site.site.adminPassHash) return toast('后台口令错误');
    localStorage.setItem(AUTH_KEY, '1');
    $('loginCard').style.display = 'none';
    $('dashboard').style.display = 'block';
  });
  $('logoutBtn').addEventListener('click', () => { localStorage.removeItem(AUTH_KEY); location.reload(); });
  $('saveSiteBtn').addEventListener('click', saveSiteSection);
  $('saveSeoBtn').addEventListener('click', saveSeoSection);
  $('savePlanBtn').addEventListener('click', savePlan);
  $('resetPlanBtn').addEventListener('click', resetPlanForm);
  $('savePostBtn').addEventListener('click', savePost);
  $('resetPostBtn').addEventListener('click', resetPostForm);
  $('saveGeoBtn').addEventListener('click', saveGeo);
  $('resetGeoBtn').addEventListener('click', resetGeoForm);
  $('savePluginBtn').addEventListener('click', savePlugin);
  $('resetPluginBtn').addEventListener('click', resetPluginForm);
  $('saveLeadBtn').addEventListener('click', saveLead);
  $('resetLeadBtn').addEventListener('click', resetLeadForm);
  $('generatePostBatchBtn').addEventListener('click', generatePostBatch);
  $('generateGeoBatchBtn').addEventListener('click', generateGeoBatch);
  $('saveGithubBtn').addEventListener('click', saveGithubConfig);
  $('pushGithubBtn').addEventListener('click', pushToGithub);
  $('exportJsonBtn').addEventListener('click', exportAll);
  $('downloadContentFilesBtn').addEventListener('click', downloadContentFiles);
  $('importJsonBtn').addEventListener('click', () => $('importJsonInput').click());
  $('importJsonInput').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const json = JSON.parse(await file.text());
    state.data = json; persist(); hydrate(); toast('已导入 all-content.json');
  });
  $('importPluginBtn').addEventListener('click', () => $('pluginImportInput').click());
  $('pluginImportInput').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const plugin = JSON.parse(await file.text());
    state.data.plugins.push(plugin); persist(); renderPlugins(); toast('插件已导入');
  });
}

function hydrate() {
  fillSite(); fillGithub(); renderPricing(); renderPosts(); renderGeo(); renderPlugins(); renderCrm();
}

(async function init() {
  await loadData();
  setupTabs(); hydrate(); bindEvents();
  if (localStorage.getItem(AUTH_KEY) === '1') {
    $('loginCard').style.display = 'none';
    $('dashboard').style.display = 'block';
  }
})();
