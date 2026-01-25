import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export const generateMetadata = getMetadata({
  metadataKey: 'common.metadata',
  canonicalUrl: '/',
  // SEO 优化：同时包含视频和图片关键词，标题控制在 60 字符以内
  title: 'SeedVR2',
  description:
    'Professional AI upscaler for videos and images. Upscale to 4K/8K, fix artifacts, restore details. No GPU, no ComfyUI setup needed.',
  keywords:
    'SeedVR2, AI video upscaler, image upscaler, video restoration, photo restoration, no GPU, online upscaler, 4K upscaling, 8K upscaling, fix artifacts',
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

  return <Page locale={locale} page={page} />;
}
