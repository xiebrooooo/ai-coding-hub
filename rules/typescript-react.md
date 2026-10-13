---
id: typescript-react
name: TypeScript + React
description: 约束 TypeScript / React 前端项目的类型严格度、组件写法与状态管理边界。
tags: [前端, TypeScript, React]
clients: [cursor, claude, copilot, windsurf]
---

# TypeScript + React 规则

## 类型

- 开启 `strict`。不要为了绕过报错去关 `strictNullChecks` 或加 `// @ts-ignore`。
- `any` 只在确实无法建模时使用，且必须紧跟一行注释说明原因。优先 `unknown` + 类型收窄。
- 对外部数据（API 响应、localStorage、URL 参数）一律先当 `unknown`，用 schema 校验后再使用。不要直接 `as` 成业务类型。
- 类型从数据推导，不要手写两份。用 `ReturnType`、`Parameters`、`satisfies` 保持单一事实来源。

## 组件

- 只用函数组件。不新增 class 组件。
- Props 用 `type` 而不是 `interface`（保持项目内一致，若项目已用 interface 则跟随）。
- 组件文件超过 200 行就拆。一个组件只负责一件事。
- 不要在组件内部定义子组件（会导致每次渲染都重建，状态丢失）。

## 状态

- **能从已有状态算出来的，不要存成新状态**。用 `const fullName = first + last`，不要 `useState` + `useEffect` 同步。
- `useEffect` 只用于和外部系统同步（订阅、DOM 操作、定时器）。不用于数据流转换。
- 服务端数据用 TanStack Query / SWR 之类管理，不要手写 `useEffect` + `loading` 三件套。
- 跨多层的全局状态才上 store。先试 `useState`，再试提状态，最后才考虑全局。

## 渲染

- 列表 `key` 用稳定业务 id，不要用数组下标。
- 条件渲染用 `&&` 时注意 `0` 和 `''` 会被渲染出来，改用三元或 `Boolean()`。
- 每个路由级组件外面要有错误边界。

## 禁止

- 不引入新的 UI 库 / 状态库 / 工具库，除非我问你并给出理由。
- 不为「以后可能要用」预先抽象。第二次重复时再抽。
- 不重写与当前任务无关的文件。