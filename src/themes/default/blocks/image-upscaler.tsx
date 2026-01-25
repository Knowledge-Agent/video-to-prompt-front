/**
 * Image Upscaler Component (图片增强专区)
 * SEO 优化的图片增强功能展示区块，包含 Before/After 图片对比滑块
 * pos: src/themes/default/blocks/image-upscaler.tsx
 */
'use client';

import { useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Image,
  Layers,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

// 图片增强特性类型
type ImageFeature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  keywords: string[];
};

// 默认图片增强特性（用于 SEO 长尾关键词嵌入）
const defaultFeatures: ImageFeature[] = [
  {
    icon: <Wand2 className="h-6 w-6" />,
    title: 'Artifact Removal',
    description:
      'Fix diagonal lines and stripes in AI-generated images. Remove compression artifacts with precision.',
    keywords: ['fix artifacts', 'fix diagonal lines', 'fix stripes'],
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Detail Enhancement',
    description:
      'Restore fine details and textures in photos. Professional photo restoration powered by AI.',
    keywords: ['photo restoration', 'image detail enhancement'],
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: 'High-Fidelity Output',
    description:
      'Produce professional-quality images for printing. Upscale to any resolution without quality loss.',
    keywords: ['high fidelity', 'professional quality', 'image upscaling'],
  },
];

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  Wand2: <Wand2 className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
  Layers: <Layers className="h-6 w-6" />,
  Image: <Image className="h-6 w-6" />,
};

export function ImageUpscaler({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  // 从 section 获取配置，或使用默认值
  const features =
    section.items?.map((item) => ({
      icon:
        typeof item.icon === 'string'
          ? iconMap[item.icon] || <Image className="h-6 w-6" />
          : item.icon,
      title: item.title || '',
      description: item.description || '',
      keywords: item.keywords || [],
    })) || defaultFeatures;

  // 获取对比图配置（支持单个或多个）
  const comparisons = section.comparisons
    ? Array.isArray(section.comparisons)
      ? section.comparisons
      : [section.comparisons]
    : section.comparison
      ? [section.comparison]
      : [];

  // Before/After 滑块状态（为每个对比图维护独立状态）
  const [sliderPositions, setSliderPositions] = useState<number[]>(
    comparisons.map(() => 50)
  );
  const sliderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // 轮播状态
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleMouseDown = (index: number) => () => setDraggingIndex(index);
  const handleMouseUp = () => setDraggingIndex(null);

  const handleMouseMove =
    (index: number) => (e: React.MouseEvent<HTMLDivElement>) => {
      if (draggingIndex !== index && e.type !== 'click') return;

      const ref = sliderRefs.current[index];
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = (x / rect.width) * 100;
        const newPositions = [...sliderPositions];
        newPositions[index] = Math.max(0, Math.min(100, percentage));
        setSliderPositions(newPositions);
      }
    };

  // 轮播控制
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? comparisons.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === comparisons.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      id={section.id || 'image-upscaler'}
      className={cn('py-20', section.className, className)}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* 区块标题 - H2 用于 SEO */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-4xl font-bold text-white">
              {section.title || 'High-Fidelity SeedVR2 Image Upscaler'}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              {section.description ||
                'Fix artifacts and enhance image details with AI precision. Professional photo restoration for any image.'}
            </p>
          </motion.div>
        </div>

        {/* 特性卡片网格 - 三列布局 */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:border-orange-500/50 hover:bg-white/[0.07]"
            >
              {/* 图标 */}
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/20 to-red-500/20 transition-all group-hover:from-orange-500/30 group-hover:to-red-500/30">
                <div className="text-orange-500">{feature.icon}</div>
              </div>

              {/* 内容 */}
              <h3 className="mb-2 text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                {feature.description}
              </p>

              {/* 关键词标签（用于 SEO 长尾关键词展示） */}
              {feature.keywords && feature.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {feature.keywords.slice(0, 3).map((keyword: string) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 图片对比效果展示区域 - Before/After Slider 轮播 */}
        {comparisons.length > 0 && (
          <div className="relative">
            {/* 轮播容器 */}
            <div className="relative overflow-hidden">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div
                  ref={(el) => {
                    sliderRefs.current[currentIndex] = el;
                  }}
                  onMouseDown={handleMouseDown(currentIndex)}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove(currentIndex)}
                  onMouseLeave={handleMouseUp}
                  onClick={handleMouseMove(currentIndex)}
                  className="relative aspect-video cursor-ew-resize overflow-hidden rounded-xl border border-white/20 bg-white/5 shadow-2xl select-none"
                >
                  {/* Before Image */}
                  <div className="absolute inset-0">
                    <img
                      src={
                        comparisons[currentIndex].before ||
                        '/imgs/features/2.png'
                      }
                      alt={
                        comparisons[currentIndex].alt ||
                        'SeedVR2 image upscaler comparison example - before'
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* After Image */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                      clipPath: `inset(0 0 0 ${sliderPositions[currentIndex]}%)`,
                    }}
                  >
                    <img
                      src={
                        comparisons[currentIndex].after ||
                        '/imgs/features/2.png'
                      }
                      alt={
                        comparisons[currentIndex].alt ||
                        'SeedVR2 image upscaler comparison example - after'
                      }
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Slider Handle */}
                  <div
                    className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl"
                    style={{ left: `${sliderPositions[currentIndex]}%` }}
                  >
                    <div className="pointer-events-auto absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-2xl">
                      <div className="flex gap-1">
                        <ArrowRight className="-ml-2 h-4 w-4 text-gray-900" />
                        <ArrowRight className="-mr-2 h-4 w-4 rotate-180 text-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 backdrop-blur-sm">
                    After (Enhanced)
                  </div>
                </div>
              </motion.div>
            </div>

            {/* 轮播控制按钮 */}
            {comparisons.length > 1 && (
              <>
                {/* 左箭头 */}
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/80"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>

                {/* 右箭头 */}
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/60 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/80"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>

                {/* 指示器 */}
                <div className="mt-6 flex justify-center gap-2">
                  {comparisons.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        index === currentIndex
                          ? 'w-8 bg-orange-500'
                          : 'w-2 bg-white/30 hover:bg-white/50'
                      )}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
