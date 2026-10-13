# 贡献指南

感谢你愿意贡献。这个仓库的价值全部来自「别人调好的东西，我能直接用」。

## 三种贡献方式

1. **新增一个条目** —— MCP Server / Rule / Skill
2. **修正已有条目** —— 配置过时、命令跑不通、描述不准确
3. **改进工具** —— 安装脚本、校验器、文档

---

## 一、新增 MCP Server

1. 复制 `mcps/filesystem.json` 为 `mcps/<条目 id>.json`
2. `id` 必须是小写 kebab-case，且**与文件名一致**
3. 按下面的字段表填写
4. 本地验证：`node scripts/validate.mjs`
5. 提交 PR

### 字段表

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | :-: | --- |
| `id` | string | ✅ | kebab-case，与文件名一致 |
| `name` | string | ✅ | 展示名 |
| `category` | string | ✅ | `core` / `data` / `web` / `devops` / `ai` |
| `description` | string | ✅ | 中文，一句话说清**它能干什么** |
| `tags` | string[] | ✅ | 1–5 个标签，第一个通常是 `官方` 或厂商名 |
| `repo` | string | ✅ | 上游仓库 URL |
| `author` | string | ✅ | 上游作者 / 组织 |
| `featured` | boolean | | 首页推荐位 |
| `install` | object | ✅ | 至少一个客户端键，值为可直接粘贴的配置片段 |
| `env` | array | | 需要的环境变量 |
| `notes` | string | | 使用注意 / 安全提示 |

### 质量要求（PR 会被按这个打回）

- ✅ 必须能用 `npx` / `uvx` / `docker` **一条命令本地跑起来**
- ❌ 不接受必须先注册账号、必须付费才能用的
- ❌ 描述里不要出现「强大的」「革命性的」这类词，写清楚做什么就行
- ✅ 至少给出一种客户端的**可直接粘贴**配置（推荐 `claude`，因为格式最通用）
- 🔐 涉及密钥的用 `\${ENV_VAR}` 占位，**绝不提交真实 token**
- ✅ 在 `notes` 里写清楚安全边界，比如「只暴露一个目录最安全」

---

## 二、新增 Rule

Rule 是放进 `AGENTS.md` / `.cursor/rules/` 的约束文本。

1. 复制 `rules/typescript-react.md`
2. 新建 `rules/<id>.md`，文件名即 `id`
3. 必须带 frontmatter：

```yaml
---
id: typescript-react
name: TypeScript + React
description: 一句话说明这条规则约束什么。
tags: [前端, TypeScript]
clients: [cursor, claude, copilot, windsurf]
---
```

4. 正文写规则的**具体内容**，不要写「请遵循最佳实践」这种空话

### 写 Rule 的经验

- 用「做 / 不做」的祈使句，不要用描述句
- 每条规则尽量能被验证（`禁止用 any，除非有注释说明原因` 可以被检查）
- 控制在 100 行以内，太长会挤占上下文预算
- 与其写十条正确的废话，不如写三条真的能改变输出的约束

---

## 三、新增 Skill

Skill 是**可复用的工作流**，回答「这类任务按什么步骤做」。

frontmatter 与 Rule 相同，正文用编号步骤写清流程，包含：

- 触发条件（什么时候用）
- 步骤
- 每步的产出
- 什么时候该停下来问人

---

## CI 会检查什么

```bash
node scripts/validate.mjs
```

- JSON 能被解析、必填字段齐全、`id` 与文件名一致、`category` 在枚举内
- `rules/` 和 `skills/` 的 frontmatter 完整且 `id` 与文件名一致
- 拒绝空描述、超长描述
- 检测常见密钥泄漏模式（`sk-...`、`ghp_...`、长 hex）

本地先跑一遍再提交，比等 CI 快得多。

---

## Commit 规范

采用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)：

```
feat(mcp): add notion server
fix(rule): correct cursor rules path
docs: clarify dry-run output
```

---

## 行为准则

只讨论技术。不欢迎任何形式的攻击、歧视与广告。维护者保留关闭任何 PR / issue 的权利。
