import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { VideoRestore } from '@/shared/blocks/generator';
import { JsonLd } from '@/shared/components/seo/json-ld';
import { getMetadata } from '@/shared/lib/seo';
import { getAiVideoGeneratorJsonLd } from '@/shared/lib/structured-data';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'ai.video.metadata',
  canonicalUrl: '/ai-video-generator',
});

export default async function AiVideoGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // get ai video data
  const t = await getTranslations('ai.video');

  // build page sections
  const page: DynamicPage = {
    sections: {
      hero: {
        title: t.raw('page.title'),
        description: t.raw('page.description'),
        background_image: {
          src: '/imgs/bg/tree.jpg',
          alt: 'hero background',
        },
      },
      generator: {
        component: <VideoRestore srOnlyTitle={t.raw('generator.title')} />,
      },
    },
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  const aiVideoGeneratorJsonLd = getAiVideoGeneratorJsonLd(locale);

  return (
    <>
      <JsonLd data={aiVideoGeneratorJsonLd} />
      <Page locale={locale} page={page} />
    </>
  );
}
