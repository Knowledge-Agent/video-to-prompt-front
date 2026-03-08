/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://videotoprompt.ai',
  generateRobotsTxt: false,
  generateIndexSitemap: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
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
    '/pricing',
    '/zh/pricing',
  ],
  alternateRefs: [
    {
      href: process.env.NEXT_PUBLIC_APP_URL || 'https://videotoprompt.ai',
      hreflang: 'en',
    },
    {
      href: `${process.env.NEXT_PUBLIC_APP_URL || 'https://videotoprompt.ai'}/zh`,
      hreflang: 'zh',
    },
  ],
  additionalPaths: async () => {
    return [];
  },
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : config.changefreq,
      priority: path === '/' ? 1 : config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
