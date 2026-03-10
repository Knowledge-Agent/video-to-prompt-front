# SEO Execution Report (Video to Prompt)

执行日期：2026-03-10
执行技能：`seo-intent-keyword-gated`

## 1) 本轮策略

- 以 `video to prompt` 主意图为中心，首页承接转化词，博客承接教程词。
- 避免被泛 `ai video generator` 词绑架，保持“从视频提取提示词”的产品叙事一致性。
- 通过首页 section 文案 + metadata 双层落词，而不是只改 keywords 字段。

## 2) 改动文件

### 首页 SEO 与内容落位

- `src/config/locale/messages/en/pages/index.json`
- `src/config/locale/messages/zh/pages/index.json`
- `src/app/[locale]/(landing)/page.tsx`

改动要点：

- 首页 metadata 重写为 `video to prompt / get prompt from video` 主叙事。
- Hero/Features/Use Cases/FAQ/CTA 文案同步改为高匹配关键词语义。
- `show_sections` 新增 `blog`，并在首页显示精选文章入口。
- 首页代码新增博客数据注入，避免 `blog` 区块空渲染。

### 博客聚合页 SEO

- `src/config/locale/messages/en/pages/blog.json`
- `src/config/locale/messages/zh/pages/blog.json`

改动要点：

- 博客 metadata 转向 How-To 问题词：`how to get prompt of any video`、`generate prompt from video`。
- 列表页标题/描述改为“教程与可复用流程”导向。

### 新增教程文章（承接 How-To 搜索）

- `content/posts/how-to-get-prompt-from-video.mdx`
- `content/posts/how-to-get-prompt-from-video.zh.mdx`

改动要点：

- 结构遵循：结论先行 -> 场景定义 -> 分步骤 -> 对比 -> 常见错误 -> FAQ -> CTA。
- 每篇覆盖 1 个主关键词 + 3-6 个相关词。
- 每篇包含 3+ 站内内链（首页 + 3 篇核心文章）。
- 图片落位：封面图 + 正文图，且 alt 含语义关键词。

### 关键词映射产物

- `docs/seo/SEO_KEYWORD_MAPPING.md`

## 3) 质检结果

检查项与结果：

1. 关键词-URL 唯一映射：通过（见 `SEO_KEYWORD_MAPPING.md`）
2. 首页 metadata 与 section 文案一致性：通过
3. `show_sections` 变更后关键词落位：通过（新增 `blog` 且已注入数据）
4. 文章 `title/description` 唯一性：通过（新增文章标题与摘要未重复）
5. frontmatter YAML 可解析性：通过（新增中英文章 frontmatter 完整）
6. 内链数量与指向：通过（每篇 >=3 条）
7. 图片段落相关性：通过
8. JSON 语法检查：通过（本地 `node` 解析成功）

## 4) 未完成与风险

- 未执行 `eslint` / `tsc`：当前环境缺少本地依赖二进制（`eslint: command not found`，`node_modules/.bin/tsc` 不存在）。
- 建议在安装依赖后补跑：
  - `pnpm install`
  - `pnpm lint`
  - `pnpm test`

## 5) 下一轮建议

- 增补 2-3 篇问题型长尾文章（例如 `video prompt generator from video`、`text to video prompt examples`）。
- 为 `/ai-video-generator` 增加更明确的“不是直接出视频，而是输出提示词包”说明，继续压低错配流量。
