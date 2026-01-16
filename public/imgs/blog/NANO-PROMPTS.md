# Nano AI 图片生成提示词

针对 Nano/Flux 等现代 AI 图片生成工具优化的提示词。

---

## 🎨 Hero 图片 (1200x630)

### 1. oom-fix-hero.jpg
**文件名**: `oom-fix-hero.jpg`  
**尺寸**: 1200x630px  
**用途**: OOM 修复文章头图

**Nano 提示词**:
```
A modern tech blog header showing a computer screen with red "CUDA Out of Memory" error text, dark blue and purple gradient background, frustrated developer silhouette, minimalist illustration style, professional, clean design, 16:9 ratio
```

**简化版**:
```
Computer screen showing CUDA out of memory error in red, dark blue purple gradient background, tech illustration, minimalist, professional
```

---

### 2. no-comfyui-hero.jpg
**文件名**: `no-comfyui-hero.jpg`  
**尺寸**: 1200x630px  
**用途**: ComfyUI 文章头图

**Nano 提示词**:
```
Split screen comparison, left side shows tangled complex node graph with messy connections, right side shows simple clean drag-and-drop interface, blue gradient background, modern tech illustration, minimalist design, 16:9 ratio
```

**简化版**:
```
Split screen: complex tangled nodes vs simple clean interface, blue gradient, tech illustration, minimalist
```

---

### 3. diagonal-fix-hero.jpg
**文件名**: `diagonal-fix-hero.jpg`  
**尺寸**: 1200x630px  
**用途**: 对角线伪影修复文章头图

**Nano 提示词**:
```
Before and after image comparison, left shows pixelated jagged diagonal lines with artifacts, right shows smooth perfect lines, purple and blue gradient background, tech illustration style, clean modern design, 16:9 ratio
```

**简化版**:
```
Before after comparison: pixelated jagged lines vs smooth perfect lines, purple blue gradient, tech illustration
```

---

## 📊 对比图片 (1600x900)

### 4. architecture-comparison.png
**文件名**: `architecture-comparison.png`  
**尺寸**: 1600x900px  
**用途**: 建筑细节前后对比

**Nano 提示词**:
```
Side by side comparison of modern building facade with diagonal lattice pattern, left image is blurry with jagged staircase edges, right image is crystal clear with perfectly smooth geometric lines, architectural photography, professional quality, photorealistic
```

**简化版**:
```
Building facade comparison: blurry jagged vs crystal clear smooth, diagonal lattice pattern, architectural photo, photorealistic
```

---

### 5. anime-hair-comparison.png
**文件名**: `anime-hair-comparison.png`  
**尺寸**: 1600x900px  
**用途**: 动漫角色头发对比

**Nano 提示词**:
```
Anime character hair close-up comparison, left side shows blurry clumped hair strands, right side shows individual clear hair strands with highlights and natural flow, anime art style, vibrant colors, detailed illustration
```

**简化版**:
```
Anime hair comparison: blurry clumped vs clear individual strands with highlights, anime style, vibrant colors
```

---

### 6. fabric-texture-comparison.png
**文件名**: `fabric-texture-comparison.png`  
**尺寸**: 1600x900px  
**用途**: 织物纹理对比

**Nano 提示词**:
```
Striped fabric texture close-up comparison, left shows moiré effect with broken discontinuous stripes, right shows smooth continuous stripe pattern with clear texture detail, macro photography, professional quality
```

**简化版**:
```
Fabric texture comparison: moiré broken stripes vs smooth continuous pattern, macro photo, professional
```

---

### 7. blinds-comparison.png
**文件名**: `blinds-comparison.png`  
**尺寸**: 1600x900px  
**用途**: 百叶窗对比

**Nano 提示词**:
```
Venetian blinds with diagonal sunlight comparison, left shows jagged staircase effect on horizontal slats, right shows perfectly straight lines with smooth natural shadows, interior photography, realistic lighting, photorealistic
```

**简化版**:
```
Venetian blinds comparison: jagged staircase effect vs perfectly straight lines, diagonal sunlight, interior photo
```

---

## 🔬 技术图表 (1200x800)

### 8. seedvr2-dit-architecture.png
**文件名**: `seedvr2-dit-architecture.png`  
**尺寸**: 1200x800px  
**用途**: SeedVR2 DiT 架构图

**Nano 提示词**:
```
Clean technical flowchart diagram showing AI architecture: boxes labeled "Input Image", "Semantic Understanding", "Latent Representation", "Guided Generation", "High-Res Output" connected by arrows from left to right, modern infographic style, blue and white color scheme, professional design, minimalist
```

