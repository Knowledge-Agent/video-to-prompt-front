# SEO Keyword Mapping (Video to Prompt)

更新时间：2026-03-10

## 1) 输入标准化

- `theme`: video to prompt
- `keyword_source`: 用户提供的全量关键词表（Extraction & Prompting / AI Video Generation / How-To / Specific）
- `site_goal`: 用户上传视频后，生成可用于复现类似视频的提示词

一句话定位：

> 我们为需要复现参考视频风格的创作者与团队，提供“从视频提取提示词并可直接执行”的结构化工作流。

## 2) 关键词分层（按业务匹配度筛选）

### Core（核心词）

- video to prompt
- video to prompt generator
- get prompt from video
- generate prompt from video
- prompt from video

### Topic（主题词）

- video prompt generator
- ai video prompt
- ai video prompts
- video generation prompts
- prompt generator for ai video

### Problem / How-To（问题词）

- how to get prompt of any video
- creating prompt based on video
- video prompt generator form video
- how to write video prompt of good...
- what is best way to write a video prompt...

### Commercial（交易词）

- video to prompt free
- video to prompt generator free
- free video to prompt
- video prompt generator free

### Long-tail / Variant（长尾与变体）

- videotoprompt
- video to promt
- vedio to prompt
- vidoe to prompt
- video propt
- video to promtp

## 3) 关键词唯一映射（Primary Keyword -> Primary URL）

| Primary Keyword | Target URL | Content Type | Priority | Intent Reason |
| --- | --- | --- | --- | --- |
| video to prompt | `/` | Homepage | P0 | 产品主意图词，直接承接“视频转提示词”核心需求 |
| video to prompt generator | `/` | Homepage | P0 | 购买/试用前高意图词，直接指向工具入口 |
| get prompt from video | `/` | Homepage | P0 | 强动作词，最适合首页 Hero + CTA 承接 |
| prompt from video | `/` | Homepage | P1 | 同义高相关词，作为首页次核心词 |
| generate prompt from video | `/blog/how-to-get-prompt-from-video` | Blog Post (How-To) | P0 | 明确教程意图，最适合步骤型文章 |
| how to get prompt of any video | `/blog/how-to-get-prompt-from-video` | Blog Post (How-To) | P0 | 问题型搜索，需首段直接给答案 |
| video prompt generator | `/ai-video-generator` | Tool Page | P1 | 工具词，适合功能页承接与转化 |
| ai video prompt | `/ai-video-generator` | Tool Page | P1 | AI 场景词，适合工具页 metadata 与功能文案 |
| ai video prompts | `/blog` | Blog Hub | P2 | 信息查询意图，适合聚合教程入口 |
| video generation prompts | `/blog/video-prompt-shot-language-framework` | Blog Post (Framework) | P1 | 结构方法词，适合框架类内容承接 |
| prompt for video generation | `/blog/video-prompt-shot-language-framework` | Blog Post (Framework) | P1 | 实操写法词，适合镜头语言文章 |
| creating prompt based on video | `/blog/video-to-prompt-system-design` | Blog Post (System) | P1 | 流程/系统化意图，适合方法论文章 |
| video to prompt quality checks (intent) | `/blog/video-to-prompt-quality-checklist` | Blog Post (Checklist) | P1 | 质检意图，适合清单型内容承接 |

说明：

- 每个主关键词仅绑定一个主 URL，避免首页与博客互相内耗。
- 变体拼写词（如 `video to promt`、`vedio to prompt`）不做主标题关键词，仅在正文/FAQ 轻量覆盖。

## 4) 降级与剔除策略

以下关键词虽有流量，但与当前站点目标存在偏差，降级处理：

- 泛生成词：`ai video generator`、`text to video ai`、`image to video ai`、`free ai video generator`
- 原因：当前产品主能力是“从视频提取提示词”，不是“直接生成最终视频”
- 策略：
  - 不占用首页 title/H1
  - 仅作为辅助语义在工具页/博客上下文出现
  - 后续若产品能力扩展再提升优先级

## 5) 当前轮内容覆盖计划

- 首页 `/`：Core + Topic + Commercial（轻量）
- 工具页 `/ai-video-generator`：Topic 工具词
- 博客聚合 `/blog`：How-To / 教程意图词
- 新文章 `/blog/how-to-get-prompt-from-video`：Problem 词 + 长尾动作词
