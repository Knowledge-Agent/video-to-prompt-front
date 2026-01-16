# 实施计划：首页 SEO 优化

## 概述

将 SeedVR2 首页改造为 SEO 优化的视频+图片增强聚合页面。通过创建新的区块组件、修改现有组件和优化国际化内容，提升搜索引擎排名和用户转化率。

## 任务

- [x] 1. 优化页面元数据和 SEO 配置
  - [x] 1.1 修改页面 metadata 配置
    - 在 `src/app/[locale]/(landing)/page.tsx` 中更新 `generateMetadata`
    - 添加 SEO 优化的 title、description 和 keywords
    - 确保标题长度不超过 60 字符
    - _需求: 1.1, 1.2, 1.3_

  - [x] 1.2 编写页面元数据的单元测试
    - 测试标题包含必要关键词
    - 测试标题长度限制
    - _需求: 1.1, 1.2, 1.3_

- [x] 2. 修改 Hero 区块，添加功能切换
  - [x] 2.1 更新 hero-tool 组件
    - 修改 `src/themes/default/blocks/hero-tool.tsx`
    - 将 H1 标题从 sr-only 改为可见
    - 添加视频/图片功能切换 UI（Toggle 或并排按钮）
    - 添加提示文案 "Free online access, no local installation needed"
    - _需求: 2.1, 2.2, 2.3, 2.4_

  - [x] 2.2 更新 hero-tool 的国际化内容
    - 修改 `src/config/locale/messages/en/pages/index.json`
    - 修改 `src/config/locale/messages/zh/pages/index.json`
    - 添加 switchLabel 和 hint 字段
    - _需求: 2.1, 2.3, 8.1, 8.2_

  - [ ]* 2.3 编写 Hero 区块的属性测试
    - **属性 1: SEO 标题完整性**
    - **属性 2: H1 标题唯一性**
    - **验证: 需求 1.1, 2.1**

- [x] 3. 创建视频增强专区区块
  - [x] 3.1 创建 video-upscaler 组件
    - 新建 `src/themes/default/blocks/video-upscaler.tsx`
    - 实现 H2 标题 "Professional SeedVR2 Video Upscaler"
    - 展示 4K/8K、Motion Consistency 等特性（三列卡片布局）
    - 添加视频对比效果展示区域（使用图片占位符）
    - 嵌入长尾关键词（upscale anime video, video restoration）
    - _需求: 3.1, 3.2, 3.3, 3.5_

  - [x] 3.2 添加视频区块的国际化内容
    - 在 `src/config/locale/messages/en/pages/index.json` 添加 video-upscaler 配置
    - 在 `src/config/locale/messages/zh/pages/index.json` 添加视频区块配置
    - 确保 Alt 文本包含 "SeedVR2 video upscaler comparison example"
    - _需求: 3.1, 3.4, 3.5, 8.1, 8.2_

  - [x] 3.3 在 index.tsx 中导出 video-upscaler 组件
    - 修改 `src/themes/default/blocks/index.tsx`
    - 添加 `export * from './video-upscaler';`
    - _需求: 3.1_

  - [ ]* 3.4 编写视频区块的属性测试
    - **属性 3: H2 标题关键词覆盖**
    - **属性 4: Alt 文本 SEO 优化**
    - **属性 5: 长尾关键词嵌入**
    - **验证: 需求 3.1, 3.4, 3.5**

- [x] 4. 创建图片增强专区区块
  - [x] 4.1 创建 image-upscaler 组件
    - 新建 `src/themes/default/blocks/image-upscaler.tsx`
    - 实现 H2 标题 "High-Fidelity SeedVR2 Image Upscaler"
    - 强调修复 Artifacts、对角线条纹功能（三列卡片布局）
    - 添加图片对比效果展示区域（使用图片占位符）
    - 嵌入长尾关键词（photo restoration, image detail enhancement）
    - 参考 video-upscaler 组件的布局风格
    - _需求: 4.1, 4.2, 4.3, 4.5_

  - [x] 4.2 添加图片区块的国际化内容
    - 在 `src/config/locale/messages/en/pages/index.json` 添加 image-upscaler 配置
    - 在 `src/config/locale/messages/zh/pages/index.json` 添加图片区块配置
    - 确保 Alt 文本包含 "SeedVR2 image upscaler" 关键词
    - _需求: 4.1, 4.4, 4.5, 8.1, 8.2_

  - [x] 4.3 在 index.tsx 中导出 image-upscaler 组件
    - 修改 `src/themes/default/blocks/index.tsx`
    - 添加 `export * from './image-upscaler';`
    - _需求: 4.1_

  - [ ]* 4.4 编写图片区块的属性测试
    - **属性 4: Alt 文本 SEO 优化**
    - **属性 5: 长尾关键词嵌入**
    - **验证: 需求 4.4, 4.5**

