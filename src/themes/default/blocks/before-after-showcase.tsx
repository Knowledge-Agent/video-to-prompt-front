/**
 * Before/After Showcase Component
 * 视频/图片修复前后对比展示
 * pos: src/themes/default/blocks/before-after-showcase.tsx
 */
'use client';

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Play, ArrowRight } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type ShowcaseItem = {
  id: string;
  title: string;
  before: string;
  after: string;
  improvement: string;
  category: string;
};

const defaultShowcaseItems: ShowcaseItem[] = [
  {
    id: '1',
    title: 'Old Film Restoration',
    before: 'https://images.unsplash.com/photo-1542204625-ca960ca44635?w=1080',
    after: 'https://images.unsplash.com/photo-1542204625-ca960ca44635?w=1080',
    improvement: '1080p → 4K',
    category: 'Heritage'
  },
  {
    id: '2',
    title: 'Gaming Footage',
    before: 'https://images.unsplash.com/photo-1616757857818-5c6eea38ee17?w=1080',
    after: 'https://images.unsplash.com/photo-1616757857818-5c6eea38ee17?w=1080',
    improvement: '480p → 4K',
    category: 'Gaming'
  },
  {
    id: '3',
    title: 'Drone Aerial',
    before: 'https://images.unsplash.com/photo-1645544893322-866e16bc22b2?w=1080',
    after: 'https://images.unsplash.com/photo-1645544893322-866e16bc22b2?w=1080',
    improvement: 'Noisy → Clear',
    category: 'Nature'
  }
];

export function BeforeAfterShowcase({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const showcaseItems = defaultShowcaseItems;
  const [selectedItem, setSelectedItem] = useState(showcaseItems[0]);
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
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">
              {section.title || 'See the Difference'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {section.description || 'Real videos restored by SeedVR2. Drag the slider to compare before and after.'}
            </p>
          </motion.div>
        </div>

        {/* Main Comparison Viewer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onClick={handleMouseMove}
            className="relative aspect-video rounded-xl overflow-hidden cursor-ew-resize select-none shadow-2xl border border-white/20 bg-white/5"
          >
            {/* Before Image */}
            <div className="absolute inset-0">
              <img
                src={selectedItem.before}
                alt={`${selectedItem.title} - Before`}
                className="w-full h-full object-cover grayscale brightness-75"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* After Image */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <img
                src={selectedItem.after}
                alt={`${selectedItem.title} - After`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center pointer-events-auto cursor-ew-resize">
                <div className="flex gap-1">
                  <ArrowRight className="w-4 h-4 text-gray-900 -ml-2" />
                  <ArrowRight className="w-4 h-4 text-gray-900 rotate-180 -mr-2" />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-sm text-white font-medium border border-white/20">
              Before
            </div>
            <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm text-gray-900 font-medium">
              After (4K)
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
            </div>

            {/* Category Badge */}
            <div className="absolute bottom-6 left-6 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-xs font-medium text-black">
              {selectedItem.category}
            </div>

            {/* Improvement Badge */}
            <div className="absolute bottom-6 right-6 px-4 py-2 bg-green-500/90 backdrop-blur-sm rounded-full text-sm font-medium text-black">
              {selectedItem.improvement}
            </div>
          </div>
        </motion.div>

        {/* Thumbnail Selector */}
        <div className="grid grid-cols-3 gap-4">
          {showcaseItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              onClick={() => {
                setSelectedItem(item);
                setSliderPosition(50);
              }}
              className={cn(
                'relative aspect-video rounded-lg overflow-hidden group transition-all',
                selectedItem.id === item.id
                  ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-black shadow-xl'
                  : 'hover:ring-2 hover:ring-white/30 hover:ring-offset-2 hover:ring-offset-black'
              )}
            >
              <img
                src={item.after}
                alt={item.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-medium text-white mb-1">{item.title}</p>
                <p className="text-xs text-gray-300">{item.improvement}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">Ready to restore your own videos?</p>
          <a
            href="#upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-lg font-medium text-black transition-all shadow-lg shadow-orange-500/50 hover:shadow-orange-500/60"
          >
            Get Started for Free
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
