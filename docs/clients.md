# 各客户端的配置位置

同一个 MCP Server，在不同客户端里放的**文件和字段名不一样**。
安装脚本已经替你处理了这些差异，这份文档是给想手动配置的人看的。

## Claude Code

| 内容 | 位置 |
| --- | --- |
| MCP 配置（项目级） | `<项目>/.mcp.json` |
| MCP 配置（用户级） | `~/.claude.json` 里的 `mcpServers` |
| 项目规则 | `<项目>/CLAUDE.md` 或 `<项目>/AGENTS.md` |

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
    }
  }
}
```

支持 `\${VAR}` 与 `\${VAR:-default}` 形式的环境变量展开。

## Cursor

| 内容 | 位置 |
| --- | --- |
| MCP 配置（项目级） | `<项目>/.cursor/mcp.json` |
| MCP 配置（全局） | `~/.cursor/mcp.json` |
| 项目规则 | `<项目>/.cursor/rules/*.mdc` |
| 兼容规则 | `<项目>/AGENTS.md` |

规则文件需要 frontmatter：

```markdown
---
description: TypeScript + React 项目规则
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: false
---

（规则正文）
```

`.mdc` 支持 `globs` 按文件类型自动附加，比塞进 `AGENTS.md` 更省上下文。
安装脚本为 Cursor 写规则时会自动转成 `.mdc`。

## VS Code + GitHub Copilot

| 内容 | 位置 |
| --- | --- |
| MCP 配置（工作区） | `<项目>/.vscode/mcp.json` |
| MCP 配置（用户级） | 命令面板 → `MCP: Open User Configuration` |
| 规则 | `<项目>/AGENTS.md` 或 `.github/copilot-instructions.md` |

⚠️ **字段名不一样**：VS Code 用的是 `servers` 而不是 `mcpServers`，
并且需要显式声明 `type: "stdio"`：

```json
{
  "servers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/project"]
    }
  }
}
```

环境变量用 `\${input:xxx}` 或 `\${env:XXX}` 语法。

## Windsurf

| 内容 | 位置 |
| --- | --- |
| MCP 配置 | `~/.codeium/windsurf/mcp_config.json` |
| 规则 | `<项目>/.windsurfrules` 或 `AGENTS.md` |

格式与 Claude Desktop 相同（`mcpServers`）。**只有全局配置**，没有项目级。

## Cline / Roo Code

在 VS Code 里点扩展图标 → MCP Servers → Configure，编辑的是扩展自己的
`cline_mcp_settings.json`，格式同 `mcpServers`。

## 通用：`AGENTS.md`

[AGENTS.md](https://agents.md) 是一个正在被越来越多工具采纳的约定：
把项目约定放在仓库根目录的这个文件里，各家助手都会读。
这是本项目写规则时的**默认目标**——一次编写，多个客户端共享。

## 排查

装完不生效，按顺序检查：

1. **重启客户端**。大部分客户端只在启动时读 MCP 配置。
2. 看客户端的 MCP 日志（Cursor：Output → MCP Logs）。
3. 手动跑一遍 `command` + `args`，确认服务本身能起来：
   ```bash
   npx -y @modelcontextprotocol/server-filesystem /path/to/project
   ```
4. 路径里有空格或中文时，确认用的是绝对路径且已正确转义。
5. Windows 上 `npx` 可能需要写成 `npx.cmd`，或者前面加 `cmd /c`。
