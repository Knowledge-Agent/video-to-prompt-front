'use client';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Cta({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section id={section.id} className={cn('relative py-20 md:py-28', section.className, className)}>
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-card to-primary/8 px-6 py-12 text-center md:px-10 md:py-16">
          <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

          <ScrollAnimation>
            <h2 className="mx-auto max-w-4xl text-3xl font-semibold tracking-tight md:text-5xl">
              {section.title}
            </h2>
          </ScrollAnimation>

          <ScrollAnimation delay={0.15}>
            <p
              className="text-muted-foreground mx-auto mt-4 max-w-2xl text-base leading-7 md:text-lg"
              dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
            />
          </ScrollAnimation>

          <ScrollAnimation delay={0.3}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {section.buttons?.map((button, idx) => (
                <Button
                  asChild
                  size={button.size || 'default'}
                  variant={button.variant || 'default'}
                  key={idx}
                  className={cn(
                    button.variant === 'outline' &&
                      'border-border/80 bg-background/40 hover:border-primary/60'
                  )}
                >
                  <Link href={button.url || ''} target={button.target || '_self'}>
                    {button.icon && <SmartIcon name={button.icon as string} />}
                    <span>{button.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
