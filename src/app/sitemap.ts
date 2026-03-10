import { existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';
import { docsSource, pagesSource } from '@/core/docs/source';
import { getLocalPostsAndCategories, PostType } from '@/shared/models/post';

const ROOT_ROUTES = [
  '/',
  '/blog',
  '/ai-video-generator',
  '/showcases',
  '/updates',
  '/docs',
  '/privacy-policy',
  '/terms-of-service',
] as const;

function normalizeBaseUrl() {
  return (envConfigs.app_url || 'https://videotoprompt.ai').replace(/\/$/, '');
}

function getLocalizedPath(pathname: string, locale: string) {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (!locale || locale === defaultLocale) {
    return normalizedPath;
  }

  if (normalizedPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

function toAbsoluteUrl(pathname: string) {
  return `${normalizeBaseUrl()}${pathname}`;
}

function getAlternateLanguages(path: string) {
  const localizedEntries = locales.map((locale) => [
    locale,
    toAbsoluteUrl(getLocalizedPath(path, locale)),
  ]);

  return Object.fromEntries([
    ...localizedEntries,
    ['x-default', toAbsoluteUrl(getLocalizedPath(path, defaultLocale))],
  ]);
}

function getUpdatePath(slug: string) {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');

  if (!normalizedSlug) {
    return '/updates';
  }

  if (normalizedSlug.startsWith('logs/')) {
    return `/updates/${normalizedSlug.replace(/^logs\//, '')}`;
  }

  const logsSegmentIndex = normalizedSlug.indexOf('/logs/');
  if (logsSegmentIndex >= 0) {
    return `/updates/${normalizedSlug.slice(logsSegmentIndex + '/logs/'.length)}`;
  }

  return `/updates/${normalizedSlug}`;
}

function toValidDate(dateLike?: string | Date | null) {
  if (!dateLike) {
    return undefined;
  }

  const parsed = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function maxDate(...dates: Array<Date | undefined>) {
  const valid = dates.filter(Boolean) as Date[];
  if (valid.length === 0) {
    return new Date();
  }

  return new Date(Math.max(...valid.map((date) => date.getTime())));
}

function getFileModifiedDate(relativePath: string) {
  const absolutePath = path.join(process.cwd(), relativePath);
  if (!existsSync(absolutePath)) {
    return undefined;
  }

  return statSync(absolutePath).mtime;
}

function getDirectoryLatestModifiedDate(relativeDir: string): Date | undefined {
  const absoluteDir = path.join(process.cwd(), relativeDir);
  if (!existsSync(absoluteDir)) {
    return undefined;
  }

  let latest: Date | undefined;

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        const mtime = statSync(fullPath).mtime;
        latest = latest ? maxDate(latest, mtime) : mtime;
      }
    }
  };

  walk(absoluteDir);
  return latest;
}

function inferLocalizedContentPath(
  collection: 'pages' | 'docs',
  pathname: string,
  locale: string
) {
  const normalized = pathname.replace(/^\//, '');
  const withoutPrefix = normalized.startsWith(`${locale}/`)
    ? normalized.slice(locale.length + 1)
    : normalized;

  const slug = collection === 'docs'
    ? withoutPrefix.replace(/^docs\/?/, '') || 'index'
    : withoutPrefix || 'index';

  const localizedSuffix = locale === defaultLocale ? '' : `.${locale}`;
  return `content/${collection}/${slug}${localizedSuffix}.mdx`;
}

function getLocalizedContentDate(
  collection: 'pages' | 'docs',
  pathname: string,
  locale: string,
  frontmatterDate?: string
) {
  return maxDate(
    toValidDate(frontmatterDate),
    getFileModifiedDate(inferLocalizedContentPath(collection, pathname, locale))
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  const addEntry = (
    pathname: string,
    data: Omit<MetadataRoute.Sitemap[number], 'url'>
  ) => {
    const url = toAbsoluteUrl(pathname);
    entries.set(url, {
      url,
      ...data,
    });
  };

  const blogByLocale = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      ...(await getLocalPostsAndCategories({
        locale,
        postPrefix: '/blog/',
        categoryPrefix: '/blog/category/',
        type: PostType.ARTICLE,
      })),
    }))
  );

  const latestBlogDate = maxDate(
    ...blogByLocale.flatMap(({ posts }) =>
      posts.map((post) => toValidDate(post.date || post.created_at))
    )
  );

  const latestUpdatesDate = getDirectoryLatestModifiedDate('content/logs');
  const latestDocsDate = getDirectoryLatestModifiedDate('content/docs');
  const latestHomepageDate = maxDate(
    getFileModifiedDate('src/app/[locale]/(landing)/page.tsx'),
    getFileModifiedDate('src/config/locale/messages/en/pages/index.json'),
    getFileModifiedDate('src/config/locale/messages/zh/pages/index.json'),
    getFileModifiedDate('src/config/locale/messages/en/common.json'),
    getFileModifiedDate('src/config/locale/messages/zh/common.json')
  );
  const latestAiVideoDate = maxDate(
    getFileModifiedDate('src/app/[locale]/(landing)/(ai)/ai-video-generator/page.tsx'),
    getFileModifiedDate('src/config/locale/messages/en/ai/video.json'),
    getFileModifiedDate('src/config/locale/messages/zh/ai/video.json')
  );
  const latestShowcasesDate = maxDate(
    getFileModifiedDate('src/app/[locale]/(landing)/showcases/page.tsx'),
    getFileModifiedDate('src/config/locale/messages/en/pages/showcases.json'),
    getFileModifiedDate('src/config/locale/messages/zh/pages/showcases.json')
  );

  const rootRouteLastMod: Record<(typeof ROOT_ROUTES)[number], Date> = {
    '/': latestHomepageDate,
    '/blog': latestBlogDate,
    '/ai-video-generator': latestAiVideoDate,
    '/showcases': latestShowcasesDate,
    '/updates': latestUpdatesDate || new Date(),
    '/docs': latestDocsDate || new Date(),
    '/privacy-policy': maxDate(
      getFileModifiedDate('content/pages/privacy-policy.mdx'),
      getFileModifiedDate('content/pages/privacy-policy.zh.mdx')
    ),
    '/terms-of-service': maxDate(
      getFileModifiedDate('content/pages/terms-of-service.mdx'),
      getFileModifiedDate('content/pages/terms-of-service.zh.mdx')
    ),
  };

  ROOT_ROUTES.forEach((route) => {
    locales.forEach((locale) => {
      addEntry(getLocalizedPath(route, locale), {
        lastModified: rootRouteLastMod[route],
        changeFrequency: route === '/' ? 'daily' : 'weekly',
        priority: route === '/' ? 1 : route === '/blog' ? 0.9 : 0.75,
        alternates: {
          languages: getAlternateLanguages(route),
        },
      });
    });
  });

  for (const locale of locales) {
    const docsPages = docsSource.getPages(locale) || [];
    docsPages.forEach((docPage) => {
      const normalizedPath =
        locale === defaultLocale && docPage.url.startsWith(`/${locale}/`)
          ? docPage.url.replace(new RegExp(`^/${locale}`), '') || '/docs'
          : docPage.url;

      addEntry(normalizedPath, {
        lastModified: getLocalizedContentDate(
          'docs',
          normalizedPath,
          locale,
          (docPage.data as any)?.created_at
        ),
        changeFrequency: 'monthly',
        priority: normalizedPath === '/docs' ? 0.7 : 0.55,
        alternates: {
          languages: getAlternateLanguages(
            normalizedPath.startsWith(`/${locale}/`) && locale !== defaultLocale
              ? normalizedPath.replace(new RegExp(`^/${locale}`), '') || '/docs'
              : normalizedPath
          ),
        },
      });
    });

    const staticPages = pagesSource.getPages(locale) || [];
    staticPages.forEach((staticPage) => {
      const normalizedPath =
        locale === defaultLocale && staticPage.url.startsWith(`/${locale}/`)
          ? staticPage.url.replace(new RegExp(`^/${locale}`), '') || '/'
          : staticPage.url;

      addEntry(normalizedPath, {
        lastModified: getLocalizedContentDate(
          'pages',
          normalizedPath,
          locale,
          (staticPage.data as any)?.created_at
        ),
        changeFrequency: 'yearly',
        priority: 0.4,
        alternates: {
          languages: getAlternateLanguages(
            normalizedPath.startsWith(`/${locale}/`) && locale !== defaultLocale
              ? normalizedPath.replace(new RegExp(`^/${locale}`), '') || '/'
              : normalizedPath
          ),
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

      const path = getUpdatePath(post.slug);
      const lastModified = maxDate(
        toValidDate(post.date || post.created_at),
        getFileModifiedDate(
          `content/logs/${post.slug}${locale === defaultLocale ? '' : `.${locale}`}.mdx`
        )
      );

      addEntry(getLocalizedPath(path, locale), {
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: getAlternateLanguages(path),
        },
      });
    });
  }

  const categoryLatestByLocale = new Map<string, Date>();

  for (const { locale, posts, categories } of blogByLocale) {
    posts.forEach((post) => {
      if (!post.slug) {
        return;
      }

      const stableDate = maxDate(
        toValidDate(post.date || post.created_at),
        getFileModifiedDate(
          `content/posts/${post.slug}${locale === defaultLocale ? '' : `.${locale}`}.mdx`
        )
      );
      const path = getLocalizedPath(`/blog/${post.slug}`, locale);

      addEntry(path, {
        lastModified: stableDate,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: {
          languages: getAlternateLanguages(`/blog/${post.slug}`),
        },
      });

      const postCategories = Array.isArray(post.categories) ? post.categories : [];
      postCategories.forEach((category) => {
        const categorySlug = typeof category === 'string' ? category : category?.slug;
        if (!categorySlug) {
          return;
        }
        const key = `${locale}:${categorySlug}`;
        categoryLatestByLocale.set(
          key,
          categoryLatestByLocale.has(key)
            ? maxDate(categoryLatestByLocale.get(key), stableDate)
            : stableDate
        );
      });
    });

    categories.forEach((category) => {
      if (!category.slug) {
        return;
      }

      const path = getLocalizedPath(`/blog/category/${category.slug}`, locale);
      const stableDate =
        categoryLatestByLocale.get(`${locale}:${category.slug}`) || latestBlogDate;

      addEntry(path, {
        lastModified: stableDate,
        changeFrequency: 'weekly',
        priority: 0.65,
        alternates: {
          languages: getAlternateLanguages(`/blog/category/${category.slug}`),
        },
      });
    });
  }

  return Array.from(entries.values()).sort((a, b) => a.url.localeCompare(b.url));
}
