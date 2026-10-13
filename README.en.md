<div align="center">

# 🧩 AI Coding Hub

**One repo. Your entire AI coding assistant setup.**

MCP Servers · Rules · Skills — installed with a single command

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**English** · [简体中文](README.md)

</div>

---

## 😤 Why

- Most MCP server READMEs only document **Claude Desktop** — never Cursor, never VS Code
- Rules live in scattered gists and blog posts, in formats that don't even work
- You rebuild the same setup from scratch on every new machine
- You don't know what you're missing

**This repo collects them, describes them with one schema, and installs them into your client with one command.**

## ⚡ Install

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/xiebrooooo/ai-coding-hub/main/install/install.sh | bash -s -- --preset frontend
```

```powershell
# Windows (PowerShell 7+)
iwr -useb https://raw.githubusercontent.com/xiebrooooo/ai-coding-hub/main/install/install.ps1 | iex
```

See what it would touch first — the script never writes your config:

```bash
./install/install.sh --preset frontend --dry-run
```

Presets: `minimal` · `frontend` · `backend` · `python` · `data` · `fullstack`

## 📦 What's inside

**`mcps/`** — 8 MCP servers (filesystem, git, fetch, github, memory, sequential-thinking, postgres, playwright)

**`rules/`** — 6 rule sets (TypeScript/React, Python/FastAPI, Go, code review, commit convention)

**`skills/`** — 4 workflows (systematic debugging, PR descriptions, safe refactoring)

Every entry is self-contained: open the file, copy the snippet, paste it into your client.

## 🧩 Supported clients

| Client | Rules | MCP | Config file |
| --- | :---: | :---: | --- |
| Claude Code | ✅ | ✅ | `.mcp.json` / `CLAUDE.md` |
| Cursor | ✅ | ✅ | `.cursor/mcp.json` / `.cursor/rules/` |
| VS Code + Copilot | ✅ | ✅ | `.vscode/mcp.json` / `AGENTS.md` |
| Windsurf | ✅ | ✅ | `~/.codeium/windsurf/mcp_config.json` |
| Cline / Roo Code | ✅ | ✅ | see client docs |

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Duplicate an existing JSON, edit it, open a PR — CI validates the shape.

## 📄 License

[MIT](LICENSE).
