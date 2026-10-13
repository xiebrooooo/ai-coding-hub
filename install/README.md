# 安装器

`install.sh` / `install.ps1` 是同一个 Node 程序（`install/apply.mjs`）的薄壳，
所以两个平台的行为**完全一致**——不会出现「Windows 上装出来跟 Linux 不一样」。

## 用法

```bash
# 按预设
./install/install.sh --preset frontend

# 按条目
./install/install.sh --add filesystem --add typescript-react

# 先看看会改什么（强烈建议）
./install/install.sh --preset frontend --dry-run

# 装到别的项目目录
./install/install.sh --preset backend --target ~/work/api

# 一次装到所有支持的客户端
./install/install.sh --preset minimal --client all
```

## 全部参数

| 参数 | 说明 |
| --- | --- |
| `--preset <name>` | 安装预设，见 `install/presets.json` |
| `--add <id>` | 安装单个条目，可重复，也可逗号分隔 |
| `--client <name>` | `claude` / `cursor` / `vscode` / `windsurf` / `all`（默认 `claude`） |
| `--target <dir>` | 项目目录（默认当前目录） |
| `--workspace <path>` | 替换 `\${WORKSPACE}` 的值（默认等于 `--target`） |
| `--force` | 覆盖已存在的同名 MCP 配置 |
| `--dry-run` | 只显示改动，不写任何文件 |

## 它到底改了什么

| 客户端 | MCP 配置写到 | 规则写到 |
| --- | --- | --- |
| Claude Code | `<target>/.mcp.json` | `<target>/AGENTS.md` |
| Cursor | `<target>/.cursor/mcp.json` | `<target>/.cursor/rules/*.mdc` |
| VS Code + Copilot | `<target>/.vscode/mcp.json` | `<target>/AGENTS.md` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | `<target>/AGENTS.md` |

## 安全设计

- **默认不覆盖**已有的同名 MCP 配置。冲突时跳过并提示，要覆盖得显式加 `--force`。
- 规则写进 `AGENTS.md` 时用**托管区块**包裹（`<!-- ai-coding-hub:start -->...<!-- ai-coding-hub:end -->`），
  重复运行只会更新这一块，**不会**动你自己写的内容，也不会重复追加。
- 配置里的 `\${XXX}` 环境变量**不会被替换**，保持占位——密钥由你自己在环境里设置，不会落到文件里。
- `--dry-run` 完全不写盘，第一次用先跑它。

## 卸载

删掉上面表格里对应的文件即可。`AGENTS.md` 只删托管区块之间的内容，别整份删。
