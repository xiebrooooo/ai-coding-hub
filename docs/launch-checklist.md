# 发布清单

这个文件是给仓库主人看的。**发布前把下面每一条打勾。**
本文件不参与安装流程，可以在正式开源后删掉或移到 wiki。

---

## A. 占位符 ✅ 已完成

仓库 owner 为 **`xiebrooooo`**，所有链接已指向
`https://github.com/xiebrooooo/ai-coding-hub`，LICENSE 作者已填写。

**如果你是 fork 这个仓库**，把 `xiebrooooo` 换成你自己的用户名：

```bash
grep -rln "xiebrooooo" --include="*.md" --include="*.yml" --include="*.sh" --include="*.ps1" .
```

涉及文件：`README.md`、`README.en.md`、`install/install.sh`、`install/install.ps1`、`LICENSE`。

## B. 建仓库 ✅ 已完成

```bash
git init -b main
git add -A
git commit -m "feat: AI Coding Hub 首发"
gh repo create ai-coding-hub --public --source=. --remote=origin --push \
  --description "Curated MCP servers, rules and skills for AI coding assistants..."
```

### 仓库设置

| 项 | 值 |
| --- | --- |
| Description | `Curated MCP servers, rules and skills for AI coding assistants — one command installs them into Claude Code, Cursor, VS Code and Windsurf.` |
| Topics | `mcp` `model-context-protocol` `claude-code` `cursor` `ai-agents` `awesome-list` `developer-tools` `copilot` `windsurf` `prompt-engineering` `agents-md` `cline` |

- [x] Issues 已开启（收反馈）
- [ ] Discussions（可选，想法多起来再开）
- [ ] social preview 图（仓库 Settings 里有上传入口，640×320，**建议尽快补上——链接被转发时的第一印象**）

---

## C. 前 24 小时：集中打一次

**不要分散发。** 挑一个你方便盯评论的时间点，一次性发出去。

| 渠道 | 要点 |
| --- | --- |
| **Hacker News** | 标题用 `Show HN: ...`，别用「I made」。周二至周四 8-10am ET 最好 |
| **Reddit** | r/ClaudeAI、r/cursor、r/LocalLLaMA、r/programming。**每个版规则不同，先读 sidebar** |
| **V2EX** | 发「分享创造」节点 |
| **掘金 / 少数派** | 写成「我怎么把 AI 助手配置从 2 小时压到 1 分钟」的经历文，比贴仓库链接有效 |
| **X / Twitter** | 配一张 GIF，比文字链接点击率高数倍 |
| **Product Hunt** | 需要提前攒 Hunter，回报周期长，可放第二轮 |

### HN 文案（直接改）

```
Show HN: AI Coding Hub – one command to set up MCP servers and rules for AI coding assistants

Every MCP server's README only documents Claude Desktop. Rules live in scattered gists.
And every time I set up a new machine I redo the whole thing.

This is a repo that collects MCP servers / rules / skills into one schema and installs
them into your client with one command (Claude Code, Cursor, VS Code, Windsurf).

Everything is plain JSON + Markdown, no build step, no dependencies. There's a
--dry-run flag that shows what it would touch without writing anything.

I'd love feedback on the schema and on what's missing.
```

### 中文社区文案（直接改）

```
标题：我受够了每次换电脑都重新配一遍 AI 编程助手，所以做了这个

正文：
配一个「好用」的 AI 编程助手，我大概要花两小时：
翻十几个 MCP 仓库（每个 README 只写 Claude Desktop 的配置）、
从各种 gist 里抄规则、再挨个客户端适配格式……

于是我把这些东西收进一个仓库：统一的 JSON schema 描述，
一条命令装进 Claude Code / Cursor / VS Code / Windsurf，
带 --dry-run，默认不覆盖你的已有配置，规则用托管区块不会污染 AGENTS.md。

现在有 8 个 MCP、6 条规则、4 个工作流。
求各位帮我看看还缺什么，以及哪里设计得不合理。
```

## D. 发出去之后

- [ ] **当天回复每一条评论**。GitHub Trending 的算法看重 issue/commit 活跃度
- [ ] 有人提 PR 时，**2 小时内响应**（哪怕是「我今晚看」）
- [ ] 每周至少合并一次东西，保持 commit 图谱有绿点
- [ ] 在 README 顶部加 `Changelog` 区块，让回访的人看到「这仓库还活着」
- [ ] 三个月后如果还没起量，换个标题重发一次（社区容忍重复，遗忘是常态）

## E. 别做的事

- ❌ 买 star、互赞群刷 star —— 被 GitHub 判定后直接限流
- ❌ 一次性发十个渠道然后失联 —— 评论没人回等于没发
- ❌ 为了冲量收录一堆没人用的条目 —— 会稀释「精选」这个唯一卖点
- ❌ 在别人仓库的 issue 里打广告 —— 会被永久拉黑
