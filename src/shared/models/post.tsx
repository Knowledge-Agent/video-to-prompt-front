import { getMDXComponents } from '@/mdx-components';
import { and, count, desc, eq, like } from 'drizzle-orm';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import moment from 'moment';

import { envConfigs } from '@/config';
import { db } from '@/core/db';
import { logsSource, pagesSource, postsSource } from '@/core/docs/source';
import { generateTOC } from '@/core/docs/toc';
import { post } from '@/config/db/schema';
import { MarkdownContent } from '@/shared/blocks/common/markdown-content';
import {
  Category as BlogCategoryType,
  Post as BlogPostType,
} from '@/shared/types/blocks/blog';

import { getTaxonomies, TaxonomyStatus, TaxonomyType } from './taxonomy';

export type Post = typeof post.$inferSelect;
export type NewPost = typeof post.$inferInsert;
export type UpdatePost = Partial<Omit<NewPost, 'id' | 'createdAt'>>;

export enum PostType {
  ARTICLE = 'article',
  PAGE = 'page',
  LOG = 'log',
}

export enum PostStatus {
  PUBLISHED = 'published', // published and visible to the public
  PENDING = 'pending', // pending review by admin
  DRAFT = 'draft', // draft and not visible to the public
  ARCHIVED = 'archived', // archived means deleted
}

function isRemoteDbConfigured() {
  const provider = envConfigs.database_provider;
  if (provider === 'postgresql' || provider === 'mysql') {
    return Boolean(envConfigs.database_url);
  }

  if (provider === 'turso') {
    return Boolean(envConfigs.database_url && envConfigs.database_auth_token);
  }

  // sqlite can use local file without explicit DATABASE_URL
  return true;
}

export async function addPost(data: NewPost) {
  const [result] = await db().insert(post).values(data).returning();

  return result;
}

export async function updatePost(id: string, data: UpdatePost) {
  const [result] = await db()
    .update(post)
    .set(data)
    .where(eq(post.id, id))
    .returning();

  return result;
}

export async function deletePost(id: string) {
  const result = await updatePost(id, {
    status: PostStatus.ARCHIVED,
  });

  return result;
}

export async function findPost({
  id,
  slug,
  status,
}: {
  id?: string;
  slug?: string;
  status?: PostStatus;
}) {
  const [result] = await db()
    .select()
    .from(post)
    .where(
      and(
        id ? eq(post.id, id) : undefined,
        slug ? eq(post.slug, slug) : undefined,
        status ? eq(post.status, status) : undefined
      )
    )
    .limit(1);

  return result;
}

