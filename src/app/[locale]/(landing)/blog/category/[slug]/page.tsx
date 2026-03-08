import moment from 'moment';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { defaultLocale } from '@/config/locale';
import { Empty } from '@/shared/blocks/common';
import { JsonLd } from '@/shared/components/seo/json-ld';
import { getAlternateLanguageUrls } from '@/shared/lib/seo';
import { getBlogListJsonLd } from '@/shared/lib/structured-data';
import {
  PostType as DBPostType,
  PostStatus,
  getLocalPostsAndCategories,
  getPosts,
} from '@/shared/models/post';
import {
  TaxonomyStatus,
  TaxonomyType,
  findTaxonomy,
  getTaxonomies,
} from '@/shared/models/taxonomy';
import {
  Category as CategoryType,
  Post as PostType,
} from '@/shared/types/blocks/blog';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600;

function categoryTitleFromSlug(slug: string) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('pages.blog.metadata');
  const prettified = categoryTitleFromSlug(slug);
  const relativePath = `/blog/category/${slug}`;

  return {
    title: `${prettified} | ${t('title')}`,
    description: t('description'),
    alternates: {
      canonical: `${envConfigs.app_url}${locale !== defaultLocale ? `/${locale}` : ''}${relativePath}`,
      languages: getAlternateLanguageUrls(relativePath),
    },
  };
}

export default async function CategoryBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.blog');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  let categoryData = null;

  try {
    categoryData = await findTaxonomy({
      slug,
      status: TaxonomyStatus.PUBLISHED,
    });
  } catch (error) {
    console.log('find category from database failed:', error);
  }

  const categories: CategoryType[] = [
    {
      id: 'all',
      slug: 'all',
      title: t('messages.all'),
      url: '/blog',
    },
  ];

  let currentCategory: CategoryType | null = null;
  let posts: PostType[] = [];

  if (categoryData) {
    try {
      const postsData = await getPosts({
        category: categoryData.id,
        type: DBPostType.ARTICLE,
        status: PostStatus.PUBLISHED,
        page,
        limit,
      });

      const categoriesData = await getTaxonomies({
        type: TaxonomyType.CATEGORY,
        status: TaxonomyStatus.PUBLISHED,
      });

      categories.push(
        ...categoriesData.map((category) => ({
          id: category.id,
          slug: category.slug,
          title: category.title,
          url: `/blog/category/${category.slug}`,
        }))
      );

      currentCategory = {
        id: categoryData.id,
        slug: categoryData.slug,
        title: categoryData.title,
        url: `/blog/category/${categoryData.slug}`,
      };

      posts = postsData.map((post) => ({
        id: post.id,
        title: post.title || '',
        description: post.description || '',
        author_name: post.authorName || '',
        author_image: post.authorImage || '',
        created_at: moment(post.createdAt).format('MMM D, YYYY') || '',
        image: post.image || '',
        url: `/blog/${post.slug}`,
      }));
    } catch (error) {
      console.log('load category posts from database failed:', error);
      categoryData = null;
    }
  }

  if (!categoryData) {
    const { posts: localPosts, categories: localCategories } =
      await getLocalPostsAndCategories({
        locale,
        postPrefix: '/blog/',
        categoryPrefix: '/blog/category/',
      });

    categories.push(...localCategories);
    currentCategory =
      localCategories.find((category) => category.slug === slug) || null;

    if (currentCategory) {
      posts = localPosts.filter((post) =>
        Array.isArray(post.categories)
          ? post.categories.some((category) => {
              if (typeof category === 'string') {
                return category === slug;
              }
              return category?.slug === slug;
            })
          : false
      );
    }
  }

  if (!currentCategory) {
    return <Empty message={`category not found`} />;
  }

  const pageData: DynamicPage = {
    title: t('page.title'),
    sections: {
      blog: {
        ...t.raw('page.sections.blog'),
        data: {
          categories,
          currentCategory,
          posts,
        },
      },
    },
  };

  const Page = await getThemePage('dynamic-page');

  return (
    <>
      <JsonLd data={getBlogListJsonLd(locale)} />
      <Page locale={locale} page={pageData} />
    </>
  );
}
