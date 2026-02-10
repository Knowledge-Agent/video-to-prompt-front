import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { JsonLd } from '@/shared/components/seo/json-ld';
import {
  getFaqJsonLd,
  getHowToJsonLd,
  getWebsiteJsonLd,
} from '@/shared/lib/structured-data';
import { getMetadata } from '@/shared/lib/seo';
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

  // load page component
  const Page = await getThemePage('dynamic-page');

  const websiteJsonLd = getWebsiteJsonLd(locale);
  const faqItems = (page.sections?.faq as { items?: Array<{ question?: string; answer?: string }> })?.items || [];
  const usageItems = (page.sections?.usage as { items?: Array<{ title?: string; description?: string }> })?.items || [];

  const faqJsonLd = getFaqJsonLd(locale, faqItems);
  const howToJsonLd = getHowToJsonLd(locale, usageItems);

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      {howToJsonLd ? <JsonLd data={howToJsonLd} /> : null}
      <Page locale={locale} page={page} />
    </>
  );
}
