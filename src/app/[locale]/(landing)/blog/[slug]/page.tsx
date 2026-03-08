import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';
import { Empty } from '@/shared/blocks/common';
import { JsonLd } from '@/shared/components/seo/json-ld';
import { getAlternateLanguageUrls } from '@/shared/lib/seo';
import { getBlogPostingJsonLd } from '@/shared/lib/structured-data';
import { getPost } from '@/shared/models/post';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('pages.blog.metadata');
  const relativePath = `/blog/${slug}`;

  const localeSegment = locale !== defaultLocale ? `/${locale}` : '';
  const canonicalUrl = `${envConfigs.app_url}${localeSegment}${relativePath}`;

  const post = await getPost({ slug, locale });
  const image = post?.image || envConfigs.app_preview_image;
  const imageUrl = image.startsWith('http')
    ? image
    : `${envConfigs.app_url}${image}`;

  if (!post) {
    return {
      title: `${slug} | ${t('title')}`,
      description: t('description'),
      alternates: {
        canonical: canonicalUrl,
        languages: getAlternateLanguageUrls(relativePath),
      },
      openGraph: {
        type: 'article',
        url: canonicalUrl,
        title: `${slug} | ${t('title')}`,
        description: t('description'),
        siteName: envConfigs.app_name,
        images: [imageUrl],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${slug} | ${t('title')}`,
        description: t('description'),
        images: [imageUrl],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  return {
    title: `${post.title} | ${t('title')}`,
    description: post.description,
    alternates: {
      canonical: canonicalUrl,
      languages: getAlternateLanguageUrls(relativePath),
    },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title: `${post.title} | ${t('title')}`,
      description: post.description,
      siteName: envConfigs.app_name,
      images: [imageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | ${t('title')}`,
      description: post.description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
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
      <JsonLd
        data={
          getBlogPostingJsonLd({
            locale,
            slug,
            title: post.title,
            description: post.description,
            authorName: post.author_name,
            image: post.image,
            publishedAt: post.date || post.created_at,
            updatedAt: post.date || post.created_at,
          })
        }
      />
      <Page locale={locale} page={page} />
    </>
  );
}
