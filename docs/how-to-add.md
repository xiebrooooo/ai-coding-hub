# 5 分钟加一个新条目

## 目标

让别人的客户端里多一个你没花时间调研就装上的好东西。

## 最短路径：加一个 MCP Server

```bash
cp mcps/filesystem.json mcps/你的条目id.json
```

打开改这几个地方：

```json
{
  "id": "你的条目id",          // 必须等于文件名，小写 kebab-case
  "name": "展示名",
  "category": "core",          // core | data | web | devops | ai
  "description": "一句话说清它能干什么，不要写「强大的」",
  "tags": ["官方", "文件", "必备"],   // 1-5 个
  "author": "上游作者",
  "repo": "https://github.com/...",
  "featured": false,           // 只有真正的必备品才设 true
  "install": {
    "claude": {
      "mcpServers": {
        "你的条目id": {
          "command": "npx",
          "args": ["-y", "包名"]
        }
      }
    }
  },
  "env": [],
  "notes": "安全边界 / 使用注意"
}
```

**`\${WORKSPACE}` 这类占位符会被安装脚本替换成用户的项目路径**，直接写进 `args` 就行。
**真正的密钥（token、连接串）不要写死**，用 `\${ENV_NAME}` 占位并加到 `env` 数组里。

然后：

```bash
node scripts/validate.mjs
```

看到 `✅ 全部通过` 就可以提 PR 了。

## 加一条 Rule

1. `cp rules/typescript-react.md rules/你的id.md`
2. 改 frontmatter 的 `id` / `name` / `description` / `tags`
3. 正文写**具体、可验证**的约束

对比一下：

- ❌ 「请遵循最佳实践，写高质量的代码」
- ✅ 「`any` 只在确实无法建模时使用，且必须紧跟一行注释说明原因」

后者才是真正会改变模型输出的东西。

## 加一个 Skill

Skill 回答的是「**这类任务按什么步骤做**」。写的时候想清楚四件事：

1. 什么情况下该用它
2. 分几步，每步做什么
3. 每步的产出是什么
4. 什么时候该停下来问人

## 会被拒绝的 PR

- 需要注册账号 / 付费才能用的服务
- 描述里只有形容词，说不出具体功能
- 配置片段是凭印象编的，没实际跑过
- 提交了真实 token
- 把上游 README 整段复制过来，没有自己的整理

## 提 PR 前自查

```bash
node scripts/validate.mjs   # 必须通过
```

- [ ] `id` 与文件名一致
- [ ] 描述是中文、一句、能说清功能
- [ ] `install` 片段我**本地实际跑过**
- [ ] 没有明文密钥
- [ ] 读过 [CONTRIBUTING.md](../CONTRIBUTING.md) 的质量要求
