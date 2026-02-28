import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { JsonLd } from '@/shared/components/seo/json-ld';
import {
  getAiVideoGeneratorJsonLd,
  getFaqJsonLd,
  getHowToJsonLd,
  getWebsiteJsonLd,
} from '@/shared/lib/structured-data';
import { getMetadata } from '@/shared/lib/seo';
import { getLocalPostsAndCategories } from '@/shared/models/post';
import {
  Category as CategoryType,
  Post as PostType,
} from '@/shared/types/blocks/blog';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.index.metadata',
  canonicalUrl: '/',
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.index');

  // get page data
  const page: DynamicPage = t.raw('page');

  let featuredPosts: PostType[] = [];
  const currentCategory: CategoryType = {
    id: 'all',
    slug: 'all',
    title: locale === 'zh' ? '全部' : 'All',
    url: '/blog',
  };

  try {
    const { posts } = await getLocalPostsAndCategories({
      locale,
      postPrefix: '/blog/',
    });
    featuredPosts = posts.slice(0, 3);
  } catch (error) {
    console.log('get landing featured posts failed:', error);
  }

  const enrichedPage: DynamicPage = {
    ...page,
    sections: {
      ...page.sections,
      ...(page.sections?.blog
        ? {
            blog: {
              ...(page.sections.blog as any),
              data: {
                categories: [],
                currentCategory,
                posts: featuredPosts,
              },
            },
          }
        : {}),
    },
  };

  const websiteJsonLd = getWebsiteJsonLd(locale);
  const softwareJsonLd = getAiVideoGeneratorJsonLd(locale);
  const faqItems =
    (page.sections?.faq as { items?: Array<{ question?: string; answer?: string }> })?.items || [];
  const usageItems =
    (page.sections?.usage as { items?: Array<{ title?: string; description?: string }> })?.items || [];

  const faqJsonLd = getFaqJsonLd(locale, faqItems);
  const howToJsonLd = getHowToJsonLd(locale, usageItems);

  const Page = await getThemePage('dynamic-page');

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={softwareJsonLd} />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      {howToJsonLd ? <JsonLd data={howToJsonLd} /> : null}
      <Page locale={locale} page={enrichedPage} />
    </>
  );
}
