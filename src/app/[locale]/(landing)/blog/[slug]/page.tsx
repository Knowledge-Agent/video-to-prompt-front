import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';
import { Empty } from '@/shared/blocks/common';
import { JsonLd } from '@/shared/components/seo/json-ld';
import {
  getBlogBreadcrumbJsonLd,
  getBlogPostingJsonLd,
} from '@/shared/lib/structured-data';
import { getPost } from '@/shared/models/post';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

function toAbsoluteUrl(pathOrUrl: string) {
  const baseUrl = envConfigs.app_url.replace(/\/$/, '');

  if (!pathOrUrl) {
    return baseUrl;
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${baseUrl}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('pages.blog.metadata');

  const appUrl = envConfigs.app_url.replace(/\/$/, '');

  const getLocalizedBlogUrl = (targetLocale: string) =>
    targetLocale !== defaultLocale
      ? `${appUrl}/${targetLocale}/blog/${slug}`
      : `${appUrl}/blog/${slug}`;

  const canonicalUrl = getLocalizedBlogUrl(locale);
  const languageAlternates = Object.fromEntries([
    ...locales.map((targetLocale) => [
      targetLocale,
      getLocalizedBlogUrl(targetLocale),
    ]),
    ['x-default', getLocalizedBlogUrl(defaultLocale)],
  ]);

  const post = await getPost({ slug, locale });
  if (!post) {
    const fallbackImageUrl = toAbsoluteUrl(envConfigs.app_preview_image);

    return {
      title: `${slug} | ${t('title')}`,
      description: t('description'),
      alternates: {
        canonical: canonicalUrl,
        languages: languageAlternates,
      },
      openGraph: {
        type: 'article',
        url: canonicalUrl,
        title: `${slug} | ${t('title')}`,
        description: t('description'),
        images: [fallbackImageUrl],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${slug} | ${t('title')}`,
        description: t('description'),
        images: [fallbackImageUrl],
      },
    };
  }

  const imageUrl = toAbsoluteUrl(post.image || envConfigs.app_preview_image);
  const title = `${post.title} | ${t('title')}`;

  return {
    title,
    description: post.description,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      type: 'article',
      locale,
      url: canonicalUrl,
      title,
      description: post.description,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
      images: [imageUrl],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await getPost({ slug, locale });

  if (!post) {
    return <Empty message={`Post not found`} />;
  }

  const blogPostingJsonLd = getBlogPostingJsonLd({
    locale,
    slug,
    title: post.title,
    description: post.description,
    authorName: post.author_name,
    image: post.image,
    publishedAt: post.date || post.created_at,
    updatedAt: post.created_at,
  });
  const breadcrumbJsonLd = getBlogBreadcrumbJsonLd({
    locale,
    slug,
    title: post.title,
  });

  // build page sections
  const page: DynamicPage = {
    sections: {
      blogDetail: {
        block: 'blog-detail',
        data: {
          post,
        },
      },
    },
  };

  const Page = await getThemePage('dynamic-page');

  return (
    <>
      <JsonLd data={blogPostingJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <Page locale={locale} page={page} />
    </>
  );
}
