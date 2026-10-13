#!/usr/bin/env node
// AI Coding Hub 安装器核心逻辑。
// install.sh / install.ps1 都是这个脚本的薄壳，两个平台行为完全一致。

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

const SELF_DIR = dirname(fileURLToPath(import.meta.url));
const MARK_START = "<!-- ai-coding-hub:start (由安装脚本生成，请勿手动编辑此区块) -->";
const MARK_END = "<!-- ai-coding-hub:end -->";

const CLIENTS = {
  claude:   { label: "Claude Code",       key: "mcpServers", mcp: (t) => join(t, ".mcp.json") },
  cursor:   { label: "Cursor",            key: "mcpServers", mcp: (t) => join(t, ".cursor", "mcp.json"), rulesDir: (t) => join(t, ".cursor", "rules") },
  vscode:   { label: "VS Code + Copilot", key: "servers",    mcp: (t) => join(t, ".vscode", "mcp.json") },
  windsurf: { label: "Windsurf",          key: "mcpServers", mcp: () => join(homedir(), ".codeium", "windsurf", "mcp_config.json"), global: true },
};

const HELP = [
  "AI Coding Hub —— 一键安装 AI 编程助手配置",
  "",
  "用法:",
  "  node install/apply.mjs --preset frontend",
  "  node install/apply.mjs --add filesystem --add typescript-react",
  "",
  "选项:",
  "  --add <id>          安装指定条目，可重复，也可用逗号分隔",
  "  --preset <name>     安装预设（见 install/presets.json）",
  "  --client <name>     claude | cursor | vscode | windsurf | all   (默认 claude)",
  "  --target <dir>      项目目录 (默认：当前目录)",
  "  --workspace <path>  替换 \${WORKSPACE} 的值 (默认：等于 --target)",
  "  --force             覆盖已存在的同名 MCP 配置",
  "  --dry-run           只显示将要做的改动，不写任何文件",
  "  --help",
].join("\n");

// ---------- 参数 ----------
function parseArgs(argv) {
  const out = { add: [], client: "claude", dryRun: false, force: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--add") out.add.push(...String(next()).split(",").map(s => s.trim()).filter(Boolean));
    else if (a === "--preset") out.preset = next();
    else if (a === "--client") out.client = next();
    else if (a === "--target") out.target = next();
    else if (a === "--workspace") out.workspace = next();
    else if (a === "--force") out.force = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--help" || a === "-h") out.help = true;
    else { console.error("未知参数: " + a); out.help = true; }
  }
  return out;
}

// ---------- 仓库内容 ----------
function loadRepo() {
  const repoRoot = resolve(SELF_DIR, "..");
  const readDir = (d, ext) => readdirSync(join(repoRoot, d)).filter(f => f.endsWith(ext));

  const mcps = readDir("mcps", ".json").map(f => {
    const entry = JSON.parse(readFileSync(join(repoRoot, "mcps", f), "utf8"));
    return { ...entry, kind: "mcp", file: join(repoRoot, "mcps", f) };
  });

  const docs = (kind) => readDir(kind, ".md").map(f => {
    const text = readFileSync(join(repoRoot, kind, f), "utf8");
    const id = basename(f, ".md");
    const fm = text.startsWith("---") ? text.slice(3, text.indexOf("\n---", 3)) : "";
    const nameLine = /^name:\s*(.+)$/m.exec(fm);
    return { id, kind, name: nameLine ? nameLine[1].trim() : id, body: text, file: join(repoRoot, kind, f) };
  });

  const presets = JSON.parse(readFileSync(join(repoRoot, "install", "presets.json"), "utf8"));
  return { repoRoot, mcps, rules: docs("rules"), skills: docs("skills"), presets };
}

// ---------- 选择 ----------
function select(repo, args) {
  const wanted = new Set(args.add);
  if (args.preset) {
    const p = repo.presets[args.preset];
    if (!p) {
      const names = Object.keys(repo.presets).join(", ");
      throw new Error("未知预设 \"" + args.preset + "\"。可用: " + names);
    }
    for (const id of p) wanted.add(id);
  }
  if (wanted.size === 0) throw new Error("没有指定任何内容。用 --preset <name> 或 --add <id>。");

  const all = [...repo.mcps, ...repo.rules, ...repo.skills];
  const known = new Set(all.map(e => e.id));
  const missing = [...wanted].filter(id => !known.has(id));
  if (missing.length) throw new Error("找不到条目: " + missing.join(", "));

  return {
    mcps: repo.mcps.filter(e => wanted.has(e.id)),
    docs: [...repo.rules, ...repo.skills].filter(e => wanted.has(e.id)),
  };
}

// ---------- MCP 配置写入 ----------
function snippetFor(entry, client) {
  const inst = entry.install || {};
  if (inst[client]) return inst[client];
  if (client === "cursor" || client === "windsurf") return inst.claude || null;
  if (client === "vscode") return inst.vscode || inst.claude || null;
  return inst.claude || null;
}

