# 设计文档：首页 SEO 优化

## 概述

本设计文档描述了如何将 SeedVR2 首页从单一视频增强页面改造为同时支持视频和图片增强的 SEO 优化页面。通过结构化的区块布局和关键词优化，提升搜索引擎排名和用户转化率。

设计遵循现有的 Next.js 16 + React 19 架构，使用 next-intl 进行国际化，通过主题系统实现区块化布局。

## 架构

### 整体架构

```
首页 SEO 优化架构
├── 页面层 (src/app/[locale]/(landing)/page.tsx)
│   └── 使用 getMetadata 生成 SEO 优化的元数据
├── 主题层 (src/themes/default/pages/dynamic-page.tsx)
│   └── 动态加载区块组件
├── 区块层 (src/themes/default/blocks/)
│   ├── hero-tool.tsx (修改：添加视频/图片切换)
│   ├── video-upscaler.tsx (新建：视频增强专区)
│   ├── image-upscaler.tsx (新建：图片增强专区)
│   ├── why-online.tsx (新建：在线版优势)
│   ├── faq.tsx (修改：添加 SEO 优化问题)
│   └── cta.tsx (保持现有)
└── 国际化层 (src/config/locale/messages/)
    ├── en/pages/index.json (修改：英文 SEO 内容)
    └── zh/pages/index.json (修改：中文 SEO 内容)
```

### 页面区块流程

```
用户访问首页
    ↓
加载 SEO 优化的 metadata
    ↓
渲染 Hero 区块 (H1 + 工具切换)
    ↓
渲染视频增强区块 (H2 + 视频关键词)
    ↓
渲染图片增强区块 (H2 + 图片关键词)
    ↓
渲染在线版优势区块 (H2 + 痛点关键词)
    ↓
渲染现有区块 (features-demo, use-cases)
    ↓
渲染 FAQ 区块 (长尾关键词)
    ↓
渲染 CTA 区块
```

## 组件和接口

### 1. 页面元数据配置

**文件**: `src/app/[locale]/(landing)/page.tsx`

**修改内容**:
```typescript
export const generateMetadata = getMetadata({
  metadataKey: 'common.metadata',
  canonicalUrl: '/',
  // 新增 SEO 优化字段
  title: 'SeedVR2 Online: AI Video & Image Upscaler (No GPU Required)',
  description: 'Professional AI upscaler for videos and images. Upscale to 4K/8K, fix artifacts, restore details. No GPU, no ComfyUI setup needed.',
  keywords: [
    'SeedVR2',
    'AI video upscaler',
    'image upscaler',
    'video restoration',
    'photo restoration',
    'no GPU',
    'online upscaler'
  ]
});
```

### 2. Hero 区块修改

**文件**: `src/themes/default/blocks/hero-tool.tsx`

**修改内容**:
- 添加 H1 标题（当前是 sr-only）
- 添加视频/图片功能切换 UI
- 添加微文案提示

**新增接口**:
```typescript
interface HeroToolSection extends Section {
  title: string;           // H1 标题
  description: string;     // 副标题
  switchLabel: {
    video: string;         // "Upscale Video"
    image: string;         // "Upscale Image"
  };
  hint: string;           // "Free online access, no local installation needed"
  background_image: {
    src: string;
    alt: string;
  };
}
```

### 3. 视频增强区块（新建）

**文件**: `src/themes/default/blocks/video-upscaler.tsx`

**功能**:
- 显示 H2 标题 "Professional SeedVR2 Video Upscaler"
- 强调 4K/8K、Motion Consistency
- 展示视频对比效果（复用 before-after-showcase 组件）
- 嵌入长尾关键词

**接口**:
```typescript
interface VideoUpscalerSection extends Section {
  id: 'video-upscaler';
  title: string;          // H2 标题
  description: string;    // 描述文字
  features: Array<{
    title: string;
    description: string;
    keywords: string[];   // 长尾关键词
  }>;
  comparison: {
    before: string;
    after: string;
    alt: string;          // SEO Alt 文本
  };
}
```

### 4. 图片增强区块（新建）

**文件**: `src/themes/default/blocks/image-upscaler.tsx`

**功能**:
- 显示 H2 标题 "High-Fidelity SeedVR2 Image Upscaler"
- 强调修复 Artifacts、对角线条纹
- 展示图片对比效果
- 嵌入长尾关键词

**接口**:
```typescript
interface ImageUpscalerSection extends Section {
  id: 'image-upscaler';
  title: string;          // H2 标题
  description: string;    // 描述文字
  features: Array<{
    title: string;
    description: string;
    keywords: string[];   // 长尾关键词
  }>;
  comparison: {
    before: string;
    after: string;
    alt: string;          // SEO Alt 文本
  };
}
```

