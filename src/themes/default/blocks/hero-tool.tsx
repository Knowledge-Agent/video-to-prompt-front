/**
 * Hero Tool Block - First screen with video/image restoration tool
 * Full viewport height layout for homepage with SEO-optimized H1 title
 * pos: src/themes/default/blocks/hero-tool.tsx
 */
'use client';

import { Image as ImageIcon, Video } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { VideoRestore } from '@/shared/blocks/generator/video-restore';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type MediaMode = 'video' | 'image';

export function HeroTool({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const [mediaMode, setMediaMode] = useState<MediaMode>('video');

  return (
    <section
      id={section.id}
      className={cn(
        'relative flex min-h-screen flex-col pt-16 md:pt-20',
        section.className,
        className
      )}
    >
      {/* Background Image */}
      {section.background_image?.src && (
        <div className="absolute inset-0 -z-10 hidden h-full w-full overflow-hidden md:block">
          <div className="from-background/95 via-background/90 to-background absolute inset-0 z-10 bg-gradient-to-b" />
          <Image
            src={section.background_image.src}
            alt={section.background_image.alt || ''}
            className="object-cover opacity-30 blur-[0px]"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 0vw, 100vw"
            quality={70}
            unoptimized={section.background_image.src.startsWith('http')}
          />
        </div>
      )}

      {/* Hero Content - centered vertically */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="container w-full">
          {/* SEO-optimized H1 Title */}
          <div className="mx-auto max-w-3xl text-center mb-6">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-white mb-4">
              {section.title}
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              {section.description}
            </p>

            {/* Media Type Toggle */}
            {section.switchLabel && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <button
                  onClick={() => setMediaMode('video')}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                    mediaMode === 'video'
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-black shadow-lg shadow-orange-500/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  )}
                >
                  <Video className="h-5 w-5" />
                  {section.switchLabel.video}
                </button>
                <button
                  onClick={() => setMediaMode('image')}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all',
                    mediaMode === 'image'
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-black shadow-lg shadow-orange-500/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                  )}
                >
                  <ImageIcon className="h-5 w-5" />
                  {section.switchLabel.image}
                </button>
              </div>
            )}

            {/* Hint Text */}
            {section.hint && (
              <p className="text-sm text-gray-500 mb-8">
                {section.hint}
              </p>
            )}
          </div>

          {/* Video/Image Restore Tool */}
          <VideoRestore 
            mediaMode={mediaMode}
            hideTitle={true}
          />
        </div>
      </div>
    </section>
  );
}
