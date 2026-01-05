# api

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

Next.js API 路由层，提供 RESTful 接口。
按业务领域划分子目录，使用 respData/respErr 统一响应格式。

## 文件索引

| 目录/文件 | 功能描述 |
|-----------|----------|
| ai/ | AI 生成和查询接口（generate、query） |
| auth/ | 认证接口（better-auth catch-all） |
| chat/ | 聊天接口（new、list、info、messages） |
| config/ | 配置接口（get-configs） |
| docs/ | 文档接口（search） |
| email/ | 邮件接口（send-email） |
| payment/ | 支付接口（checkout、callback、notify） |
| proxy/ | 代理接口（file） |
| storage/ | 存储接口（upload-image） |
| user/ | 用户接口（get-user-info、get-user-credits、is-email-verified） |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
