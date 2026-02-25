import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

export default function robots(): MetadataRoute.Robots {
  const appUrl = (envConfigs.app_url || 'https://videotoprompt.ai').replace(
    /\/$/,
    ''
  );

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/settings/*',
          '/activity/*',
          '/admin/*',
          '/api/*',
          '/*?*q=',
        ],
      },
    ],
    host: appUrl,
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
