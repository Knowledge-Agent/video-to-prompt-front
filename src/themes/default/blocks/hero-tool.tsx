/**
 * Hero Tool Block - First screen with video restoration tool
 * Full viewport height layout for homepage
 * pos: src/themes/default/blocks/hero-tool.tsx
 */
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

      {/* Video Restore Tool - centered vertically */}
      <div className="flex flex-1 items-center">
        <VideoRestore srOnlyTitle={section.title} srOnlyDescription={section.description} />
      </div>
    </section>
  );
}
