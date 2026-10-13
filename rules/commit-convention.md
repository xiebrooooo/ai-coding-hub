---
id: commit-convention
name: 提交信息规范
description: 规定 Conventional Commits 的写法、语言选择与提交粒度。
tags: [通用, Git]
clients: [cursor, claude, copilot, windsurf]
---

# 提交信息规范

## 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

- `subject` 用祈使句，不超过 50 字符，**结尾不加句号**。
- `scope` 用模块名（`api`、`auth`、`ui`），没有明确模块可省略。
- `body` 每行 72 字符内，说明 **为什么** 改，不是改了什么（diff 已经说明了）。
- 破坏性变更在 footer 写 `BREAKING CHANGE:` 并在 type 后加 `!`。

## type

| type | 用途 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 修 bug |
| `refactor` | 重构，行为不变 |
| `perf` | 性能优化 |
| `docs` | 文档 |
| `test` | 测试 |
| `build` | 构建 / 依赖 |
| `ci` | CI 配置 |
| `chore` | 杂项 |

## 粒度

- 一次提交只做一件事。`feat` 和 `refactor` 不要混在一个提交里。
- 改完一个能自洽、能通过测试的状态就提交，不要攒一天。
- 格式化改动单独成一个提交，别混进功能改动（会淹没真正的 diff）。

## 示例

```
feat(auth): 支持通过 OAuth 登录

第三方登录能显著降低注册流失。旧的密码登录保留，
在用户首次 OAuth 登录时提示绑定。

Closes #412
```

## 语言

跟随仓库现有规范。新仓库统一用中文或统一用英文，**不要中英混写**。
如果仓库里既有中文也有英文提交，用英文（更通用）。