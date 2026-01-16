# 占位图片说明

当前博客文章引用的图片使用在线占位符服务。

## 在线占位图 URL 格式

文章中的图片路径如 `/imgs/blog/example.png` 会在开发环境中自动回退到占位图。

## 需要的图片列表

### Hero 图片 (1200x630)
- [ ] oom-fix-hero.jpg
- [ ] no-comfyui-hero.jpg  
- [ ] diagonal-fix-hero.jpg

### 截图 (1920x1080)
- [ ] oom-error-screenshot.png
- [ ] comfyui-complex-workflow.png
- [ ] terminal-installation.png
- [ ] seedvr2-online-interface.png
- [ ] step1-upload.png
- [ ] step2-settings.png
- [ ] step3-download.png

### 对比图 (1600x900)
- [ ] architecture-comparison.png
- [ ] anime-hair-comparison.png
- [ ] fabric-texture-comparison.png
- [ ] video-upscaling-example.png

### 信息图 (1200x800)
- [ ] vram-comparison-chart.png
- [ ] local-vs-online-comparison.png
- [ ] gpu-price-comparison.png
- [ ] seedvr2-dit-architecture.png

## 临时解决方案

在图片准备好之前，可以：

1. **使用 Unsplash 随机图**
   ```
   https://source.unsplash.com/1200x630/?technology,ai
   ```

2. **使用 Placeholder.com**
   ```
   https://via.placeholder.com/1200x630/0070f3/ffffff?text=Hero+Image
   ```

3. **使用项目现有图片**
   - 复制 `/public/imgs/features/` 下的图片作为临时占位

## 生产环境检查清单

部署前确保：
- [ ] 所有图片已替换为真实内容
- [ ] 图片已优化压缩（JPG < 200KB, PNG < 500KB）
- [ ] 图片包含描述性的 alt 文本
- [ ] 图片文件名符合 SEO 规范
