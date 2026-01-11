/**
 * Use Cases Component (Who Benefits from SeedVR2?)
 * 目标用户群体展示
 * pos: src/themes/default/blocks/use-cases.tsx
 */
'use client';

import { motion } from 'motion/react';
import { Film, Gamepad2, Camera, Building2, Heart, Tv } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type UseCase = {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
};

const defaultUseCases: UseCase[] = [
  {
    icon: <Film className="w-6 h-6" />,
    title: 'Content Creators',
    description: 'Enhance your YouTube videos, TikToks, and social media content to stand out from the crowd.',
    examples: ['YouTube videos', 'TikTok content', 'Instagram Reels']
  },
  {
    icon: <Gamepad2 className="w-6 h-6" />,
    title: 'Gamers & Streamers',
    description: 'Upscale game recordings and stream highlights to crisp 4K quality.',
    examples: ['Game recordings', 'Stream highlights', 'Montages']
  },
  {
    icon: <Camera className="w-6 h-6" />,
    title: 'Photographers',
    description: 'Restore old photos and enhance image quality for prints and portfolios.',
    examples: ['Old photos', 'Family archives', 'Portfolio work']
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: 'Businesses',
    description: 'Improve marketing videos, product demos, and corporate content.',
    examples: ['Marketing videos', 'Product demos', 'Training content']
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Families',
    description: 'Preserve precious memories by restoring old home videos and photos.',
    examples: ['Home videos', 'Wedding footage', 'Baby videos']
  },
  {
    icon: <Tv className="w-6 h-6" />,
    title: 'Film Enthusiasts',
    description: 'Restore classic films and vintage footage to modern quality standards.',
    examples: ['Classic films', 'Vintage footage', 'Documentaries']
  }
];

export function UseCases({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const useCases = defaultUseCases;

  return (
    <section id={section.id} className={cn('py-20', section.className, className)}>
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">
              {section.title || 'Who Benefits from SeedVR2?'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {section.description || 'From content creators to families, SeedVR2 helps everyone enhance their visual content.'}
            </p>
          </motion.div>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:border-orange-500/50 hover:bg-white/[0.07] transition-all"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center mb-4 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all">
                <div className="text-orange-500">
                  {useCase.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-2 text-white">{useCase.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{useCase.description}</p>

              {/* Examples */}
              <div className="flex flex-wrap gap-2">
                {useCase.examples.map((example) => (
                  <span
                    key={example}
                    className="px-3 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-gray-300"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
