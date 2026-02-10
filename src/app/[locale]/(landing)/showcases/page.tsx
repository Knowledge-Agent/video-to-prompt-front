import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { JsonLd } from '@/shared/components/seo/json-ld';
import { getMetadata } from '@/shared/lib/seo';
import { getShowcasesJsonLd } from '@/shared/lib/structured-data';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.showcases.metadata',
  canonicalUrl: '/showcases',
});

export default async function ShowcasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // get page data
  const t = await getTranslations('pages.showcases');

  const page: DynamicPage = {
    title: t.raw('page.title'),
    sections: {
      showcases: {
        ...t.raw('page.sections.showcases'),
      },
    },
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  const showcasesJsonLd = getShowcasesJsonLd(locale);

  return (
    <>
      <JsonLd data={showcasesJsonLd} />
      <Page locale={locale} page={page} />
    </>
  );
}
