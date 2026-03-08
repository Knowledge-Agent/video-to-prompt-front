import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

function normalizeRelativePath(pathOrUrl?: string) {
  let value = (pathOrUrl || '/').trim();

  if (!value) {
    return '/';
  }

  if (value.startsWith('http')) {
    try {
      value = new URL(value).pathname || '/';
    } catch {
      return '/';
    }
  }

  if (!value.startsWith('/')) {
    value = `/${value}`;
  }

  if (value !== '/' && value.endsWith('/')) {
    value = value.slice(0, -1);
  }

  return value || '/';
}

export function getAlternateLanguageUrls(pathOrUrl?: string) {
  const normalizedPath = normalizeRelativePath(pathOrUrl);
  const languages = Object.fromEntries(
    locales.map((locale) => {
      const localePrefix = locale === defaultLocale ? '' : `/${locale}`;
      const localizedPath =
        normalizedPath === '/'
          ? `${envConfigs.app_url}${localePrefix || '/'}`
          : `${envConfigs.app_url}${localePrefix}${normalizedPath}`;

      return [locale, localizedPath];
    })
  ) as Record<string, string>;

  languages['x-default'] = languages[defaultLocale];

  return languages;
}

export function getMetadata(
  options: {
    title?: string;
    description?: string;
    keywords?: string;
    metadataKey?: string;
    canonicalUrl?: string;
    imageUrl?: string;
    appName?: string;
    noIndex?: boolean;
  } = {}
) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const passedMetadata = {
      title: options.title,
      description: options.description,
      keywords: options.keywords,
    };

    const defaultMetadata = await getTranslatedMetadata(
      defaultMetadataKey,
      locale
    );

    let translatedMetadata: any = {};
    if (options.metadataKey) {
      translatedMetadata = await getTranslatedMetadata(
        options.metadataKey,
        locale
      );
    }

    const canonicalUrl = await getCanonicalUrl(
      options.canonicalUrl || '',
      locale || ''
    );

    const title =
      passedMetadata.title || translatedMetadata.title || defaultMetadata.title;
    const description =
      passedMetadata.description ||
      translatedMetadata.description ||
      defaultMetadata.description;

    let imageUrl = options.imageUrl || envConfigs.app_preview_image;
    if (!imageUrl.startsWith('http')) {
      imageUrl = `${envConfigs.app_url}${imageUrl}`;
    }

    let appName = options.appName;
    if (!appName) {
      appName = envConfigs.app_name || '';
    }

    return {
      title,
      description,
      keywords:
        passedMetadata.keywords ||
        translatedMetadata.keywords ||
        defaultMetadata.keywords,
      alternates: {
        canonical: canonicalUrl,
        languages: getAlternateLanguageUrls(options.canonicalUrl || '/'),
      },
      openGraph: {
        type: 'website',
        locale: locale,
        url: canonicalUrl,
        title,
        description,
        siteName: appName,
        images: [imageUrl.toString()],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl.toString()],
        site: envConfigs.app_url,
      },
      robots: {
        index: options.noIndex ? false : true,
        follow: options.noIndex ? false : true,
      },
    };
  };
}

const defaultMetadataKey = 'common.metadata';

async function getTranslatedMetadata(metadataKey: string, locale: string) {
  setRequestLocale(locale);
  const t = await getTranslations(metadataKey);

  return {
    title: t.has('title') ? t('title') : '',
    description: t.has('description') ? t('description') : '',
    keywords: t.has('keywords') ? t('keywords') : '',
  };
}

async function getCanonicalUrl(canonicalUrl: string, locale: string) {
  if (!canonicalUrl) {
    canonicalUrl = '/';
  }

  if (!canonicalUrl.startsWith('http')) {
    const normalizedPath = normalizeRelativePath(canonicalUrl);
    canonicalUrl = `${envConfigs.app_url}${
      !locale || locale === defaultLocale ? '' : `/${locale}`
    }${normalizedPath === '/' ? '/' : normalizedPath}`;

    if (locale !== defaultLocale && canonicalUrl.endsWith('/')) {
      canonicalUrl = canonicalUrl.slice(0, -1);
    }
  }

  return canonicalUrl;
}
