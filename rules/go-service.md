---
id: go-service
name: Go Service
description: 约束 Go 服务的错误处理、context 传递、并发安全与接口设计。
tags: [后端, Go]
clients: [cursor, claude, copilot, windsurf]
---

# Go 服务规则

## 错误

- 每个返回的 `error` 都要处理。`_ =` 丢弃 error 必须写注释说明。
- 用 `fmt.Errorf("...: %w", err)` 包装，保留调用链。不要 `%v` 丢掉原始 error。
- 用 `errors.Is` / `errors.As` 判断，不要比较 error 字符串。
- `panic` 只用于「程序不可能继续运行」的场景（初始化失败）。不用它做控制流。
- 错误信息小写开头，不加标点，保留上下文：`"load config: open file: permission denied"`。

## context

- 所有跨进程边界、可能阻塞、可能耗时的函数，第一个参数都是 `context.Context`。
- 不要把 context 存进 struct 字段。
- 不要传 `nil` context，用 `context.TODO()` 并尽快替换。

## 并发

- 每个 goroutine 都要有明确的退出条件。启动前想清楚它怎么结束。
- 共享状态用 channel 或 `sync.Mutex`，不要靠「应该不会同时访问」。
- 循环里启动 goroutine 时注意闭包变量捕获（Go 1.22 前需显式传参）。
- 用 `errgroup` 处理「一组任务，任一失败就整体失败」。

## 接口

- 接口定义在**使用方**，不在实现方。
- 接口尽量小，1–3 个方法。`io.Reader` 只有一个方法是有原因的。
- 不要为了 mock 提前抽接口，先写具体类型。

## 测试

- 表驱动测试为主。
- 用 `t.Run` 命名子用例，失败时能直接定位。
- 外部依赖（DB、HTTP）用接口 + 假实现，不要在单测里起真实服务。

## 禁止

- 不引入新依赖，除非我问你并给出理由。
- 不用 `init()` 做业务初始化，用显式的 `NewXxx()`。