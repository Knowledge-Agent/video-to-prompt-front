'use client';

import { Sparkles, Video } from 'lucide-react';
import Image from 'next/image';

import { VideoRestore } from '@/shared/blocks/generator/video-restore';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function HeroTool({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn(
        'relative flex min-h-screen flex-col overflow-hidden pt-18 md:pt-24',
        section.className,
        className
      )}
    >
      {section.background_image?.src && (
        <div className="absolute inset-0 -z-20 hidden h-full w-full overflow-hidden md:block">
          <Image
            src={section.background_image.src}
            alt={section.background_image.alt || ''}
            className="object-cover opacity-35"
            fill
            loading="lazy"
            sizes="(max-width: 768px) 0vw, 100vw"
            quality={70}
            unoptimized={section.background_image.src.startsWith('http')}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/78 via-background/92 to-background" />
        </div>
      )}

      <div className="from-primary/18 pointer-events-none absolute -top-30 left-1/2 -z-10 h-70 w-70 -translate-x-1/2 rounded-full bg-radial blur-3xl" />
      <div className="from-accent/16 pointer-events-none absolute right-10 bottom-24 -z-10 h-50 w-50 rounded-full bg-radial blur-3xl" />

      <div className="container relative z-10 flex flex-1 flex-col justify-center pb-18">
        <div className="mx-auto mb-8 max-w-4xl text-center">
          {section.badge && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {section.badge}
            </div>
          )}

          <h1 className="mb-4 bg-gradient-to-b from-white via-white to-primary/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-6xl">
            {section.title}
          </h1>

          <p className="mx-auto mb-5 max-w-3xl text-base text-foreground/85 md:text-xl">
            {section.description}
          </p>

          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
            <Video className="h-3.5 w-3.5 text-primary" />
            {section.tagline ||
              'Video to Prompt · Upload once, get structured prompts instantly'}
          </div>

          {section.hint && (
            <p className="mb-4 text-sm text-muted-foreground">{section.hint}</p>
          )}

          {section.description2 && (
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground/90 md:text-base">
              {section.description2}
            </p>
          )}
        </div>

        <VideoRestore hideTitle />
      </div>
    </section>
  );
}
