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
  const steps = section.items || [];

  return (
    <section
      id={section.id}
      className={cn('py-20 md:py-28', section.className, className)}
    >
      <div className="container">
        <ScrollAnimation>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-primary text-sm font-medium tracking-wide">
              {section.label}
            </span>
            <h2 className="text-foreground mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-7 md:text-lg">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3 md:gap-8">
            {steps.map((item, idx) => (
              <div
                className="border-border/60 bg-card/45 relative flex min-h-[280px] flex-col items-center rounded-2xl border px-6 py-8 text-center backdrop-blur-sm"
                key={idx}
              >
                <span className="bg-background/90 text-foreground border-border/70 mb-6 flex size-9 items-center justify-center rounded-full border text-sm font-semibold shadow-sm">
                  {idx + 1}
                </span>

                <div className="bg-primary/10 text-primary border-primary/15 mb-6 flex size-14 items-center justify-center rounded-2xl border">
                  {item.icon && (
                    <SmartIcon name={item.icon as string} size={24} />
                  )}
                </div>

                <h3 className="text-foreground max-w-72 text-xl leading-snug font-semibold">
                  {item.title}
                </h3>

                <p className="text-muted-foreground mt-4 max-w-72 text-base leading-7">
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
