import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';
import { getAlternateLanguageUrls } from '@/shared/lib/seo';
import { getLocalPage } from '@/shared/models/post';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let title = '';
  let description = '';

  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  if (staticPageSlug.includes('.')) {
    return;
  }

  const relativePath = `/${staticPageSlug}`;
  const canonicalUrl =
    locale !== defaultLocale
      ? `${envConfigs.app_url}/${locale}/${staticPageSlug}`
      : `${envConfigs.app_url}/${staticPageSlug}`;

  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  if (staticPage) {
    title = staticPage.title || '';
    description = staticPage.description || '';

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
        languages: getAlternateLanguageUrls(relativePath),
      },
    };
  }

  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  const messageKey = `pages.${dynamicPageSlug}`;
  const t = await getTranslations({ locale, namespace: messageKey });

  if (t.has('metadata')) {
    title = t.raw('metadata.title');
    description = t.raw('metadata.description');

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
        languages: getAlternateLanguageUrls(relativePath),
      },
    };
  }

  const tc = await getTranslations('common.metadata');

  title = tc('title');
  description = tc('description');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguageUrls(relativePath),
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  if (staticPageSlug.includes('.')) {
    return notFound();
  }

  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  if (staticPage) {
    const Page = await getThemePage('static-page');

    return <Page locale={locale} post={staticPage} />;
  }

  const dynamicPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  const messageKey = `pages.${dynamicPageSlug}`;

  try {
    const t = await getTranslations({ locale, namespace: messageKey });

    if (t.has('page')) {
      const Page = await getThemePage('dynamic-page');
      return <Page locale={locale} page={t.raw('page')} />;
    }
  } catch (error) {
    return notFound();
  }

  return notFound();
}
