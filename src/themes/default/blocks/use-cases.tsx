'use client';

import { PlayCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

type UseCase = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  videoSrc?: string;
  tag?: string;
};

const defaultUseCases: UseCase[] = [
  {
    title: 'Creator Reenactment',
    description: 'Upload one reference clip and copy a ready-to-shoot prompt package.',
    imageSrc: '/imgs/features/landing-page.png',
    imageAlt: 'Creator reenactment workflow',
    videoSrc: '/videos/video_before.mp4',
    tag: 'Creator',
  },
  {
    title: 'Ad Variant Production',
    description: 'Convert winning ad footage into reusable prompt variants for testing.',
    imageSrc: '/imgs/features/1.png',
    imageAlt: 'Ad variant workflow',
    videoSrc: '/videos/video_after.mp4',
    tag: 'Marketing',
  },
  {
    title: 'Shot Planning',
    description: 'Extract scene logic into clear prompts and shot lists for execution.',
    imageSrc: '/imgs/features/2.png',
    imageAlt: 'Shot planning',
    tag: 'Production',
  },
  {
    title: 'Prompt Library Ops',
    description: 'Standardize incoming videos into searchable prompt assets for teams.',
    imageSrc: '/imgs/features/3.png',
    imageAlt: 'Prompt library operations',
    tag: 'Team',
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {useCases.map((useCase, index) => (
            <motion.div
              key={`${useCase.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card/60"
            >
              <div className="relative aspect-video overflow-hidden border-b border-border/60">
                {useCase.videoSrc ? (
                  <>
                    <video
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={useCase.videoSrc}
                      poster={useCase.imageSrc}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                    />
                    <div className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/50 p-1.5 text-white">
                      <PlayCircle className="h-4 w-4" />
                    </div>
                  </>
                ) : (
                  <Image
                    src={useCase.imageSrc}
                    alt={useCase.imageAlt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>

              <div className="space-y-2 p-4">
                {useCase.tag ? (
                  <div className="text-primary text-xs font-medium">{useCase.tag}</div>
                ) : null}
                <h3 className="text-base font-semibold text-foreground md:text-lg">
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
