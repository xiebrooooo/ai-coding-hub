---
id: python-fastapi
name: Python + FastAPI
description: 约束 Python / FastAPI 服务的类型注解、分层结构、异步边界与错误处理。
tags: [后端, Python, FastAPI]
clients: [cursor, claude, copilot, windsurf]
---

# Python + FastAPI 规则

## 类型

- 所有函数签名必须有类型注解，包括返回值。
- 用 Pydantic 模型作为 I/O 边界：请求体、响应体、配置。内部函数之间传普通对象即可。
- 不用 `Optional[X]` 的旧写法，用 `X | None`（Python 3.10+）。

## 分层

- `router`（路由/校验）→ `service`（业务逻辑）→ `repository`（数据访问）。
- 业务逻辑不写在路由函数里。路由函数超过 15 行就是信号。
- 数据库会话用 `Depends` 注入，不要在模块层创建全局 session。

## 异步

- `async def` 里**不要**调用阻塞函数（`requests`、`time.sleep`、同步 DB 驱动、`open` 大文件）。
  用 `httpx.AsyncClient`、`asyncio.sleep`、异步驱动。
- 确需阻塞时用 `await run_in_threadpool(...)`。
- 不要在请求处理中做 CPU 密集任务，丢给任务队列。

## 错误处理

- 禁止裸 `except:` 和 `except Exception: pass`。
- 对外错误用 `HTTPException` 并给出明确 status code，不要一律 500。
- 业务异常定义自己的异常类，在 `exception_handler` 里统一转成响应。
- 日志里记完整堆栈，返回给客户端的信息要脱敏（不要泄漏 SQL、路径、内部主机名）。

## 数据库

- 用参数化查询。永远不要 f-string 拼 SQL。
- 迁移用 Alembic，不要手改线上表结构。

## 禁止

- 不引入新的框架或 ORM，除非我问你并给出理由。
- 不用 `print` 调试，用 `logger`。