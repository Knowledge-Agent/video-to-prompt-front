/**
 * Features Demo Component (See the Difference in Real-Time)
 * 核心功能实时对比演示 - 顶部水平Tab + 下方大图对比
 * pos: src/themes/default/blocks/features-demo.tsx
 */
'use client';

import { ChevronLeft, ChevronRight, Image as ImageIcon, Palette, Play, Sparkles, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type Feature = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  beforeLabel: string;
  afterLabel: string;
  improvement: string;
  imageUrl: string;
  beforeEffect: string;
  afterEffect: string;
};

const defaultFeatures: Feature[] = [
  {
    id: 'fps',
    icon: <Play className="w-5 h-5" />,
    title: 'Frame Rate',
    subtitle: 'Smoother motion',
    beforeLabel: '24 FPS',
    afterLabel: '60 FPS',
    improvement: '2.5x Smoother',
    imageUrl: 'https://images.unsplash.com/photo-1650805174015-53ceeec12c40?w=1080',
    beforeEffect: 'opacity-75 brightness-95',
    afterEffect: 'opacity-100 brightness-100'
  },
  {
    id: 'format',
    icon: <ImageIcon className="w-5 h-5" />,
    title: 'Format',
    subtitle: 'Lossless quality',
    beforeLabel: 'JPG',
    afterLabel: 'PNG',
    improvement: 'Perfect Quality',
    imageUrl: 'https://images.unsplash.com/photo-1767555256375-789d024acc6e?w=1080',
    beforeEffect: 'blur-[0.5px] contrast-95 saturate-95',
    afterEffect: 'blur-0 contrast-100 saturate-100'
  },
  {
    id: 'quality',
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Quality',
    subtitle: 'Reveal details',
    beforeLabel: 'Quality: 70',
    afterLabel: 'Quality: 100',
    improvement: '+43% Detail',
    imageUrl: 'https://images.unsplash.com/photo-1759262988215-c42fdb3b5d47?w=1080',
    beforeEffect: 'opacity-80 brightness-95 contrast-95',
    afterEffect: 'opacity-100 brightness-100 contrast-105'
  },
  {
    id: 'color',
    icon: <Palette className="w-5 h-5" />,
    title: 'Color',
    subtitle: 'AI enhancement',
    beforeLabel: 'Original',
    afterLabel: 'Enhanced',
    improvement: 'Natural Look',
    imageUrl: 'https://images.unsplash.com/photo-1723619884726-f246de4dae07?w=1080',
    beforeEffect: 'grayscale-[20%] saturate-50 brightness-90',
    afterEffect: 'grayscale-0 saturate-110 brightness-100'
  },
  {
    id: 'photo',
    icon: <Wand2 className="w-5 h-5" />,
    title: 'Restoration',
    subtitle: 'Fix old photos',
    beforeLabel: 'Damaged',
    afterLabel: 'Restored',
    improvement: 'Perfect Repair',
    imageUrl: 'https://images.unsplash.com/photo-1512373977447-6a8a90da5f7d?w=1080',
    beforeEffect: 'grayscale-[40%] saturate-30 brightness-85 contrast-90 blur-[0.3px]',
    afterEffect: 'grayscale-0 saturate-100 brightness-100 contrast-100 blur-0'
  }
];

export function FeaturesDemo({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const features = defaultFeatures;
  const [selectedFeature, setSelectedFeature] = useState(features[0]);
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.type !== 'click') return;
    
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.max(0, Math.min(100, percentage)));
    }
  };

  return (
    <section id={section.id} className={cn('py-20', section.className, className)}>
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">
              {section.title || 'See the Difference in Real-Time'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {section.description || 'Drag the slider to compare. Each parameter dramatically transforms your content quality.'}
            </p>
          </motion.div>
        </div>

        {/* Horizontal Tabs - 第一行4个，第二行1个居中 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          {/* 第一行：4个Tab */}
          <div className="flex justify-center gap-3 mb-3">
            {features.slice(0, 4).map((feature, index) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => {
                  setSelectedFeature(feature);
                  setSliderPosition(50);
                }}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all',
                  selectedFeature.id === feature.id
                    ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500 shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                  selectedFeature.id === feature.id
                    ? 'bg-gradient-to-br from-orange-500 to-red-600'
                    : 'bg-white/10'
                )}>
                  <div className={selectedFeature.id === feature.id ? 'text-black' : 'text-gray-400'}>
                    {feature.icon}
                  </div>
                </div>

                {/* Text */}
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
                  <p className="text-xs text-gray-400">{feature.subtitle}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 第二行：1个Tab居中 */}
          <div className="flex justify-center">
            {features.slice(4).map((feature, index) => (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 }}
                onClick={() => {
                  setSelectedFeature(feature);
                  setSliderPosition(50);
                }}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 rounded-xl border-2 transition-all',
                  selectedFeature.id === feature.id
                    ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500 shadow-lg shadow-orange-500/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                  selectedFeature.id === feature.id
                    ? 'bg-gradient-to-br from-orange-500 to-red-600'
                    : 'bg-white/10'
                )}>
                  <div className={selectedFeature.id === feature.id ? 'text-black' : 'text-gray-400'}>
                    {feature.icon}
                  </div>
                </div>

                {/* Text */}
                <div className="text-left">
                  <h3 className="font-semibold text-sm text-white">{feature.title}</h3>
                  <p className="text-xs text-gray-400">{feature.subtitle}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Large Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            key={selectedFeature.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div
              ref={sliderRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseUp}
              onClick={handleMouseMove}
              className="relative aspect-[16/9] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-2xl border border-white/20 bg-white/5"
            >
              {/* Before Image (Left side) */}
              <div className="absolute inset-0">
                <img
                  src={selectedFeature.imageUrl}
                  alt={`${selectedFeature.title} - Before`}
                  className={cn('w-full h-full object-cover transition-all duration-500', selectedFeature.beforeEffect)}
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* After Image (Right side - Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
              >
                <img
                  src={selectedFeature.imageUrl}
                  alt={`${selectedFeature.title} - After`}
                  className={cn('w-full h-full object-cover transition-all duration-500', selectedFeature.afterEffect)}
                />
              </div>

              {/* Slider Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_30px_rgba(255,255,255,0.6)] pointer-events-none z-10"
                style={{ left: `${sliderPosition}%` }}
              />

              {/* Slider Handle - 圆形带左右箭头 */}
              <div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-auto cursor-ew-resize z-20"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              >
                <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-2xl flex items-center justify-center ring-4 ring-white/30 hover:ring-white/50 transition-all hover:scale-110">
                  <ChevronLeft className="w-5 h-5 text-gray-900" />
                  <ChevronRight className="w-5 h-5 text-gray-900" />
                </div>
              </div>

              {/* Before Label - 左上角 */}
              <div className="absolute top-5 left-5 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full border border-white/20 flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm font-medium text-white">{selectedFeature.beforeLabel}</span>
              </div>

              {/* After Label - 右上角 */}
              <div className="absolute top-5 right-5 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full flex items-center gap-2 shadow-lg">
                <span className="text-sm font-medium text-gray-900">{selectedFeature.afterLabel}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
