#!/usr/bin/env node
// 零依赖条目校验器。用法：node scripts/validate.mjs
// 任何一条不合格都以退出码 1 结束，CI 直接失败。

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORIES = ['core', 'data', 'web', 'devops', 'ai'];

// 常见密钥形态：发现就报错，避免有人把真 token 提交进来
const SECRET_PATTERNS = [
  [/sk-[A-Za-z0-9]{20,}/, 'OpenAI 风格密钥'],
  [/ghp_[A-Za-z0-9]{30,}/, 'GitHub PAT'],
  [/github_pat_[A-Za-z0-9_]{30,}/, 'GitHub 细粒度 PAT'],
  [/AKIA[0-9A-Z]{16}/, 'AWS Access Key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, '私钥'],
];

const errors = [];
const warnings = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const warn = (file, msg) => warnings.push(`${file}: ${msg}`);

function scanSecrets(file, text) {
  for (const [re, label] of SECRET_PATTERNS) {
    if (re.test(text)) fail(file, `疑似泄漏${label}，请改用 ${ENV_VAR} 占位`);
  }
}

// ---------- 1. MCP 条目 ----------
function validateMcps() {
  const dir = join(ROOT, 'mcps');
  if (!existsSync(dir)) return fail('mcps/', '目录不存在');
  const files = readdirSync(dir).filter(f => f.endsWith('.json'));
  const ids = new Set();
  let featured = 0;

  for (const file of files) {
    const rel = `mcps/${file}`;
    const raw = readFileSync(join(dir, file), 'utf8');
    scanSecrets(rel, raw);

    let entry;
    try { entry = JSON.parse(raw); } catch (e) { fail(rel, `JSON 解析失败: ${e.message}`); continue; }

    const id = basename(file, '.json');
    if (entry.id !== id) fail(rel, `id 必须与文件名一致（期望 "${id}"，实际 "${entry.id}"）`);

    for (const key of ['id', 'name', 'category', 'description', 'tags', 'author', 'repo', 'install']) {
      if (entry[key] === undefined) fail(rel, `缺少必填字段 "${key}"`);
    }
    if (entry.id && !KEBAB.test(entry.id)) fail(rel, `id 必须是小写 kebab-case`);
    if (entry.category && !CATEGORIES.includes(entry.category)) {
      fail(rel, `category 必须是 ${CATEGORIES.join(' / ')} 之一`);
    }
    if (typeof entry.description === 'string') {
      if (entry.description.length < 10) fail(rel, 'description 太短，说清楚它能干什么');
      if (entry.description.length > 160) fail(rel, 'description 超过 160 字，精简');
    }
    if (Array.isArray(entry.tags) && (entry.tags.length === 0 || entry.tags.length > 5)) {
      fail(rel, 'tags 必须是 1–5 个');
    }
    if (typeof entry.repo === 'string' && !entry.repo.startsWith('https://')) {
      fail(rel, 'repo 必须是 https 链接');
    }
    if (entry.featured) featured++;
    if (ids.has(entry.id)) fail(rel, `id "${entry.id}" 重复`);
    ids.add(entry.id);

    // install 片段必须真的可用
    const inst = entry.install;
    if (!inst || typeof inst !== 'object' || Object.keys(inst).length === 0) {
      fail(rel, 'install 至少要有一个客户端片段');
    } else {
      for (const [client, snippet] of Object.entries(inst)) {
        const bucket = client === 'vscode' ? 'servers' : 'mcpServers';
        const servers = snippet?.[bucket];
        if (!servers || typeof servers !== 'object') {
          fail(rel, `install.${client} 缺少 "${bucket}" 对象`);
          continue;
        }
        for (const [name, cfg] of Object.entries(servers)) {
          if (!cfg.command) fail(rel, `install.${client}.${name} 缺少 command`);
          if (!Array.isArray(cfg.args)) fail(rel, `install.${client}.${name} 缺少 args 数组`);
        }
      }
    }

    if (!entry.notes) warn(rel, '建议补 notes，写清安全边界或使用注意');
    if (Array.isArray(entry.env)) {
      for (const e of entry.env) {
        if (!e.key || !e.description) fail(rel, 'env 每项都需要 key 和 description');
        if (e.required && !entry.install?.claude?.mcpServers?.[entry.id]?.env?.[e.key]) {
          warn(rel, `必填环境变量 ${e.key} 没有出现在 install.claude 的 env 里`);
        }
      }
    }
  }

  if (featured > 8) warn('mcps/', `featured 条目有 ${featured} 个，建议不超过 8 个，否则失去推荐意义`);
  return files.length;
}

// ---------- 2. Rules / Skills ----------
function parseFrontmatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = text.slice(text.indexOf('\n', 3) + 1, end);
  const out = {};
  let listKey = null;
  for (const line of block.split('\n')) {
    if (!line.trim()) continue;
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (m) {
      const [, k, v] = m;
      if (v === '') { out[k] = []; listKey = k; }
      else if (v.startsWith('[')) {
        out[k] = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        listKey = null;
      } else { out[k] = v.replace(/^["']|["']$/g, ''); listKey = null; }
    } else if (/^\s+-\s+/.test(line) && listKey) {
      out[listKey].push(line.replace(/^\s+-\s+/, '').trim());
    }
  }
  return out;
}

function validateMarkdown(kind) {
  const dir = join(ROOT, kind);
  if (!existsSync(dir)) return fail(kind + '/', '目录不存在');
  const files = readdirSync(dir).filter(f => f.endsWith('.md'));
  for (const file of files) {
    const rel = `${kind}/${file}`;
    const text = readFileSync(join(dir, file), 'utf8');
    scanSecrets(rel, text);

    const fm = parseFrontmatter(text);
    if (!fm) { fail(rel, '缺少 frontmatter（文件必须以 --- 开头，并有三横线结束）'); continue; }

    const id = basename(file, '.md');
    if (fm.id !== id) fail(rel, `id 必须与文件名一致（期望 "${id}"，实际 "${fm.id ?? '缺失'}"）`);
    for (const key of ['id', 'name', 'description', 'tags', 'clients']) {
      if (fm[key] === undefined) fail(rel, `frontmatter 缺少 "${key}"`);
    }
    if (typeof fm.description === 'string' && fm.description.length < 10) {
      fail(rel, 'description 太短，写清什么时候该用它');
    }
    if (Array.isArray(fm.clients) && fm.clients.length === 0) fail(rel, 'clients 不能为空');

    const body = text.slice(text.indexOf('\n---', 3) + 4).trim();
    if (body.length < 100) fail(rel, '正文太短，规则/流程要写出实际可执行的内容');
    if (body.split('\n').length > 300) warn(rel, '正文超过 300 行，考虑拆分');

    // 抓「正确的废话」
    for (const phrase of ['最佳实践', '革命性', '强大的', '简单易用']) {
      if (body.includes(phrase)) warn(rel, `出现空泛措辞「${phrase}」，改成可验证的具体约束`);
    }
  }
  return files.length;
}

// ---------- 3. presets 引用完整性 ----------
function validatePresets() {
  const p = join(ROOT, 'install', 'presets.json');
  if (!existsSync(p)) return fail('install/presets.json', '不存在');
  const presets = JSON.parse(readFileSync(p, 'utf8'));
  const all = new Set([
    ...readdirSync(join(ROOT, 'mcps')).map(f => basename(f, '.json')),
    ...readdirSync(join(ROOT, 'rules')).map(f => basename(f, '.md')),
    ...readdirSync(join(ROOT, 'skills')).map(f => basename(f, '.md')),
  ]);
  let n = 0;
  for (const [name, items] of Object.entries(presets)) {
    if (!KEBAB.test(name)) fail('install/presets.json', `预设名 "${name}" 不是 kebab-case`);
    if (!Array.isArray(items) || items.length === 0) { fail('install/presets.json', `预设 "${name}" 为空`); continue; }
    for (const it of items) {
      n++;
      if (!all.has(it)) fail('install/presets.json', `预设 "${name}" 引用了不存在的条目 "${it}"`);
    }
  }
  return n;
}

// ---------- run ----------
const mcpCount = validateMcps();
const ruleCount = validateMarkdown('rules');
const skillCount = validateMarkdown('skills');
const refCount = validatePresets();

console.log(`检查 ${mcpCount} 个 MCP 条目、${ruleCount} 条 Rules、${skillCount} 个 Skills、${refCount} 处预设引用`);

if (warnings.length) {
  console.log(`\n⚠️  ${warnings.length} 条建议：`);
  for (const x of warnings) console.log('   - ' + x);
}
if (errors.length) {
  console.log(`\n❌ ${errors.length} 个错误：`);
  for (const x of errors) console.log('   - ' + x);
  process.exit(1);
}
console.log('\n✅ 全部通过');
