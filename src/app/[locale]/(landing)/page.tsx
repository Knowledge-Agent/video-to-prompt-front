import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { JsonLd } from '@/shared/components/seo/json-ld';
import { getMetadata } from '@/shared/lib/seo';
import {
  getFaqJsonLd,
  getHowToJsonLd,
  getWebsiteJsonLd,
} from '@/shared/lib/structured-data';
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

  const page: DynamicPage = t.raw('page');
  const faqJsonLd = getFaqJsonLd(
    locale,
    ((page.sections?.faq?.items as any[]) || []).map((item) => ({
      question: item.question,
      answer: item.answer,
    }))
  );
  const howToJsonLd = getHowToJsonLd(
    locale,
    ((page.sections?.usage?.items as any[]) || []).map((item) => ({
      title: item.title,
      description: item.description,
    }))
  );

  const jsonLd = [getWebsiteJsonLd(locale), faqJsonLd, howToJsonLd].filter(Boolean) as Record<string, unknown>[];
  const Page = await getThemePage('dynamic-page');

  return (
    <>
      <JsonLd data={jsonLd} />
      <Page locale={locale} page={page} />
    </>
  );
}
