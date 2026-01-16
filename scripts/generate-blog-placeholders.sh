#!/bin/bash

# 博客图片占位符生成脚本
# 用于开发阶段快速生成占位图片

BLOG_IMG_DIR="public/imgs/blog"

# 创建目录
mkdir -p "$BLOG_IMG_DIR"

echo "🎨 开始生成博客图片占位符..."

# Hero 图片 (1200x630)
echo "📸 生成 Hero 图片..."
curl -s "https://via.placeholder.com/1200x630/0070f3/ffffff?text=OOM+Fix+Hero" -o "$BLOG_IMG_DIR/oom-fix-hero.jpg"
curl -s "https://via.placeholder.com/1200x630/0070f3/ffffff?text=No+ComfyUI+Hero" -o "$BLOG_IMG_DIR/no-comfyui-hero.jpg"
curl -s "https://via.placeholder.com/1200x630/0070f3/ffffff?text=Diagonal+Fix+Hero" -o "$BLOG_IMG_DIR/diagonal-fix-hero.jpg"

# 通用图片 (1920x1080)
echo "📸 生成通用图片..."
curl -s "https://via.placeholder.com/1920x1080/1a1a1a/ff0000?text=CUDA+OOM+Error" -o "$BLOG_IMG_DIR/oom-error-screenshot.png"
curl -s "https://via.placeholder.com/1920x1080/2d2d2d/00ff00?text=ComfyUI+Workflow" -o "$BLOG_IMG_DIR/comfyui-complex-workflow.png"
curl -s "https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=Terminal+Installation" -o "$BLOG_IMG_DIR/terminal-installation.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=SeedVR2+Online+Interface" -o "$BLOG_IMG_DIR/seedvr2-online-interface.png"
curl -s "https://via.placeholder.com/1920x1080/2d2d2d/ffffff?text=Model+Download" -o "$BLOG_IMG_DIR/model-download-progress.png"
curl -s "https://via.placeholder.com/1920x1080/1a1a1a/ffffff?text=ComfyUI+Processing" -o "$BLOG_IMG_DIR/comfyui-processing.png"
curl -s "https://via.placeholder.com/1920x1080/2d2d2d/ffffff?text=ComfyUI+Nodes" -o "$BLOG_IMG_DIR/comfyui-node-connection.png"

# 对比图片 (1600x900)
echo "📸 生成对比图片..."
curl -s "https://via.placeholder.com/1600x900/2d2d2d/ffffff?text=Architecture+Comparison" -o "$BLOG_IMG_DIR/architecture-comparison.png"
curl -s "https://via.placeholder.com/1600x900/2d2d2d/ffffff?text=Anime+Hair+Comparison" -o "$BLOG_IMG_DIR/anime-hair-comparison.png"
curl -s "https://via.placeholder.com/1600x900/2d2d2d/ffffff?text=Fabric+Texture+Comparison" -o "$BLOG_IMG_DIR/fabric-texture-comparison.png"
curl -s "https://via.placeholder.com/1600x900/2d2d2d/ffffff?text=Blinds+Comparison" -o "$BLOG_IMG_DIR/blinds-comparison.png"
curl -s "https://via.placeholder.com/1600x900/2d2d2d/ffffff?text=Video+Upscaling+Example" -o "$BLOG_IMG_DIR/video-upscaling-example.png"
curl -s "https://via.placeholder.com/1600x900/2d2d2d/ffffff?text=Image+Enhancement" -o "$BLOG_IMG_DIR/image-enhancement-example.png"
curl -s "https://via.placeholder.com/1600x900/1a1a1a/ff0000?text=Diagonal+Artifacts+Before" -o "$BLOG_IMG_DIR/diagonal-artifacts-before.png"

# 信息图表 (1200x800)
echo "📸 生成信息图表..."
curl -s "https://via.placeholder.com/1200x800/0070f3/ffffff?text=VRAM+Comparison+Chart" -o "$BLOG_IMG_DIR/vram-comparison-chart.png"
curl -s "https://via.placeholder.com/1200x800/0070f3/ffffff?text=Local+vs+Online" -o "$BLOG_IMG_DIR/local-vs-online-comparison.png"
curl -s "https://via.placeholder.com/1200x800/0070f3/ffffff?text=GPU+Price+Comparison" -o "$BLOG_IMG_DIR/gpu-price-comparison.png"
curl -s "https://via.placeholder.com/1200x800/2d2d2d/ffffff?text=Problem+Patterns+Grid" -o "$BLOG_IMG_DIR/problem-patterns-grid.png"
curl -s "https://via.placeholder.com/1200x800/0070f3/ffffff?text=SeedVR2+DiT+Architecture" -o "$BLOG_IMG_DIR/seedvr2-dit-architecture.png"
curl -s "https://via.placeholder.com/1200x800/0070f3/ffffff?text=Generative+Process" -o "$BLOG_IMG_DIR/generative-process-diagram.png"

# 界面截图 (1920x1080)
echo "📸 生成界面截图..."
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Step+1+Upload" -o "$BLOG_IMG_DIR/step1-upload.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Step+2+Settings" -o "$BLOG_IMG_DIR/step2-settings.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Step+3+Download" -o "$BLOG_IMG_DIR/step3-download.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Video+Upscaler+Interface" -o "$BLOG_IMG_DIR/video-upscaler-interface.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Image+Upscaler+Interface" -o "$BLOG_IMG_DIR/image-upscaler-interface.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Image+Upload+Interface" -o "$BLOG_IMG_DIR/image-upload-interface.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Enhancement+Presets" -o "$BLOG_IMG_DIR/enhancement-presets.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Advanced+Settings" -o "$BLOG_IMG_DIR/advanced-settings.png"
curl -s "https://via.placeholder.com/1920x1080/0070f3/ffffff?text=Processing+Results" -o "$BLOG_IMG_DIR/processing-results.png"

echo "✅ 占位图片生成完成！"
echo "📁 图片位置: $BLOG_IMG_DIR"
echo ""
echo "💡 提示: 这些是占位图片，请在生产环境前替换为真实图片"
