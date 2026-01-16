# 博客图片资源目录

本目录存放所有博客文章使用的图片资源。

## 📁 目录结构

```
public/imgs/blog/
├── README.md                          # 本文件
├── [通用图片]
│   ├── oom-error-screenshot.png      # CUDA OOM 错误截图
│   ├── comfyui-complex-workflow.png  # ComfyUI 复杂节点图
│   ├── terminal-installation.png     # 终端安装过程
│   ├── seedvr2-online-interface.png  # 在线工具界面
│   ├── model-download-progress.png   # 模型下载进度
│   └── comfyui-processing.png        # ComfyUI 处理界面
│
├── [对比图片]
│   ├── architecture-comparison.png   # 建筑细节前后对比
│   ├── anime-hair-comparison.png     # 动漫头发前后对比
│   ├── fabric-texture-comparison.png # 织物纹理对比
│   ├── blinds-comparison.png         # 百叶窗对比
│   └── video-upscaling-example.png   # 视频放大示例
│
├── [信息图表]
│   ├── vram-comparison-chart.png     # 显存需求对比图表
│   ├── local-vs-online-comparison.png # 本地 vs 在线对比
│   ├── gpu-price-comparison.png      # GPU 价格对比
│   ├── problem-patterns-grid.png     # 问题图案网格
│   └── seedvr2-dit-architecture.png  # DiT 架构图
│
├── [界面截图]
│   ├── step1-upload.png              # 步骤1：上传界面
│   ├── step2-settings.png            # 步骤2：设置面板
│   ├── step3-download.png            # 步骤3：下载界面
│   ├── video-upscaler-interface.png  # 视频放大器界面
│   ├── image-upscaler-interface.png  # 图片放大器界面
│   ├── image-upload-interface.png    # 图片上传界面
│   ├── enhancement-presets.png       # 增强预设
│   ├── advanced-settings.png         # 高级设置
│   └── processing-results.png        # 处理结果
│
└── [Hero 图片]
    ├── oom-fix-hero.jpg              # OOM 修复文章头图
    ├── no-comfyui-hero.jpg           # ComfyUI 文章头图
    └── diagonal-fix-hero.jpg         # 伪影修复文章头图
```

## 🎨 图片规格建议

### Hero 图片（文章头图）
- **尺寸**: 1200x630px (OG Image 标准)
- **格式**: JPG (优化后 < 200KB)
- **用途**: 社交媒体分享、文章顶部展示

### 截图类图片
- **尺寸**: 1920x1080px 或实际截图尺寸
- **格式**: PNG (保持清晰度)
- **用途**: 界面展示、操作步骤

### 对比图片
- **尺寸**: 1600x900px (16:9 比例)
- **格式**: PNG 或 JPG
- **布局**: 左右对比或上下对比
- **标注**: 添加 "Before" / "After" 标签

### 信息图表
- **尺寸**: 1200x800px
- **格式**: PNG (支持透明背景)
- **风格**: 简洁、清晰、品牌色
- **字体**: 使用系统字体或品牌字体

## 📝 图片命名规范

### 规则
1. 使用小写字母和连字符
2. 描述性命名，避免 `img1.png`
3. 包含文章关键词（SEO 优化）
4. 添加类型后缀（可选）

### 示例
```
✅ 好的命名
- seedvr2-oom-error-screenshot.png
- comfyui-node-connection-example.png
- video-upscaling-before-after.png

❌ 不好的命名
- IMG_001.png
- screenshot.png
- pic1.jpg
```

## 🖼️ 图片优化