function substituteWorkspace(value, workspace) {
  if (Array.isArray(value)) return value.map(v => substituteWorkspace(v, workspace));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = substituteWorkspace(v, workspace);
    return out;
  }
  if (typeof value === "string") return value.split("\${WORKSPACE}").join(workspace);
  return value;
}

function applyMcp(clientName, entries, ctx) {
  const client = CLIENTS[clientName];
  const file = client.mcp(ctx.target);
  const report = { client: clientName, file, added: [], skipped: [], unchanged: [] };

  let config = {};
  if (existsSync(file)) {
    try { config = JSON.parse(readFileSync(file, "utf8")); }
    catch (e) { throw new Error("已有的配置文件不是合法 JSON，先修好再装: " + file + "\n" + e.message); }
  }
  if (!config[client.key] || typeof config[client.key] !== "object") config[client.key] = {};

  for (const entry of entries) {
    const snippet = snippetFor(entry, clientName);
    if (!snippet) continue;
    const bucket = snippet.servers ? snippet.servers : snippet.mcpServers;
    const incoming = bucket && bucket[entry.id];
    if (!incoming) continue;

    const resolved = substituteWorkspace(incoming, ctx.workspace);
    const existing = config[client.key][entry.id];

    if (existing) {
      if (JSON.stringify(existing) === JSON.stringify(resolved)) { report.unchanged.push(entry.id); continue; }
      if (!ctx.force) { report.skipped.push(entry.id); continue; }
    }
    config[client.key][entry.id] = resolved;
    report.added.push(entry.id);
  }

  if (report.added.length && !ctx.dryRun) {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(config, null, 2) + "\n", "utf8");
  }
  return report;
}

// ---------- Rules / Skills 写入 ----------
function upsertManagedSection(file, block) {
  if (!existsSync(file)) return block + "\n";
  const cur = readFileSync(file, "utf8");
  const s = cur.indexOf(MARK_START);
  const e = cur.indexOf(MARK_END);
  if (s !== -1 && e !== -1) return cur.slice(0, s) + block + cur.slice(e + MARK_END.length);
  return cur.replace(/\s*$/, "") + "\n\n" + block + "\n";
}

function applyDocs(clientName, docs, ctx) {
  if (!docs.length) return null;
  const client = CLIENTS[clientName];
  const report = { client: clientName, files: [] };

  if (client.rulesDir) {
    // Cursor：一条规则一个 .mdc，天然幂等，直接覆盖
    const dir = client.rulesDir(ctx.target);
    for (const d of docs) {
      const file = join(dir, d.id + ".mdc");
      if (!ctx.dryRun) { mkdirSync(dir, { recursive: true }); writeFileSync(file, d.body, "utf8"); }
      report.files.push(file);
    }
    return report;
  }

  // 其余客户端：写进项目根的 AGENTS.md，用托管区块保证重复运行不重复追加
  const file = join(ctx.target, "AGENTS.md");
  const stripped = docs.map(d => d.body.replace(/^---[\s\S]*?\n---\n/, "").trim());
  const block = [MARK_START, stripped.join("\n\n---\n\n"), MARK_END].join("\n");
  const content = upsertManagedSection(file, block);
  if (!ctx.dryRun) writeFileSync(file, content, "utf8");
  report.files.push(file);
  return report;
}

// ---------- 主流程 ----------
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return 0; }

  const repo = loadRepo();
  const sel = select(repo, args);
  const target = resolve(args.target || process.cwd());
  const workspace = args.workspace || target;

  const clients = args.client === "all" ? Object.keys(CLIENTS) : [args.client];
  for (const c of clients) if (!CLIENTS[c]) throw new Error("未知客户端: " + c + "（可选 " + Object.keys(CLIENTS).join(" / ") + " / all）");

  const ctx = { target, workspace, dryRun: args.dryRun, force: args.force };
  const prefix = args.dryRun ? "[dry-run] " : "";

  console.log(prefix + "项目目录: " + target);
  console.log(prefix + "选中: " + sel.mcps.length + " 个 MCP, " + sel.docs.length + " 条规则/技能\n");

  for (const c of clients) {
    const mcpReport = applyMcp(c, sel.mcps, ctx);
    console.log(prefix + "[" + CLIENTS[c].label + "] MCP → " + mcpReport.file);
    if (!sel.mcps.length) console.log("   （本次没有选中 MCP 条目）");
    for (const id of mcpReport.added) console.log("   + " + id);
    for (const id of mcpReport.unchanged) console.log("   = " + id + "  (已是同样配置)");
    for (const id of mcpReport.skipped) console.log("   ! " + id + "  (已存在且不同，用 --force 覆盖)");

    const docReport = applyDocs(c, sel.docs, ctx);
    if (docReport) for (const f of docReport.files) console.log(prefix + "[" + CLIENTS[c].label + "] 规则 → " + f);
    console.log("");
  }

  console.log(prefix + "完成。" + (args.dryRun ? "（未写入任何文件）" : ""));
  return 0;
}

try {
  process.exitCode = main();
} catch (e) {
  console.error("\n✖ " + e.message);
  process.exitCode = 1;
}
