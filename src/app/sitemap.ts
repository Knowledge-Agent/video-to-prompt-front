import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';
import { getLocalPostsAndCategories, PostType } from '@/shared/models/post';

const ROOT_ROUTES = [
  '/',
  '/blog',
  '/pricing',
  '/ai-video-generator',
  '/showcases',
  '/updates',
] as const;

function normalizeBaseUrl() {
  return (envConfigs.app_url || 'http://localhost:3000').replace(/\/$/, '');
}

function getLocalizedPath(path: string, locale: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!locale || locale === defaultLocale) {
    return normalizedPath;
  }

  if (normalizedPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

function toAbsoluteUrl(path: string) {
  const baseUrl = normalizeBaseUrl();
  return `${baseUrl}${path}`;
}

function getAlternateLanguages(path: string) {
  return Object.fromEntries(
    locales.map((locale) => [locale, toAbsoluteUrl(getLocalizedPath(path, locale))])
  );
}

function getLastModified(dateLike?: string) {
  if (!dateLike) {
    return new Date();
  }

  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  ROOT_ROUTES.forEach((route) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: toAbsoluteUrl(getLocalizedPath(route, locale)),
        lastModified: new Date(),
        changeFrequency: route === '/' ? 'daily' : 'weekly',
        priority: route === '/' ? 1 : 0.8,
        alternates: {
          languages: getAlternateLanguages(route),
        },
      });
    });
  });

  for (const locale of locales) {
    const { posts: blogPosts } = await getLocalPostsAndCategories({
      locale,
      postPrefix: '/blog/',
      type: PostType.ARTICLE,
    });

    blogPosts.forEach((post) => {
      if (!post.slug) {
        return;
      }

      const path = `/blog/${post.slug}`;

      sitemapEntries.push({
        url: toAbsoluteUrl(getLocalizedPath(path, locale)),
        lastModified: getLastModified(post.date || post.created_at),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: getAlternateLanguages(path),
        },
      });
    });

    const { posts: updatePosts } = await getLocalPostsAndCategories({
      locale,
      postPrefix: '/updates/',
      type: PostType.LOG,
    });

    updatePosts.forEach((post) => {
      if (!post.slug) {
        return;
      }

      const path = `/updates/${post.slug}`;

      sitemapEntries.push({
        url: toAbsoluteUrl(getLocalizedPath(path, locale)),
        lastModified: getLastModified(post.date || post.created_at),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: getAlternateLanguages(path),
        },
      });
    });
  }

  return sitemapEntries;
}
