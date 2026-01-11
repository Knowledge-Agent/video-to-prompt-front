/**
 * AI Music Generator Page - DISABLED
 * This page is temporarily disabled for SeedVR2 launch.
 * SeedVR2 focuses on video restoration only.
 * To re-enable: uncomment the code below and remove the redirect.
 */

import { redirect } from 'next/navigation';

export default function AiMusicGeneratorPage() {
  redirect('/');
}

/*
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { MusicGenerator } from '@/shared/blocks/generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'ai.music.metadata',
  canonicalUrl: '/ai-music-generator',
});

export default async function AiMusicGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // get ai music data
  const t = await getTranslations('ai.music');

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
        component: <MusicGenerator srOnlyTitle={t.raw('generator.title')} />,
      },
    },
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
*/
