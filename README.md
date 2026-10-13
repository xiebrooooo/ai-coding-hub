<div align="center">

# 🧩 AI Coding Hub

**一个仓库，装齐你的 AI 编程助手配置**

MCP Servers · Rules · Skills —— 一条命令，全套就位

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Validate](https://github.com/xiebrooooo/ai-coding-hub/actions/workflows/validate.yml/badge.svg)](https://github.com/xiebrooooo/ai-coding-hub/actions)

[English](README.en.md) · **简体中文**

</div>

---

## 😤 问题

想把 AI 编程助手配到「好用」，你得干这些事：

- 翻十几个仓库，每个 README 只写了 **Claude Desktop** 的配置，没写 Cursor 的
- Rules 散落在各种 gist 和博客里，格式五花八门，粘进去还不一定生效
- 辛苦调好的配置，换台电脑、换个客户端就要重来一遍
- 不知道自己缺什么 —— 别人在用的好东西，你根本不知道它存在

**这个仓库把它们收进一个地方，用统一的格式描述，然后一条命令装进你的客户端。**

## ⚡ 一行安装

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/xiebrooooo/ai-coding-hub/main/install/install.sh | bash -s -- --preset frontend
```

```powershell
# Windows (PowerShell 7+)
iwr -useb https://raw.githubusercontent.com/xiebrooooo/ai-coding-hub/main/install/install.ps1 | iex
```

**先看会改哪些文件**（首次强烈建议，脚本不会动你的配置）：

```bash
./install/install.sh --preset frontend --dry-run
```

可用预设：`minimal` · `frontend` · `backend` · `python` · `data` · `fullstack`

也可以按条目装：

```bash
./install/install.sh --add filesystem --add typescript-react
```

## 📦 内容

### 🔌 MCP Servers

给你的助手装上「手脚」：读写文件、查数据库、搜网页、调 API。

| 条目 | 说明 | 标签 |
| --- | --- | --- |
| [filesystem](mcps/filesystem.json) | 安全读写你指定的目录 | 官方 · 必备 |
| [git](mcps/git.json) | 让助手自己看 git 历史和 diff | 官方 · 必备 |
| [fetch](mcps/fetch.json) | 抓网页转 Markdown，省 token | 官方 · 必备 |
| [github](mcps/github.json) | 直接操作 issue / PR / 搜代码 | 官方 |
| [memory](mcps/memory.json) | 跨会话记住项目约定 | 官方 |
| [sequential-thinking](mcps/sequential-thinking.json) | 复杂问题强制分步推理 | 官方 |
| [postgres](mcps/postgres.json) | 只读查询 PostgreSQL | 官方 |
| [playwright](mcps/playwright.json) | 浏览器自动化 / 页面调试 | 微软 |

### 📏 Rules

放进 `AGENTS.md` / `.cursor/rules/` 的规则，约束助手的编码风格和边界。

| 条目 | 适用 |
| --- | --- |
| [typescript-react](rules/typescript-react.md) | 前端 · TS · React |
| [python-fastapi](rules/python-fastapi.md) | 后端 · Python |
| [go-service](rules/go-service.md) | 后端 · Go |
| [code-review](rules/code-review.md) | 通用 · 代码评审 |
| [a11y-baseline](rules/a11y-baseline.md) | 前端 · 无障碍 |
| [commit-convention](rules/commit-convention.md) | 通用 · 提交规范 |

### 🛠️ Skills

可复用的工作流，把「每次都要交代一遍」的流程固化成一段可调用的指令。

| 条目 | 说明 |
| --- | --- |
| [debug-systematically](skills/debug-systematically.md) | 系统化排查 bug，禁止瞎猜 |
| [pr-description](skills/pr-description.md) | 从 diff 生成规范的 PR 描述 |
| [refactor-safely](skills/refactor-safely.md) | 先补测试再重构 |
| [write-tests-for-legacy](skills/write-tests-for-legacy.md) | 给遗留代码补安全网 |

## 🧩 支持的客户端

| 客户端 | Rules | MCP | 配置文件 |
| --- | :---: | :---: | --- |
| Claude Code | ✅ | ✅ | `.mcp.json` / `CLAUDE.md` |
| Cursor | ✅ | ✅ | `.cursor/mcp.json` / `.cursor/rules/` |
| VS Code + Copilot | ✅ | ✅ | `.vscode/mcp.json` / `AGENTS.md` |
| Windsurf | ✅ | ✅ | `~/.codeium/windsurf/mcp_config.json` |
| Cline / Roo Code | ✅ | ✅ | 见客户端文档 |

详细的配置文件路径和格式见 [docs/clients.md](docs/clients.md)。

## 🚀 手动使用（不用脚本）

每个条目都是自包含的：

1. 打开 `mcps/<名字>.json`
2. 复制 `install.claude.mcpServers` 里那段
3. 粘到你的客户端配置里，把 `${WORKSPACE}` 之类的占位符换成你的真实路径

## 📚 文档

- [各客户端配置位置](docs/clients.md) —— 手动配置、排查「装完不生效」
- [5 分钟加一个新条目](docs/how-to-add.md) —— 想贡献从这开始
- [安装器说明](install/README.md) —— 它到底改了你哪几个文件
- [更新日志](CHANGELOG.md)

## 🤝 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。

**门槛很低**：复制一份已有的 JSON 改内容，或者直接提交一条规则。
CI 会自动校验格式，不合格会告诉你怎么改。

## 📄 License

[MIT](LICENSE) —— 拿去用，随便改。

---

<div align="center">
<sub>如果这个仓库帮你省下了一个下午，点个 ⭐ 就是最好的回报。</sub>
</div>