**简化版**:
```
Technical flowchart: Input → Understanding → Latent → Generation → Output, boxes with arrows, blue white, infographic style
```

---

### 9. problem-patterns-grid.png
**文件名**: `problem-patterns-grid.png`  
**尺寸**: 1200x800px  
**用途**: 问题图案网格展示

**Nano 提示词**:
```
Educational infographic showing 2x3 grid layout with 5 problematic patterns: 1) diagonal lines with jagged edges, 2) horizontal venetian blinds, 3) lattice fence grid, 4) fine hair strands, 5) striped fabric texture, each in separate labeled box, clean modern design, professional infographic style
```

**简化版**:
```
Grid infographic: 5 problem patterns (diagonal lines, blinds, lattice, hair, fabric), labeled boxes, clean design
```

---

### 10. generative-process-diagram.png
**文件名**: `generative-process-diagram.png`  
**尺寸**: 1200x800px  
**用途**: 生成过程流程图

**Nano 提示词**:
```
Process flow diagram showing AI upscaling steps: low-resolution image → AI analysis icon → pattern recognition icon → detail generation icon → high-resolution image, connected by arrows, modern infographic style, purple and blue gradient background, professional design with icons
```

**简化版**:
```
AI upscaling flow: low-res → analysis → recognition → generation → high-res, icons and arrows, purple blue gradient
```

---

### 11. diagonal-artifacts-before.png
**文件名**: `diagonal-artifacts-before.png`  
**尺寸**: 1200x800px  
**用途**: 对角线伪影示例

**Nano 提示词**:
```
Close-up demonstration image showing upscaling artifacts: jagged diagonal lines with staircase effect, broken stripe patterns, blurry texture areas, with red arrows and labels pointing to each problem, educational style, clear annotations
```

**简化版**:
```
Upscaling artifacts demo: jagged diagonals, broken stripes, blurry texture, labeled with arrows, educational
```

---

## 🎯 Nano 生成技巧

### 1. 提示词结构
```
[主体描述] + [风格] + [质量词] + [技术参数]
```

### 2. 关键要素
- **主体**: 清晰描述要生成什么
- **风格**: illustration, photography, infographic
- **颜色**: 明确指定配色方案
- **质量**: professional, clean, modern, minimalist

### 3. 避免的词汇
❌ 不要使用：
- "high quality" (Nano 默认高质量)
- "8k", "4k" (不需要指定分辨率)
- 过于复杂的描述

✅ 推荐使用：
- 简洁明确的描述
- 具体的风格词
- 清晰的颜色方案

### 4. 比例设置
- Hero 图片: 使用 `16:9 ratio` 或 `landscape`
- 对比图片: 使用 `16:9 ratio`
- 技术图表: 使用 `3:2 ratio` 或默认

---

## 📝 批量生成工作流

### 步骤 1: 准备提示词
将上述提示词复制到文本文件，每行一个。

### 步骤 2: 使用 Nano 生成
```bash
# 如果 Nano 支持批量生成
nano generate --prompts prompts.txt --output public/imgs/blog/

# 或者逐个生成
nano generate "提示词内容" --output oom-fix-hero.jpg
```

### 步骤 3: 后期处理
```bash
# 压缩图片
for img in public/imgs/blog/*.{jpg,png}; do
  # 使用 ImageMagick 调整尺寸
  convert "$img" -resize 1200x630 -quality 85 "$img"
done
```

---

## 🚀 快速生成命令

### Hero 图片（优先级最高）

```bash
# 1. OOM Fix Hero
nano generate "Computer screen showing CUDA out of memory error in red, dark blue purple gradient background, tech illustration, minimalist, professional" --output public/imgs/blog/oom-fix-hero.jpg --ratio 16:9

# 2. No ComfyUI Hero
nano generate "Split screen: complex tangled nodes vs simple clean interface, blue gradient, tech illustration, minimalist" --output public/imgs/blog/no-comfyui-hero.jpg --ratio 16:9

# 3. Diagonal Fix Hero
nano generate "Before after comparison: pixelated jagged lines vs smooth perfect lines, purple blue gradient, tech illustration" --output public/imgs/blog/diagonal-fix-hero.jpg --ratio 16:9
```

### 对比图片

