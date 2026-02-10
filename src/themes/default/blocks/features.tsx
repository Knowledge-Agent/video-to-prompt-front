'use client';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Features({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section id={section.id} className={cn('relative py-20 md:py-28', section.className, className)}>
      <div className="container space-y-10 md:space-y-14">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-base md:text-lg">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.15}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {section.items?.map((item, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/55 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card/80"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <SmartIcon name={item.icon as string} size={20} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground/80">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground md:text-xl">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">
                  {item.description}
                </p>

                <div className="pointer-events-none absolute -right-8 -bottom-8 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
