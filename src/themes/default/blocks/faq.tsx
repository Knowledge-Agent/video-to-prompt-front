'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Faq({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section id={section.id} className={cn('relative py-20 md:py-28', section.className, className)}>
      <div className="container mx-auto max-w-4xl px-4 md:px-8">
        <ScrollAnimation>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight md:text-5xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="mt-10 rounded-2xl border border-border/70 bg-card/55 p-2 backdrop-blur md:p-3">
            <Accordion type="single" collapsible className="w-full">
              {section.items?.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={item.question || item.title || `faq-${idx}`}
                  className="rounded-xl border-b border-border/60 px-4 py-1 last:border-b-0 md:px-5"
                >
                  <AccordionTrigger className="cursor-pointer text-left text-base font-medium hover:no-underline">
                    {item.question || item.title || ''}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-7 text-muted-foreground md:text-base">
                    {item.answer || item.description || ''}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <p
            className="text-muted-foreground mt-6 text-center text-sm"
            dangerouslySetInnerHTML={{ __html: section.tip || '' }}
          />
        </ScrollAnimation>
      </div>
    </section>
  );
}