### 5. 在线版优势区块（新建）

**文件**: `src/themes/default/blocks/why-online.tsx`

**功能**:
- 显示 H2 标题 "Why Use SeedVR2 Online? (No GPU & No OOM)"
- 三列布局展示优势
- 嵌入痛点关键词（OOM、VRAM、ComfyUI）

**接口**:
```typescript
interface WhyOnlineSection extends Section {
  id: 'why-online';
  title: string;          // H2 标题
  description: string;
  advantages: Array<{
    icon: string;
    title: string;
    description: string;
    keywords: string[];   // 痛点关键词
  }>;
}
```

### 6. FAQ 区块修改

**文件**: `src/themes/default/blocks/faq.tsx`

**修改内容**:
- 添加 SEO 优化的问题
- 确保问题包含长尾关键词

**新增问题**:
```typescript
const seoQuestions = [
  {
    question: "Is SeedVR2 free to use online?",
    answer: "...",
    keywords: ["free"]
  },
  {
    question: "Can I upscale anime videos with SeedVR2?",
    answer: "...",
    keywords: ["anime", "upscale anime video"]
  },
  {
    question: "How does SeedVR2 compare to FlashVSR?",
    answer: "...",
    keywords: ["FlashVSR", "comparison"]
  }
];
```

### 7. 锚点导航功能

**实现方式**:
- 使用 Next.js 的 `useRouter` 和 `usePathname`
- 监听锚点变化，平滑滚动到对应区块
- 更新 URL 而不刷新页面