- [x] 5. 创建在线版优势区块
  - [x] 5.1 创建 why-online 组件
    - 新建 `src/themes/default/blocks/why-online.tsx`
    - 实现 H2 标题 "Why Use SeedVR2 Online? (No GPU & No OOM)"
    - 三列布局展示优势（硬件、便捷性、速度）
    - 嵌入痛点关键词（OOM, VRAM, ComfyUI, workflow）
    - 参考 video-upscaler 组件的布局风格
    - _需求: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 5.2 添加优势区块的国际化内容
    - 在 `src/config/locale/messages/en/pages/index.json` 添加 why-online 配置
    - 在 `src/config/locale/messages/zh/pages/index.json` 添加优势区块配置
    - _需求: 5.1, 5.6, 8.1, 8.2_

  - [x] 5.3 在 index.tsx 中导出 why-online 组件
    - 修改 `src/themes/default/blocks/index.tsx`
    - 添加 `export * from './why-online';`
    - _需求: 5.1_

  - [ ]* 5.4 编写优势区块的属性测试
    - **属性 3: H2 标题关键词覆盖**
    - **属性 5: 长尾关键词嵌入**
    - **验证: 需求 5.1, 5.6**

- [x] 6. 优化 FAQ 区块
  - [x] 6.1 更新 FAQ 内容
    - 修改 `src/config/locale/messages/en/pages/index.json` 的 faq 部分
    - 修改 `src/config/locale/messages/zh/pages/index.json` 的 faq 部分
    - 添加 SEO 优化问题：
      - "Is SeedVR2 free to use online?"
      - "Can I upscale anime videos with SeedVR2?"
      - "How does SeedVR2 compare to FlashVSR?"
    - _需求: 6.1, 6.2, 6.3, 6.4, 8.1, 8.2_

  - [ ]* 6.2 编写 FAQ 区块的属性测试
    - **属性 6: FAQ 关键词覆盖**
    - **验证: 需求 6.1, 6.2, 6.3, 6.4**

- [x] 7. 更新页面区块顺序
  - [x] 7.1 修改 show_sections 配置
    - 在 `src/config/locale/messages/en/pages/index.json` 更新 show_sections
    - 在 `src/config/locale/messages/zh/pages/index.json` 更新 show_sections
    - 确保区块顺序为：hero-tool → video-upscaler → image-upscaler → why-online → before-after-showcase → features-demo → use-cases → faq → cta
    - _需求: 3.1, 4.1, 5.1_

- [x] 8. 检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户

- [-] 9. 实现锚点导航功能
  - [-] 9.1 添加锚点导航逻辑
    - 在 header 导航配置中添加 Video Upscaler 和 Image Upscaler 锚点链接
    - 修改 `src/config/locale/messages/en/landing.json` 和 `src/config/locale/messages/zh/landing.json` 的 header.nav.items
    - 添加指向 `/#video-upscaler` 和 `/#image-upscaler` 的导航项
    - _需求: 7.1, 7.2_

  - [x] 9.2 处理直接访问锚点 URL
    - 已创建 `src/shared/blocks/common/anchor-scroll-handler.tsx`
    - 在页面加载时检查 URL 中的锚点
    - 自动滚动到对应区块
    - _需求: 7.3_

  - [x] 9.3 在首页布局中集成 AnchorScrollHandler
    - 已在 `src/app/[locale]/(landing)/layout.tsx` 中引入 AnchorScrollHandler 组件
    - 锚点滚动功能在页面加载时生效
    - _需求: 7.3_

  - [ ]* 9.4 编写锚点导航的属性测试
    - **属性 7: 锚点导航一致性**
    - **验证: 需求 7.1, 7.2, 7.3**

- [ ]* 10. 编写国际化完整性测试
  - [ ]* 10.1 编写国际化属性测试
    - **属性 8: 国际化内容完整性**
    - **验证: 需求 8.1, 8.2, 8.3, 8.4**

- [ ]* 11. 编写 E2E 测试
  - [ ]* 11.1 编写 SEO 元数据 E2E 测试
    - 使用 Playwright 验证页面标题、描述、关键词
    - 验证 Open Graph 标签
    - _需求: 1.1, 1.2_

  - [ ]* 11.2 编写用户流程 E2E 测试
    - 测试功能切换流程
    - 测试锚点导航用户体验
    - 测试响应式布局
    - _需求: 2.2, 7.1, 7.2_

  - [ ]* 11.3 编写性能 E2E 测试
    - 测试首屏加载时间
    - 测试图片懒加载
    - 测试平滑滚动性能

- [ ] 12. 最终检查点
  - 确保所有测试通过，如有问题请询问用户

## 注意事项

- 所有新建组件应遵循项目的 TypeScript 和 React 19 规范
- 使用 `cn()` 工具函数合并 Tailwind 类名
- 所有用户可见文本必须通过 next-intl 国际化
- 参考现有组件（use-cases, before-after-showcase, video-upscaler）的布局风格保持一致性
- 确保所有图片包含 SEO 优化的 Alt 文本
- 属性测试最少运行 100 次迭代
- 标记为 `*` 的任务为可选任务，可以跳过以加快 MVP 开发
- 新建的区块组件需要在 `src/themes/default/blocks/index.tsx` 中导出
