import fs from 'fs';
import path from 'path';
import { ensureDir, renderHome, renderPostPage, renderGeoPage, render404 } from '../src/templates.js';

const root = process.cwd();
const dist = path.join(root, 'dist');
const publicDir = path.join(root, 'public');
const contentDir = path.join(root, 'content');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
}
function rm(dir) { fs.rmSync(dir, { recursive: true, force: true }); }
function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

const site = readJson('site.json');
const posts = readJson('posts.json');
const geo = readJson('geo.json');
const plugins = readJson('plugins.json');

rm(dist);
copyDir(publicDir, dist);
ensureDir(path.join(dist, 'content'));
for (const file of ['site.json', 'posts.json', 'geo.json', 'plugins.json']) {
  fs.copyFileSync(path.join(contentDir, file), path.join(dist, 'content', file));
}

fs.writeFileSync(path.join(dist, 'index.html'), renderHome(site, posts, geo, plugins));
ensureDir(path.join(dist, 'blog'));
ensureDir(path.join(dist, 'geo'));
for (const post of posts) {
  const dir = path.join(dist, 'blog', post.slug);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), renderPostPage(site, post, posts, geo));
}
for (const page of geo) {
  const dir = path.join(dist, 'geo', page.slug);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), renderGeoPage(site, page, posts, geo));
}
fs.writeFileSync(path.join(dist, '404.html'), render404(site));

const allUrls = [
  '/',
  ...posts.map(p => `/blog/${p.slug}/`),
  ...geo.map(g => `/geo/${g.slug}/`),
  '/admin/'
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.map(u => `  <url><loc>${site.site.domain.replace(/\/$/, '')}${u}</loc></url>`).join('\n')}\n</urlset>`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);

console.log(`Built ${posts.length} posts, ${geo.length} geo pages.`);
