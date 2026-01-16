#!/bin/bash

# 博客图片 Nano AI 生成脚本
# 使用方法: bash scripts/generate-image-prompts.sh

OUTPUT_DIR="public/imgs/blog"
mkdir -p "$OUTPUT_DIR"

echo "🎨 博客图片 AI 生成提示词"
echo "================================"
echo ""
echo "请将以下提示词复制到 Nano AI 工具中生成图片"
echo ""

# Hero 图片
echo "📸 Hero 图片 (1200x630) - 优先级最高"
echo "-----------------------------------"
echo ""

echo "1️⃣  oom-fix-hero.jpg"
echo "提示词:"
echo "Computer screen showing CUDA out of memory error in red, dark blue purple gradient background, tech illustration, minimalist, professional"
echo ""

echo "2️⃣  no-comfyui-hero.jpg"
echo "提示词:"
echo "Split screen: complex tangled nodes vs simple clean interface, blue gradient, tech illustration, minimalist"
echo ""

echo "3️⃣  diagonal-fix-hero.jpg"
echo "提示词:"
echo "Before after comparison: pixelated jagged lines vs smooth perfect lines, purple blue gradient, tech illustration"
echo ""

# 对比图片
echo "📊 对比图片 (1600x900)"
echo "-----------------------------------"
echo ""

echo "4️⃣  architecture-comparison.png"
echo "提示词:"
echo "Building facade comparison: blurry jagged vs crystal clear smooth, diagonal lattice pattern, architectural photo, photorealistic"
echo ""

echo "5️⃣  anime-hair-comparison.png"
echo "提示词:"
echo "Anime hair comparison: blurry clumped vs clear individual strands with highlights, anime style, vibrant colors"
echo ""

echo "6️⃣  fabric-texture-comparison.png"
echo "提示词:"
echo "Fabric texture comparison: moiré broken stripes vs smooth continuous pattern, macro photo, professional"
echo ""

echo "7️⃣  blinds-comparison.png"
echo "提示词:"
echo "Venetian blinds comparison: jagged staircase effect vs perfectly straight lines, diagonal sunlight, interior photo"
echo ""

# 技术图表
echo "🔬 技术图表 (1200x800)"
echo "-----------------------------------"
echo ""

echo "8️⃣  seedvr2-dit-architecture.png"
echo "提示词:"
echo "Technical flowchart: Input → Understanding → Latent → Generation → Output, boxes with arrows, blue white, infographic style"
echo ""

echo "9️⃣  problem-patterns-grid.png"
echo "提示词:"
echo "Grid infographic: 5 problem patterns (diagonal lines, blinds, lattice, hair, fabric), labeled boxes, clean design"
echo ""

echo "🔟 generative-process-diagram.png"
echo "提示词:"
echo "AI upscaling flow: low-res → analysis → recognition → generation → high-res, icons and arrows, purple blue gradient"
echo ""

echo "1️⃣1️⃣  diagonal-artifacts-before.png"
echo "提示词:"
echo "Upscaling artifacts demo: jagged diagonals, broken stripes, blurry texture, labeled with arrows, educational"
echo ""

echo "================================"
echo "✅ 提示词列表生成完成！"
echo ""
echo "📝 详细说明请查看: public/imgs/blog/NANO-PROMPTS.md"
echo "🎯 生成后请将图片保存到: $OUTPUT_DIR"
echo ""
echo "💡 提示:"
echo "  - Hero 图片最重要，优先生成"
echo "  - 使用 16:9 比例"
echo "  - 保持蓝紫色配色方案"
echo "  - 生成后压缩优化图片"
