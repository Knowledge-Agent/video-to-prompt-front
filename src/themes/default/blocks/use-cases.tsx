'use client';

import Image from 'next/image';
import { PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type UseCase = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
  tag?: string;
  highlights?: string[];
};

const defaultUseCases: UseCase[] = [
  {
    title: 'Creator Reenactment',
    description:
      'Upload one reference clip and copy a ready-to-shoot prompt package.',
    imageSrc: '/imgs/features/landing-page.png',
    imageAlt: 'Creator reenactment workflow',
    tag: 'Creator',
    highlights: ['reference clip', 'camera pace', 'prompt pack'],
  },
  {
    title: 'Ad Variant Production',
    description:
      'Convert winning ad footage into reusable prompt variants for testing.',
    imageSrc: '/imgs/features/1.png',
    imageAlt: 'Ad variant workflow',
    tag: 'Marketing',
    highlights: ['winning ad', 'hook beat', 'variant reuse'],
  },
  {
    title: 'Shot Planning',
    description:
      'Extract scene logic into clear prompts and shot lists for execution.',
    imageSrc: '/imgs/features/2.png',
    imageAlt: 'Shot planning',
    tag: 'Production',
    highlights: ['shot list', 'scene logic', 'execution'],
  },
  {
    title: 'Prompt Library Ops',
    description:
      'Standardize incoming videos into searchable prompt assets for teams.',
    imageSrc: '/imgs/features/3.png',
    imageAlt: 'Prompt library operations',
    tag: 'Team',
    highlights: ['tagging', 'searchable', 'shared assets'],
  },
];

export function UseCases({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const useCases: UseCase[] =
    section.items?.map((item) => ({
      title: item.title || '',
      description: item.description || '',
      imageSrc: item.image?.src || '/imgs/features/landing-page.png',
      imageAlt: item.image?.alt || item.title || 'Use case',
      videoSrc: typeof item.video === 'string' ? item.video : undefined,
      tag: typeof item.tag === 'string' ? item.tag : undefined,
      highlights: Array.isArray(item.highlights)
        ? item.highlights.map((entry) => String(entry))
        : undefined,
    })) || defaultUseCases;

  return (
    <section
      id={section.id}
      className={cn('py-20 md:py-28', section.className, className)}
    >
      <div className="container">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
            className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl"
          >
            {section.title || 'Use Cases'}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: 0.04 }}
            className="text-muted-foreground text-base md:text-lg"
          >
            {section.description ||
              'Choose a scenario and apply the same upload → analyze → copy workflow.'}
          </motion.p>
        </div>

        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
          {useCases.map((useCase, index) => (
            <motion.div
              key={`${useCase.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="group border-border/70 bg-card/60 flex h-full flex-col overflow-hidden rounded-2xl border"
            >
              <div className="border-border/60 relative aspect-video overflow-hidden border-b">
                <Image
                  src={useCase.imageSrc}
                  alt={useCase.imageAlt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="from-background via-background/28 absolute inset-0 bg-gradient-to-t to-transparent" />

                {useCase.tag ? (
                  <div className="absolute top-4 left-4 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm">
                    {useCase.tag}
                  </div>
                ) : null}

                {useCase.videoSrc ? (
                  <div className="pointer-events-none absolute top-4 right-4 rounded-full border border-white/15 bg-black/35 p-2 text-white/90 backdrop-blur-sm">
                    <PlayCircle className="h-4 w-4" />
                  </div>
                ) : null}

                {useCase.highlights?.length ? (
                  <div className="absolute right-4 bottom-4 left-4 flex flex-wrap gap-2">
                    {useCase.highlights.slice(0, 3).map((highlight) => (
                      <span
                        key={`${useCase.title}-${highlight}`}
                        className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-foreground text-base font-semibold md:text-lg">
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-6">
                  {useCase.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
