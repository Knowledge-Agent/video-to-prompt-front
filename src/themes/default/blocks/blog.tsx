import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { Tabs } from '@/shared/blocks/common/tabs';
import { cn } from '@/shared/lib/utils';
import {
  Category as CategoryType,
  Post as PostType,
} from '@/shared/types/blocks/blog';
import { Tab } from '@/shared/types/blocks/common';
import { Section } from '@/shared/types/blocks/landing';

export function Blog({
  section,
  className,
  categories,
  currentCategory,
  posts,
}: {
  section: Section;
  className?: string;
  categories: CategoryType[];
  currentCategory: CategoryType;
  posts: PostType[];
}) {
  const t = useTranslations('pages.blog.messages');
  const tabs: Tab[] = [];

  categories?.forEach((category: CategoryType) => {
    tabs.push({
      name: category.slug,
      title: category.title,
      url:
        !category.slug || category.slug === 'all'
          ? '/blog'
          : `/blog/category/${category.slug}`,
      is_active: currentCategory?.slug === category.slug,
    });
  });

  return (
    <section id={section.id} className={cn('py-18 md:py-24', section.className, className)}>
      <div className="container">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {section.sr_only_title && <h1 className="sr-only">{section.sr_only_title}</h1>}
          <h2 className="mb-4 text-3xl font-bold tracking-tight lg:text-5xl">
            {section.title}
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg">
            {section.description}
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Tabs tabs={tabs} />
            </div>
          )}

          {posts && posts.length > 0 ? (
            <div className="grid w-full gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url || ''}
                  target={item.target || '_self'}
                  className="group flex h-full"
                >
                  <article className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-all hover:-translate-y-1 hover:border-primary/45">
                    {item.image && (
                      <div className="overflow-hidden border-b border-border/60">
                        <img
                          src={item.image}
                          alt={item.title || ''}
                          className="aspect-16/9 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
                      <h3 className="line-clamp-2 text-lg leading-snug font-semibold md:text-xl">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed md:text-base">
                        {item.description}
                      </p>

                      <div className="text-muted-foreground mt-auto flex items-center text-xs">
                        {item.created_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            {item.created_at}
                          </div>
                        )}
                        <div className="flex-1" />
                        {item.author_name && (
                          <div className="flex items-center gap-2">
                            {envConfigs.app_logo && (
                              <img
                                src={envConfigs.app_logo}
                                alt={envConfigs.app_name || item.author_name}
                                className="size-6 rounded-md object-contain"
                              />
                            )}
                            {item.author_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-base">{t('no_content')}</div>
          )}
        </div>
      </div>
    </section>
  );
}