**代码示例**:
```typescript
// 在 header 或导航组件中
const handleNavClick = (anchor: string) => {
  router.push(`#${anchor}`, { scroll: false });
  document.getElementById(anchor)?.scrollIntoView({ 
    behavior: 'smooth' 
  });
};
```

## 数据模型

### 页面配置数据结构

**文件**: `src/config/locale/messages/en/pages/index.json`

```json
{
  "page": {
    "show_sections": [
      "hero-tool",
      "video-upscaler",
      "image-upscaler",
      "why-online",
      "features-demo",
      "use-cases",
      "faq",
      "cta"
    ],
    "sections": {
      "hero-tool": {
        "block": "hero-tool",
        "id": "hero-tool",
        "title": "Run SeedVR2 Online: The Ultimate AI Upscaler for Video and Images",
        "description": "Professional AI restoration to remove noise, fix artifacts, and restore details",
        "switchLabel": {
          "video": "🎬 Upscale Video",
          "image": "🖼️ Upscale Image"
        },
        "hint": "Free online access, no local installation needed",
        "background_image": {
          "src": "/imgs/bg/tree.jpg",
          "alt": "SeedVR2 AI video and image upscaler"
        }
      },
      "video-upscaler": {
        "block": "video-upscaler",
        "id": "video-upscaler",
        "title": "Professional SeedVR2 Video Upscaler",
        "description": "Upscale videos to 4K/8K with perfect motion consistency",
        "features": [
          {
            "title": "4K/8K Upscaling",
            "description": "Transform low-resolution videos to stunning 4K or 8K quality",
            "keywords": ["4K", "8K", "video upscaling"]
          },
          {
            "title": "Motion Consistency",
            "description": "Maintain smooth motion and frame-to-frame consistency",
            "keywords": ["motion consistency", "temporal coherence"]
          },
          {
            "title": "Video Restoration",
            "description": "Restore old videos and fix compression artifacts",
            "keywords": ["video restoration", "upscale anime video"]
          }
        ],
        "comparison": {
          "before": "/imgs/video-before.jpg",
          "after": "/imgs/video-after.jpg",
          "alt": "SeedVR2 video upscaler comparison example"
        }
      },
      "image-upscaler": {
        "block": "image-upscaler",
        "id": "image-upscaler",
        "title": "High-Fidelity SeedVR2 Image Upscaler",
        "description": "Fix artifacts and enhance image details with AI precision",
        "features": [
          {
            "title": "Artifact Removal",
            "description": "Fix diagonal lines and stripes in AI-generated images",
            "keywords": ["fix artifacts", "fix diagonal lines", "fix stripes"]
          },
          {
            "title": "Detail Enhancement",
            "description": "Restore fine details and textures in photos",
            "keywords": ["photo restoration", "image detail enhancement"]
          },
          {
            "title": "High-Fidelity Output",
            "description": "Produce professional-quality images for printing",
            "keywords": ["high fidelity", "professional quality"]
          }
        ],
        "comparison": {
          "before": "/imgs/image-before.jpg",
          "after": "/imgs/image-after.jpg",
          "alt": "SeedVR2 image upscaler fixing artifacts example"
        }
      },
      "why-online": {
        "block": "why-online",
        "id": "why-online",
        "title": "Why Use SeedVR2 Online? (No GPU & No OOM)",
        "description": "Skip the hassle of local installation and hardware requirements",
        "advantages": [
          {
            "icon": "Cpu",
            "title": "No High-End GPU Needed",
            "description": "Don't worry about VRAM or OOM (Out of Memory) errors. Use our cloud GPU.",
            "keywords": ["no GPU", "OOM", "low vram", "cloud GPU"]
          },
          {
            "icon": "Zap",
            "title": "No ComfyUI Workflow Setup",
            "description": "Forget complex nodes. No need to install python or ComfyUI. Just drag and drop.",
            "keywords": ["no ComfyUI", "workflow", "no installation", "no python"]
          },
          {
            "icon": "Clock",
            "title": "Fast Processing",
            "description": "Get results in seconds with our optimized cloud infrastructure.",
            "keywords": ["fast", "quick", "instant"]
          }
        ]
      },
      "faq": {
        "id": "faq",
        "title": "Frequently Asked Questions About SeedVR2",
        "description": "For more questions, contact support@seedvr2.ai",
        "items": [
          {
            "question": "Is SeedVR2 free to use online?",
            "answer": "SeedVR2 offers both free and premium plans. Free users can process videos up to 720p, while premium users get access to 4K/8K upscaling and faster processing."
          },
          {
            "question": "Can I upscale anime videos with SeedVR2?",
            "answer": "Yes! SeedVR2 is optimized for anime content and can upscale anime videos while preserving the art style and fixing common artifacts."
          },
          {
            "question": "How does SeedVR2 compare to FlashVSR?",
            "answer": "SeedVR2 uses single-step diffusion technology, making it 10x faster than traditional methods like FlashVSR while maintaining superior quality."
          }
        ]
      }
    }
  }
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: SEO 标题完整性

*对于任何*语言版本的首页，页面标题应包含 "SeedVR2"、"Video" 和 "Image" 关键词，且长度不超过 60 个字符。

**验证: 需求 1.1, 1.2, 1.3**

### 属性 2: H1 标题唯一性

*对于任何*首页渲染，页面应只包含一个 H1 标题，且该标题应同时提及视频和图片功能。

**验证: 需求 2.1**

### 属性 3: H2 标题关键词覆盖

*对于任何*首页渲染，应至少包含三个 H2 标题，分别覆盖视频、图片和在线版优势的关键词。

**验证: 需求 3.1, 4.1, 5.1**

### 属性 4: Alt 文本 SEO 优化

*对于任何*对比图片，Alt 属性应包含 "SeedVR2"、功能类型（video/image）和 "upscaler" 关键词。

**验证: 需求 3.4, 4.4**

### 属性 5: 长尾关键词嵌入

*对于任何*功能区块，描述文字应自然嵌入至少 2 个长尾关键词。

**验证: 需求 3.5, 4.5, 5.6**

### 属性 6: FAQ 关键词覆盖

*对于任何*FAQ 区块，应包含至少 3 个问题，分别覆盖 "free"、"anime" 和竞品词。

**验证: 需求 6.1, 6.2, 6.3, 6.4**

### 属性 7: 锚点导航一致性

*对于任何*锚点链接点击，URL 应更新为对应的锚点，且页面应平滑滚动到对应区块。

**验证: 需求 7.1, 7.2, 7.3**

### 属性 8: 国际化内容完整性

*对于任何*支持的语言，所有 SEO 优化内容应完整翻译，且关键词应针对目标语言优化。

**验证: 需求 8.1, 8.2, 8.3, 8.4**

## 错误处理

### 1. 图片加载失败

**场景**: 对比图片无法加载

**处理**:
- 显示占位符图片
- 保留 Alt 文本以维持 SEO 价值
- 记录错误日志

### 2. 锚点不存在

**场景**: 用户访问不存在的锚点

**处理**:
- 平滑滚动到页面顶部
- 不显示错误信息
- 保持 URL 中的锚点（用户可能刷新页面）

### 3. 翻译缺失

**场景**: 某个语言版本的翻译不完整

**处理**:
- 回退到英文内容
- 记录警告日志
- 通知开发团队补充翻译

## 测试策略

### 单元测试

使用 Jest + React Testing Library 测试：

1. **组件渲染测试**
   - 测试每个新建区块是否正确渲染
   - 测试 H1/H2 标题是否正确显示
   - 测试 Alt 文本是否包含关键词

2. **交互测试**
   - 测试功能切换按钮是否工作
   - 测试锚点导航是否正确跳转
   - 测试平滑滚动是否触发

3. **国际化测试**
   - 测试中英文内容是否正确加载
   - 测试翻译缺失时的回退机制

### 属性测试

使用 fast-check 进行属性测试（最少 100 次迭代）：

1. **属性 1 测试**: SEO 标题完整性
   ```typescript
   // Feature: homepage-seo-optimization, Property 1: SEO 标题完整性
   fc.assert(
     fc.property(
       fc.constantFrom('en', 'zh'),
       (locale) => {
         const title = getPageTitle(locale);
         return (
           title.includes('SeedVR2') &&
           (title.includes('Video') || title.includes('视频')) &&
           (title.includes('Image') || title.includes('图片')) &&
           title.length <= 60
         );
       }
     ),
     { numRuns: 100 }
   );
   ```

2. **属性 2 测试**: H1 标题唯一性
   ```typescript
   // Feature: homepage-seo-optimization, Property 2: H1 标题唯一性
   fc.assert(
     fc.property(
       fc.constantFrom('en', 'zh'),
       (locale) => {
         const { container } = render(<HomePage locale={locale} />);
         const h1Elements = container.querySelectorAll('h1:not(.sr-only)');
         const h1Text = h1Elements[0]?.textContent || '';
         return (
           h1Elements.length === 1 &&
           (h1Text.includes('Video') || h1Text.includes('视频')) &&
           (h1Text.includes('Image') || h1Text.includes('图片'))
         );
       }
     ),
     { numRuns: 100 }
   );
   ```

3. **属性 3 测试**: H2 标题关键词覆盖
   ```typescript
   // Feature: homepage-seo-optimization, Property 3: H2 标题关键词覆盖
   fc.assert(
     fc.property(
       fc.constantFrom('en', 'zh'),
       (locale) => {
         const { container } = render(<HomePage locale={locale} />);
         const h2Elements = container.querySelectorAll('h2');
         const h2Texts = Array.from(h2Elements).map(el => el.textContent || '');
         
         const hasVideoH2 = h2Texts.some(text => 
           text.includes('Video') || text.includes('视频')
         );
         const hasImageH2 = h2Texts.some(text => 
           text.includes('Image') || text.includes('图片')
         );
         const hasOnlineH2 = h2Texts.some(text => 
           text.includes('Online') || text.includes('在线')
         );
         
         return hasVideoH2 && hasImageH2 && hasOnlineH2;
       }
     ),
     { numRuns: 100 }
   );
   ```

4. **属性 4 测试**: Alt 文本 SEO 优化
   ```typescript
   // Feature: homepage-seo-optimization, Property 4: Alt 文本 SEO 优化
   fc.assert(
     fc.property(
       fc.constantFrom('en', 'zh'),
       fc.constantFrom('video-upscaler', 'image-upscaler'),
       (locale, sectionId) => {
         const { container } = render(
           <ComparisonSection locale={locale} sectionId={sectionId} />
         );
         const images = container.querySelectorAll('img');
         
         return Array.from(images).every(img => {
           const alt = img.getAttribute('alt') || '';
           return (
             alt.includes('SeedVR2') &&
             alt.includes('upscaler') &&
             (alt.includes('video') || alt.includes('image'))
           );
         });
       }
     ),
     { numRuns: 100 }
   );
   ```

5. **属性 7 测试**: 锚点导航一致性
   ```typescript
   // Feature: homepage-seo-optimization, Property 7: 锚点导航一致性
   fc.assert(
     fc.property(
       fc.constantFrom('video-upscaler', 'image-upscaler', 'why-online'),
       async (anchor) => {
         const { container } = render(<HomePage />);
         const link = container.querySelector(`a[href="#${anchor}"]`);
         
         fireEvent.click(link!);
         await waitFor(() => {
           expect(window.location.hash).toBe(`#${anchor}`);
         });
         
         const targetElement = document.getElementById(anchor);
         return targetElement !== null;
       }
     ),
     { numRuns: 100 }
   );
   ```

### E2E 测试

使用 Playwright 测试：

1. **SEO 元数据测试**
   - 验证页面标题、描述、关键词
   - 验证 Open Graph 标签
   - 验证结构化数据

2. **用户流程测试**
   - 测试从首页到功能切换的完整流程
   - 测试锚点导航的用户体验
   - 测试不同设备上的响应式布局

3. **性能测试**
   - 测试首屏加载时间
   - 测试图片懒加载
   - 测试平滑滚动性能

### 测试覆盖率目标

- 单元测试覆盖率: ≥ 80%
- 属性测试: 每个属性至少 100 次迭代
- E2E 测试: 覆盖所有关键用户流程
