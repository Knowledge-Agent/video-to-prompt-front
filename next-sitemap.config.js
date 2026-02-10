/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com',
  generateRobotsTxt: false, // 我们已经有了 robots.ts 文件
  generateIndexSitemap: true, // 生成索引文件
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/admin/*',
    '/api/*',
    '/settings/*',
    '/activity/*',
    '/sign-in',
    '/sign-up',
    '/verify-email',
    '/no-permission',
    '/chat/*',
  ],
  // 按 URL 动态生成 alternateRefs，避免路径重复前缀
  alternateRefs: [],
  // 自定义路径
  additionalPaths: async (config) => {
    const result = [];
    
    // 添加博客文章路径
    const blogPosts = [
      'video-to-prompt-system-design',
      'video-prompt-shot-language-framework',
      'video-to-prompt-quality-checklist',
    ];
    
    blogPosts.forEach(slug => {
      result.push({
        loc: `/blog/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
      result.push({
        loc: `/zh/blog/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    });
    
    // 添加更新日志路径
    const updates = ['v1.0', 'v2.0'];
    updates.forEach(version => {
      result.push({
        loc: `/updates/${version}`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      });
      result.push({
        loc: `/zh/updates/${version}`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      });
    });
    
    return result;
  },
  transform: async (config, path) => {
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com';

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    const withoutLocalePrefix =
      normalizedPath === '/zh'
        ? '/'
        : normalizedPath.startsWith('/zh/')
          ? normalizedPath.replace('/zh', '')
          : normalizedPath;

    const enHref = `${siteUrl}${withoutLocalePrefix}`;
    const zhHref =
      withoutLocalePrefix === '/'
        ? `${siteUrl}/zh`
        : `${siteUrl}/zh${withoutLocalePrefix}`;

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: [
        { href: enHref, hreflang: 'en' },
        { href: zhHref, hreflang: 'zh' },
      ],
    };
  },
};
