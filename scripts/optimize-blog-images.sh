#!/bin/bash

# 博客图片优化脚本
# 将大图片压缩到合理大小

BLOG_IMG_DIR="public/imgs/blog"

echo "🖼️  开始优化博客图片..."
echo "================================"

# 检查是否安装了 ImageMagick
if ! command -v convert &> /dev/null; then
    echo "❌ 未找到 ImageMagick"
    echo "请安装: brew install imagemagick"
    exit 1
fi

# 优化 PNG 图片
echo "📦 压缩 PNG 图片..."
for img in "$BLOG_IMG_DIR"/*.png; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        filesize=$(du -h "$img" | cut -f1)
        echo "  处理: $filename (当前: $filesize)"
        
        # 压缩 PNG (质量 85, 去除元数据)
        convert "$img" -strip -quality 85 -resize '1600x900>' "$img.tmp"
        mv "$img.tmp" "$img"
        
        newsize=$(du -h "$img" | cut -f1)
        echo "  ✅ 完成: $filename (优化后: $newsize)"
    fi
done

# 转换 PNG Hero 图片为 JPG
echo ""
echo "🔄 转换 Hero 图片为 JPG..."
for img in "$BLOG_IMG_DIR"/*-hero.png; do
    if [ -f "$img" ]; then
        filename=$(basename "$img" .png)
        echo "  转换: $filename.png → $filename.jpg"
        
        # 转换为 JPG (质量 85)
        convert "$img" -strip -quality 85 -resize '1200x630>' "$BLOG_IMG_DIR/$filename.jpg"
        
        # 删除原 PNG
        rm "$img"
        
        newsize=$(du -h "$BLOG_IMG_DIR/$filename.jpg" | cut -f1)
        echo "  ✅ 完成: $filename.jpg ($newsize)"
    fi
done

echo ""
echo "================================"
echo "✅ 图片优化完成！"
echo ""
echo "📊 当前图片列表:"
ls -lh "$BLOG_IMG_DIR"/*.{jpg,png} 2>/dev/null | awk '{print "  ", $5, $9}' | sed 's|public/imgs/blog/||'
