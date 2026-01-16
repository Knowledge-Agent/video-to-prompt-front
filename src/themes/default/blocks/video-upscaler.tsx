/**
 * Video Upscaler Component (视频增强专区)
 * SEO 优化的视频增强功能展示区块，包含 Before/After 视频对比滑块
 * pos: src/themes/default/blocks/video-upscaler.tsx
 */
'use client';

import { ArrowRight, ChevronLeft, ChevronRight, Film, Sparkles, Video, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

// 视频增强特性类型
type VideoFeature = {
  icon: React.ReactNode;
  title: string;
  description: string;
  keywords: string[];
};

// 默认视频增强特性（用于 SEO 长尾关键词嵌入）
const defaultFeatures: VideoFeature[] = [
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: '4K/8K Upscaling',
    description: 'Transform low-resolution videos to stunning 4K or 8K quality with AI-powered super resolution.',
    keywords: ['4K', '8K', 'video upscaling', 'super resolution']
  },
  {
    icon: <Film className="w-6 h-6" />,
    title: 'Motion Consistency',
    description: 'Maintain smooth motion and frame-to-frame temporal coherence for flicker-free results.',
    keywords: ['motion consistency', 'temporal coherence', 'flicker-free']
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: 'Video Restoration',
    description: 'Restore old videos, upscale anime video content, and fix compression artifacts with ease.',
    keywords: ['video restoration', 'upscale anime video', 'fix artifacts']
  }
];

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-6 h-6" />,
  Film: <Film className="w-6 h-6" />,
  Video: <Video className="w-6 h-6" />,
  Zap: <Zap className="w-6 h-6" />
};

export function VideoUpscaler({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  // 从 section 获取配置，或使用默认值
  const features = section.items?.map((item) => ({
    icon: typeof item.icon === 'string' ? iconMap[item.icon] || <Video className="w-6 h-6" /> : item.icon,
    title: item.title || '',
    description: item.description || '',
    keywords: item.keywords || []
  })) || defaultFeatures;

  // 获取对比视频配置（支持单个或多个）
  const comparisons = section.comparisons 
    ? (Array.isArray(section.comparisons) ? section.comparisons : [section.comparisons])
    : section.comparison 
    ? [section.comparison]
    : [];

  // Before/After 滑块状态（为每个对比视频维护独立状态）
  const [sliderPositions, setSliderPositions] = useState<number[]>(
    comparisons.map(() => 50)
  );
  const sliderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  
  // 轮播状态
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleMouseDown = (index: number) => () => setDraggingIndex(index);
  const handleMouseUp = () => setDraggingIndex(null);

  const handleMouseMove = (index: number) => (e: React.MouseEvent<HTMLDivElement>) => {
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
      id={section.id || 'video-upscaler'} 
      className={cn('py-20', section.className, className)}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* 区块标题 - H2 用于 SEO */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">
              {section.title || 'Professional SeedVR2 Video Upscaler'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {section.description || 'Upscale videos to 4K/8K with perfect motion consistency. Professional video restoration powered by AI.'}
            </p>
          </motion.div>
        </div>

        {/* 特性卡片网格 - 三列布局 */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-white/[0.07] transition-all"
            >
              {/* 图标 */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center mb-4 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all">
                <div className="text-orange-500">
                  {feature.icon}
                </div>
              </div>

              {/* 内容 */}
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{feature.description}</p>

              {/* 关键词标签（用于 SEO 长尾关键词展示） */}
              {feature.keywords && feature.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {feature.keywords.slice(0, 3).map((keyword: string) => (
                    <span
                      key={keyword}
                      className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-gray-300"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* 视频对比效果展示区域 - Before/After Slider 轮播 */}
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
                  ref={(el) => { sliderRefs.current[currentIndex] = el; }}
                  onMouseDown={handleMouseDown(currentIndex)}
                  onMouseUp={handleMouseUp}
                  onMouseMove={handleMouseMove(currentIndex)}
                  onMouseLeave={handleMouseUp}
                  onClick={handleMouseMove(currentIndex)}
                  className="relative aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none shadow-2xl border border-white/20 bg-white/5"
                >
                  {/* Before Video */}
                  <div className="absolute inset-0">
                    <video
                      src={comparisons[currentIndex].before || '/videos/video_before.mp4'}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      aria-label={comparisons[currentIndex].alt || 'SeedVR2 video upscaler comparison example - before'}
                    />
                  </div>

                  {/* After Video */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 0 0 ${sliderPositions[currentIndex]}%)` }}
                  >
                    <video
                      src={comparisons[currentIndex].after || '/videos/video_after.mp4'}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      aria-label={comparisons[currentIndex].alt || 'SeedVR2 video upscaler comparison example - after'}
                    />
                  </div>

                  {/* Slider Handle */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none"
                    style={{ left: `${sliderPositions[currentIndex]}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
                      <div className="flex gap-1">
                        <ArrowRight className="w-4 h-4 text-gray-900 -ml-2" />
                        <ArrowRight className="w-4 h-4 text-gray-900 rotate-180 -mr-2" />
                      </div>
                    </div>
                  </div>

                  {/* Labels */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-white/20">
                    Before
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs text-gray-900 font-medium">
                    After (4K)
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20 hover:border-white/40 z-10"
                  aria-label="Previous video"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                {/* 右箭头 */}
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all border border-white/20 hover:border-white/40 z-10"
                  aria-label="Next video"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* 指示器 */}
                <div className="flex justify-center gap-2 mt-6">
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
                      aria-label={`Go to video ${index + 1}`}
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