export async function getPosts({
  type,
  status,
  category,
  tag,
  page = 1,
  limit = 30,
}: {
  type?: PostType;
  status?: PostStatus;
  category?: string;
  tag?: string[];
  page?: number;
  limit?: number;
} = {}): Promise<Post[]> {
  const result = await db()
    .select()
    .from(post)
    .where(
      and(
        type ? eq(post.type, type) : undefined,
        status ? eq(post.status, status) : undefined,
        category ? like(post.categories, `%${category}%`) : undefined,
        tag ? like(post.tags, `%${tag}%`) : undefined
      )
    )
    .orderBy(desc(post.updatedAt), desc(post.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return result;
}

export async function getPostsCount({
  type,
  status,
  category,
  tag,
}: {
  type?: PostType;
  status?: PostStatus;
  category?: string;
  tag?: string;
} = {}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(post)
    .where(
      and(
        type ? eq(post.type, type) : undefined,
        status ? eq(post.status, status) : undefined,
        category ? like(post.categories, `%${category}%`) : undefined,
        tag ? like(post.tags, `%${tag}%`) : undefined
      )
    )
    .limit(1);

  return result?.count || 0;
}

// get single post, both from local file and database
// database post has higher priority
export async function getPost({
  slug,
  locale,
  postPrefix = '/blog/',
}: {
  slug: string;
  locale: string;
  postPrefix?: string;
}): Promise<BlogPostType | null> {
  let post: BlogPostType | null = null;

  if (!isRemoteDbConfigured()) {
    return getLocalPost({ slug, locale, postPrefix });
  }

  try {
    // get post from database
    const postData = await findPost({ slug, status: PostStatus.PUBLISHED });
    if (postData) {
      // post exist in database
      const content = postData.content || '';

      // Convert markdown content to MarkdownContent component
      const body = content ? <MarkdownContent content={content} /> : undefined;

      // Generate TOC from content
      const toc = content ? generateTOC(content) : undefined;

      post = {
        id: postData.id,
        slug: postData.slug,
        title: postData.title || '',
        description: postData.description || '',
        content: '',
        body: body,
        toc: toc,
        created_at:
          getPostDate({
            created_at: postData.createdAt.toISOString(),
            locale,
          }) || '',
        author_name: postData.authorName || '',
        author_image: postData.authorImage || '',
        author_role: '',
        url: `${postPrefix}${postData.slug}`,
      };

      return post;
    }
  } catch (e) {
    console.log('get post from database failed:', e);
  }

  // get post from locale file
  const localPost = await getLocalPost({ slug, locale, postPrefix });

  return localPost;
}

export async function getLocalPost({
  slug,
  locale,
  postPrefix = '/blog/',
}: {
  slug: string;
  locale: string;
  postPrefix?: string;
}): Promise<BlogPostType | null> {
  const localPost = await postsSource.getPage([slug], locale);
  if (!localPost) {
    return null;
  }

  const MDXContent = localPost.data.body;
  const body = (
    <MDXContent
      components={getMDXComponents({
        // this allows you to link to other pages with relative file paths
        a: createRelativeLink(postsSource, localPost),
      })}
    />
  );

  const frontmatter = localPost.data as any;

  const post: BlogPostType = {
    id: localPost.path,
    slug: slug,
    title: localPost.data.title || '',
    description: localPost.data.description || '',
    content: '',
    body: body,
    toc: localPost.data.toc, // Use fumadocs auto-generated TOC
    created_at: frontmatter.created_at
      ? getPostDate({
          created_at: frontmatter.created_at,
          locale,
        })
      : '',
    date: frontmatter.date || frontmatter.created_at || '',
    image: frontmatter.image || '',
    author_name: frontmatter.author_name || '',
    author_image: frontmatter.author_image || '',
    author_role: '',
    categories: frontmatter.categories || [],
    tags: frontmatter.tags || [],
    url: `${postPrefix}${slug}`,
  };

  return post;
}

// get local page from: content/pages/*.md
export async function getLocalPage({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}): Promise<BlogPostType | null> {
  const localPage = await pagesSource.getPage([slug], locale);
  if (!localPage) {
    return null;
  }

  const MDXContent = localPage.data.body;
  const body = (
    <MDXContent
      components={getMDXComponents({
        // this allows you to link to other pages with relative file paths
        a: createRelativeLink(pagesSource, localPage),
      })}
    />
  );

  const frontmatter = localPage.data as any;

  const post: BlogPostType = {
    id: localPage.path,
    slug: slug,
    title: localPage.data.title || '',
    description: localPage.data.description || '',
    content: '',
    body: body,
    toc: localPage.data.toc, // Use fumadocs auto-generated TOC
    created_at: frontmatter.created_at
      ? getPostDate({
          created_at: frontmatter.created_at,
          locale,
        })
      : '',
    author_name: frontmatter.author_name || '',
    author_image: frontmatter.author_image || '',
    author_role: '',
    url: `/${locale}/${slug}`,
  };

  return post;
}

// get posts and categories, both from local files and database
export async function getPostsAndCategories({
  page = 1,
  limit = 30,
  locale,
  postPrefix = '/blog/',
  categoryPrefix = '/blog/category/',
}: {
  page?: number;
  limit?: number;
  locale: string;
  postPrefix?: string;
  categoryPrefix?: string;
}) {
  let posts: BlogPostType[] = [];
  let categories: BlogCategoryType[] = [];

  const postsMap = new Map<string, BlogPostType>();
  const categoryMap = new Map<string, BlogCategoryType>();

  const { posts: localPosts, categories: localCategories } =
    await getLocalPostsAndCategories({
      locale,
      postPrefix,
      categoryPrefix,
    });

  localPosts.forEach((post) => {
    if (post.slug) {
      postsMap.set(post.slug, post);
    }
  });

  localCategories.forEach((category) => {
    if (category.slug) {
      categoryMap.set(category.slug, category);
    }
  });

  const { posts: remotePosts, categories: remoteCategories } =
    await getRemotePostsAndCategories({
      page,
      limit,
      locale,
      postPrefix,
      categoryPrefix,
    });

  remotePosts.forEach((post) => {
    if (post.slug) {
      postsMap.set(post.slug, post);
    }
  });

  remoteCategories.forEach((category) => {
    if (category.slug) {
      categoryMap.set(category.slug, category);
    }
  });

  const toTimestamp = (value?: string) => {
    if (!value) return 0;
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  posts = Array.from(postsMap.values()).sort((a, b) => {
    const dateA = toTimestamp(a.date || a.created_at);
    const dateB = toTimestamp(b.date || b.created_at);
    return dateB - dateA;
  });

  categories = Array.from(categoryMap.values()).sort((a, b) =>
    (a.title || '').localeCompare(b.title || '')
  );

  return {
    posts,
    postsCount: posts.length,
    categories,
    categoriesCount: categories.length,
  };
}

// get remote posts and categories
export async function getRemotePostsAndCategories({
  page = 1,
  limit = 30,
  locale,
  postPrefix = '/blog/',
  categoryPrefix = '/blog/category/',
}: {
  page?: number;
  limit?: number;
  locale: string;
  postPrefix?: string;
  categoryPrefix?: string;
}) {
  if (!isRemoteDbConfigured()) {
    return {
      posts: [],
      postsCount: 0,
      categories: [],
      categoriesCount: 0,
    };
  }

  const dbPostsList: BlogPostType[] = [];
  const dbCategoriesList: BlogCategoryType[] = [];

  try {
    // get posts from database
    const dbPosts = await getPosts({
      type: PostType.ARTICLE,
      status: PostStatus.PUBLISHED,
      page,
      limit,
    });

    if (!dbPosts || dbPosts.length === 0) {
      return {
        posts: [],
        postsCount: 0,
        categories: [],
        categoriesCount: 0,
      };
    }

    dbPostsList.push(
      ...dbPosts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title || '',
        description: post.description || '',
        author_name: post.authorName || '',
        author_image: post.authorImage || '',
        created_at:
          getPostDate({
            created_at: post.createdAt.toISOString(),
            locale,
          }) || '',
        image: post.image || '',
        url: `${postPrefix}${post.slug}`,
      }))
    );

    // get categories from database
    const dbCategories = await getTaxonomies({
      type: TaxonomyType.CATEGORY,
      status: TaxonomyStatus.PUBLISHED,
    });

    dbCategoriesList.push(
      ...(dbCategories || []).map((category) => ({
        id: category.id,
        slug: category.slug,
        title: category.title,
        url: `${categoryPrefix}${category.slug}`,
      }))
    );
  } catch (e) {
    console.log('get remote posts and categories failed:', e);
  }

  return {
    posts: dbPostsList,
    postsCount: dbPostsList.length,
    categories: dbCategoriesList,
    categoriesCount: dbCategoriesList.length,
  };
}