### 压缩工具
- [TinyPNG](https://tinypng.com/) - PNG/JPG 压缩
- [Squoosh](https://squoosh.app/) - 在线图片优化
- [ImageOptim](https://imageoptim.com/) - Mac 批量压缩

### 优化目标
- **JPG**: 质量 80-85，< 200KB
- **PNG**: 使用 8-bit 色彩，< 500KB
- **WebP**: 现代浏览器优先格式

### Next.js Image 组件
```tsx
import Image from 'next/image';

<Image
  src="/imgs/blog/example.png"
  alt="描述性文字"
  width={1200}
  height={630}
  priority={false} // 首屏图片设为 true
/>
```

## 🎯 SEO 优化

### Alt 文本规范
```markdown
✅ 好的 Alt 文本
![SeedVR2 CUDA out of memory error screenshot showing GPU memory allocation failure](/imgs/blog/oom-error-screenshot.png)

❌ 不好的 Alt 文本
![error](/imgs/blog/oom-error-screenshot.png)
```

### 文件名 SEO
- 包含目标关键词
- 使用连字符分隔单词
- 避免特殊字符和空格

## 📊 当前需要的图片清单

### 🔴 高优先级（核心文章必需）

#### Hero 图片（文章头图）
- [ ] `oom-fix-hero.jpg` - OOM 修复文章头图
- [ ] `no-comfyui-hero.jpg` - ComfyUI 文章头图
- [ ] `diagonal-fix-hero.jpg` - 伪影修复文章头图

#### 对比图片（展示效果）
- [ ] `architecture-comparison.png` - 建筑细节前后对比
- [ ] `anime-hair-comparison.png` - 动漫头发前后对比
- [ ] `fabric-texture-comparison.png` - 织物纹理对比
- [ ] `blinds-comparison.png` - 百叶窗对比

#### 技术图表（说明原理）
- [ ] `seedvr2-dit-architecture.png` - DiT 架构图
- [ ] `problem-patterns-grid.png` - 问题图案网格
- [ ] `generative-process-diagram.png` - 生成过程图
- [ ] `diagonal-artifacts-before.png` - 伪影示例

**总计**: 11 张图片

### 📝 AI 生成提示词

所有图片的详细 AI 生成提示词请查看：
👉 [AI-PROMPTS.md](./AI-PROMPTS.md)

包含：
- Midjourney 提示词
- DALL-E 提示词  
- Stable Diffusion 提示词
- 生成技巧和参数说明

## 🎨 设计建议

### 配色方案
- **主色**: 与品牌色保持一致
- **对比色**: 用于 Before/After 标签
- **背景色**: 浅色或透明

### 标注样式
```
Before → After
原图 → 处理后
低分辨率 → 高分辨率
```

### 箭头和图标
- 使用简洁的箭头指示方向
- 添加放大镜图标表示细节
- 使用勾选/叉号表示优劣

## 🔧 图片生成工具

### 截图工具
- **Mac**: Cmd + Shift + 4
- **Windows**: Win + Shift + S
- **Chrome**: DevTools 设备模拟

### 设计工具
- [Figma](https://figma.com) - 专业设计
- [Canva](https://canva.com) - 快速制图
- [Excalidraw](https://excalidraw.com) - 手绘风格图表

### AI 生成
- [Midjourney](https://midjourney.com) - Hero 图片
- [DALL-E](https://openai.com/dall-e) - 概念图
- [Stable Diffusion](https://stability.ai) - 本地生成

## 📱 响应式考虑

### 移动端优化
- 确保文字在小屏幕上可读
- 对比图使用上下布局而非左右
- 避免过小的细节

### 加载性能
- 使用 Next.js Image 自动优化
- 懒加载非首屏图片
- 提供低质量占位符（LQIP）

## 🚀 快速开始

### 1. 创建占位图（开发阶段）
```bash
# 使用 placeholder.com
https://via.placeholder.com/1200x630/0070f3/ffffff?text=Hero+Image

# 或使用 unsplash
https://source.unsplash.com/1200x630/?technology,ai
```

### 2. 替换为真实图片
- 截取实际界面
- 设计对比图
- 优化压缩

### 3. 更新 Alt 文本
- 在 MDX 文件中添加描述性 alt
- 包含关键词但保持自然

## 📚 相关资源

- [Web.dev 图片优化指南](https://web.dev/fast/#optimize-your-images)
- [Next.js Image 组件文档](https://nextjs.org/docs/api-reference/next/image)
- [Google 图片 SEO 最佳实践](https://developers.google.com/search/docs/advanced/guidelines/google-images)
