'use client';

import { SmartIcon } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FeaturesStep({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section id={section.id} className={cn('relative py-20 md:py-28', section.className, className)}>
      <div className="container">
        <ScrollAnimation>
          <div className="mx-auto max-w-3xl text-center">
            {section.label && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                {section.label}
              </span>
            )}
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base md:text-lg">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.15}>
          <div className="relative mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
            <div className="absolute top-9 left-1/2 hidden h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-primary/0 via-primary/35 to-primary/0 md:block" />

            {section.items?.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur"
              >
                <div className="mb-5 flex items-center gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold text-primary">
                    {idx + 1}
                  </span>
                  <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    {item.icon && <SmartIcon name={item.icon as string} size={20} />}
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