```bash
# 4. Architecture Comparison
nano generate "Building facade comparison: blurry jagged vs crystal clear smooth, diagonal lattice pattern, architectural photo, photorealistic" --output public/imgs/blog/architecture-comparison.png --ratio 16:9

# 5. Anime Hair Comparison
nano generate "Anime hair comparison: blurry clumped vs clear individual strands with highlights, anime style, vibrant colors" --output public/imgs/blog/anime-hair-comparison.png --ratio 16:9

# 6. Fabric Texture Comparison
nano generate "Fabric texture comparison: moiré broken stripes vs smooth continuous pattern, macro photo, professional" --output public/imgs/blog/fabric-texture-comparison.png --ratio 16:9

# 7. Blinds Comparison
nano generate "Venetian blinds comparison: jagged staircase effect vs perfectly straight lines, diagonal sunlight, interior photo" --output public/imgs/blog/blinds-comparison.png --ratio 16:9
```

### 技术图表

```bash
# 8. DiT Architecture
nano generate "Technical flowchart: Input → Understanding → Latent → Generation → Output, boxes with arrows, blue white, infographic style" --output public/imgs/blog/seedvr2-dit-architecture.png --ratio 3:2

# 9. Problem Patterns Grid
nano generate "Grid infographic: 5 problem patterns (diagonal lines, blinds, lattice, hair, fabric), labeled boxes, clean design" --output public/imgs/blog/problem-patterns-grid.png --ratio 3:2

# 10. Generative Process
nano generate "AI upscaling flow: low-res → analysis → recognition → generation → high-res, icons and arrows, purple blue gradient" --output public/imgs/blog/generative-process-diagram.png --ratio 3:2

# 11. Artifacts Demo
nano generate "Upscaling artifacts demo: jagged diagonals, broken stripes, blurry texture, labeled with arrows, educational" --output public/imgs/blog/diagonal-artifacts-before.png --ratio 3:2
```

---

## 📋 生成检查清单

每张图片生成后：
- [ ] 检查尺寸是否正确
- [ ] 颜色方案是否符合品牌（蓝、紫、白）
- [ ] 图片清晰度是否足够
- [ ] 文件大小是否合理（< 500KB）
- [ ] 文件名是否正确
- [ ] 如果不满意，调整提示词重新生成

---

## 💡 提示词优化技巧

### 如果生成效果不理想：

1. **太抽象** → 添加更具体的描述
   ```
   ❌ "tech illustration"
   ✅ "modern tech illustration with clean lines and geometric shapes"
   ```

2. **颜色不对** → 明确指定颜色
   ```
   ❌ "gradient background"
   ✅ "dark blue to purple gradient background"
   ```

3. **风格不符** → 添加风格参考
   ```
   ❌ "comparison image"
   ✅ "side by side comparison, photorealistic style"
   ```

4. **细节不够** → 增加关键细节描述
   ```
   ❌ "building facade"
   ✅ "modern building facade with diagonal lattice pattern, architectural detail"
   ```

---

## 🎨 配色方案参考

所有图片应使用统一的配色：

### 主色调
- **深蓝**: #0070f3 (品牌主色)
- **紫色**: #7c3aed (辅助色)
- **白色**: #ffffff (背景/文字)

### 渐变方案
```
从深蓝到紫色: linear-gradient(135deg, #0070f3 0%, #7c3aed 100%)
从深色到浅色: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)
```

### 在提示词中使用
```
"dark blue and purple gradient background"
"blue to purple gradient"
"navy blue background with purple accents"
```

---

## 📞 故障排除

### 问题 1: 生成的图片比例不对
**解决**: 在提示词末尾添加 `16:9 ratio` 或使用 `--ratio` 参数

### 问题 2: 颜色不符合品牌
**解决**: 在提示词中明确指定 "blue and purple color scheme"

### 问题 3: 风格太卡通/太写实
**解决**: 添加风格词 "minimalist illustration" 或 "photorealistic"

### 问题 4: 文字模糊或错误
**解决**: 避免在 AI 生成中包含文字，后期用 Figma/Canva 添加

### 问题 5: 生成速度慢
**解决**: 使用简化版提示词，减少不必要的描述

---

## 🔄 替代方案

如果 Nano 生成效果不理想：

1. **使用 Figma 创建**
   - 技术图表最适合手动创建
   - 可以精确控制布局和文字

2. **使用真实截图**
   - 对比图可以用真实的处理结果
   - 更有说服力

3. **使用 Canva 模板**
   - Hero 图片可以用现成模板
   - 快速且专业

4. **混合方案**
   - AI 生成背景
   - Figma 添加文字和图标
   - 最佳效果组合
