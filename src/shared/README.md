# shared

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

共享代码层，包含可复用的 UI 组件、业务逻辑、工具函数和数据模型。
按职责划分为 blocks（业务区块）、components（UI 组件）、models（数据模型）等子目录。

## 文件索引

| 目录/文件 | 功能描述 |
|-----------|----------|
| blocks/ | 业务 UI 区块（chat、form、table、dashboard 等） |
| components/ | UI 组件库（shadcn/ui、magicui、ai-elements） |
| contexts/ | React Context（app、chat） |
| hooks/ | 自定义 Hooks（media-query、mobile） |
| lib/ | 工具函数（cn、cache、rate-limit、seo 等） |
| models/ | 数据模型和查询（user、order、credit 等） |
| services/ | 业务服务层（payment、analytics、email 等） |
| types/ | TypeScript 类型定义 |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
