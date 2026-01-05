# extensions

<!-- 一旦我所属的文件夹有所变化，请更新我 -->

## 架构说明

可插拔集成层，封装第三方服务的适配器。
每个子目录对应一类服务，通过 index.ts 导出统一接口，支持多提供商切换。

## 文件索引

| 目录/文件 | 功能描述 |
|-----------|----------|
| ads/ | 广告服务（AdSense） |
| affiliate/ | 联盟营销（Affonso、PromoteKit） |
| ai/ | AI 提供商（Replicate、Gemini、Fal、Kie） |
| analytics/ | 数据分析（GA、Plausible、Clarity、OpenPanel） |
| customer-service/ | 客服系统（Crisp、Tawk） |
| email/ | 邮件服务（Resend） |
| payment/ | 支付网关（Stripe、PayPal、Creem） |
| storage/ | 文件存储（S3、R2） |

## 更新提醒

任何文件变更后，请更新此文档和相关的上级文档。