// get local posts and categories
export async function getLocalPostsAndCategories({
  locale,
  postPrefix = '/blog/',
  categoryPrefix = '/blog/category/',
  type = PostType.ARTICLE,
}: {
  locale: string;
  postPrefix?: string;
  categoryPrefix?: string;
  type?: PostType;
}) {
  const localPostsList: BlogPostType[] = [];
  const localCategoriesMap = new Map<string, BlogCategoryType>();

  let localPosts = postsSource.getPages(locale);
  if (type === PostType.LOG) {
    localPosts = logsSource.getPages(locale);
  }

  if (!localPosts || localPosts.length === 0) {
    return {
      posts: [],
      postsCount: 0,
      categories: [],
      categoriesCount: 0,
    };
  }

  const toCategoryTitle = (slug: string) =>
    slug
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  localPostsList.push(
    ...localPosts.map((post) => {
      const frontmatter = post.data as any;
      const slug = getPostSlug({
        url: post.url,
        locale,
        prefix: postPrefix,
      });

      let body: React.ReactNode = undefined;
      if (type === PostType.LOG) {
        const MDXContent = post.data.body;
        body = <MDXContent components={getMDXComponents()} />;
      }

      const createdAt = frontmatter.created_at
        ? getPostDate({
            created_at: frontmatter.created_at,
            locale,
          })
        : '';

      const postCategories = Array.isArray(frontmatter.categories)
        ? frontmatter.categories.filter(Boolean)
        : [];

      postCategories.forEach((categorySlug: string) => {
        if (!localCategoriesMap.has(categorySlug)) {
          localCategoriesMap.set(categorySlug, {
            id: categorySlug,
            slug: categorySlug,
            title: toCategoryTitle(categorySlug),
            url: `${categoryPrefix}${categorySlug}`,
          });
        }
      });

      return {
        id: post.path,
        slug: slug,
        title: post.data.title || '',
        description: post.data.description || '',
        author_name: frontmatter.author_name || '',
        author_image: frontmatter.author_image || '',
        created_at: createdAt,
        date: frontmatter.date || frontmatter.created_at || createdAt,
        image: frontmatter.image || '',
        url: `${postPrefix}${slug}`,
        version: frontmatter.version || '',
        tags: frontmatter.tags || [],
        categories: postCategories,
        body,
      };
    })
  );

  const categories = Array.from(localCategoriesMap.values()).sort((a, b) =>
    (a.title || '').localeCompare(b.title || '')
  );

  return {
    posts: localPostsList,
    postsCount: localPostsList.length,
    categories,
    categoriesCount: categories.length,
  };
}

// Helper function to replace slug for local posts
export function getPostSlug({
  url,
  locale,
  prefix = '/blog/',
}: {
  url: string; // post url, like: /zh/blog/what-is-xxx
  locale: string; // locale
  prefix?: string; // post slug prefix
}): string {
  if (url.startsWith(prefix)) {
    return url.replace(prefix, '');
  } else if (url.startsWith(`/${locale}${prefix}`)) {
    return url.replace(`/${locale}${prefix}`, '');
  }

  return url;
}

export function getPostDate({
  created_at,
  locale,
}: {
  created_at: string;
  locale?: string;
}) {
  return moment(created_at)
    .locale(locale || 'en')
    .format(locale === 'zh' ? 'YYYY/MM/DD' : 'MMM D, YYYY');
}

// Helper function to remove frontmatter from markdown content
export function removePostFrontmatter(content: string): string {
  // Match frontmatter pattern: ---\n...content...\n---
  const frontmatterRegex = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
  return content.replace(frontmatterRegex, '').trim();
}
