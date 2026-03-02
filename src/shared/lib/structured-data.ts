import { envConfigs } from '@/config';
import { defaultLocale, locales } from '@/config/locale';

type Locale = string;

type FaqItem = {
  question?: string;
  answer?: string;
};

type HowToStepItem = {
  title?: string;
  description?: string;
};

const SOCIAL_PROFILES = [
  'https://x.com/videotoprompt',
  'https://www.youtube.com/@videotoprompt',
];

function toAbsoluteUrl(pathOrUrl: string) {
  if (!pathOrUrl) {
    return envConfigs.app_url;
  }

  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${envConfigs.app_url}${path}`;
}

function sanitizeDate(dateLike?: string) {
  if (!dateLike) {
    return undefined;
  }

  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function getLocalizedPath(path: string, locale: Locale) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!locale || locale === defaultLocale) {
    return normalized;
  }
  return `/${locale}${normalized}`;
}

function buildInLanguage(locale: Locale) {
  if (!locale || locale === defaultLocale) {
    return 'en';
  }

  return locale;
}

function buildAlternateLanguage(locale: Locale, path: string) {
  const alternatives = locales
    .filter((loc) => loc !== locale)
    .map((loc) => toAbsoluteUrl(getLocalizedPath(path, loc)));

  return alternatives.length > 0 ? alternatives : undefined;
}

export function getWebsiteJsonLd(locale: Locale) {
  const currentPath = getLocalizedPath('/', locale);
  const currentUrl = toAbsoluteUrl(currentPath);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: envConfigs.app_name,
    url: currentUrl,
    inLanguage: buildInLanguage(locale),
    alternateName: ['Video Prompt Generator', 'Video Prompt Decomposer'],
    description: envConfigs.app_description,
    publisher: {
      '@type': 'Organization',
      name: envConfigs.app_name,
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(envConfigs.app_logo),
      },
      sameAs: SOCIAL_PROFILES,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${toAbsoluteUrl(getLocalizedPath('/blog', locale))}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getAiVideoGeneratorJsonLd(locale: Locale) {
  const currentPath = getLocalizedPath('/ai-video-generator', locale);
  const currentUrl = toAbsoluteUrl(currentPath);

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Video to Prompt Generator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    softwareVersion: '2.0.0',
    inLanguage: buildInLanguage(locale),
    url: currentUrl,
    image: toAbsoluteUrl(envConfigs.app_preview_image),
    description:
      'Upload one video and generate a structured prompt package including master prompt, short prompt, negative prompt, keywords, and shot list.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      category: 'Freemium',
    },
    featureList: [
      'Video scene analysis and decomposition',
      'Master prompt / short prompt / negative prompt output',
      'Keyword extraction and shot list generation',
      'Copy-ready prompt package for imitation shooting',
      'Bilingual output in English and Chinese',
    ],
    publisher: {
      '@type': 'Organization',
      name: envConfigs.app_name,
      url: toAbsoluteUrl('/'),
    },
  };
}

export function getBlogListJsonLd(locale: Locale) {
  const currentPath = getLocalizedPath('/blog', locale);
  const currentUrl = toAbsoluteUrl(currentPath);

  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Video to Prompt Blog',
    url: currentUrl,
    inLanguage: buildInLanguage(locale),
    description:
      'Articles about video-to-prompt workflow, shot language decomposition, and prompt package quality.',
    publisher: {
      '@type': 'Organization',
      name: envConfigs.app_name,
      url: toAbsoluteUrl('/'),
    },
    mainEntityOfPage: currentUrl,
  };
}

export function getBlogPostingJsonLd(args: {
  locale: Locale;
  slug: string;
  title?: string;
  description?: string;
  authorName?: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
}) {
  const {
    locale,
    slug,
    title,
    description,
    authorName,
    image,
    publishedAt,
    updatedAt,
  } = args;

  const currentPath = getLocalizedPath(`/blog/${slug}`, locale);
  const currentUrl = toAbsoluteUrl(currentPath);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title || 'Video to Prompt Article',
    description: description || envConfigs.app_description,
    inLanguage: buildInLanguage(locale),
    mainEntityOfPage: currentUrl,
    url: currentUrl,
    image: toAbsoluteUrl(image || envConfigs.app_preview_image),
    author: {
      '@type': 'Person',
      name: authorName || 'Video to Prompt Team',
    },
    publisher: {
      '@type': 'Organization',
      name: envConfigs.app_name,
      logo: {
        '@type': 'ImageObject',
        url: toAbsoluteUrl(envConfigs.app_logo),
      },
    },
    datePublished: sanitizeDate(publishedAt),
    dateModified: sanitizeDate(updatedAt || publishedAt),
    isPartOf: {
      '@type': 'Blog',
      name: 'Video to Prompt Blog',
      url: toAbsoluteUrl(getLocalizedPath('/blog', locale)),
    },
    keywords: [
      'video to prompt',
      'prompt engineering',
      'shot list',
      'ai video workflow',
    ],
    alternateName: buildAlternateLanguage(locale, `/blog/${slug}`),
  };
}

export function getBlogBreadcrumbJsonLd(args: {
  locale: Locale;
  slug: string;
  title?: string;
}) {
  const { locale, slug, title } = args;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Blog',
        item: toAbsoluteUrl(getLocalizedPath('/blog', locale)),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title || 'Article',
        item: toAbsoluteUrl(getLocalizedPath(`/blog/${slug}`, locale)),
      },
    ],
  };
}

export function getPricingJsonLd(locale: Locale) {
  const currentPath = getLocalizedPath('/pricing', locale);
  const currentUrl = toAbsoluteUrl(currentPath);

  const offers = [
    {
      '@type': 'Offer',
      name: 'Starter Monthly',
      price: '9',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: currentUrl,
    },
    {
      '@type': 'Offer',
      name: 'Pro Monthly',
      price: '29',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: currentUrl,
    },
    {
      '@type': 'Offer',
      name: 'Business Monthly',
      price: '99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: currentUrl,
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Video to Prompt',
    description:
      'Video to Prompt pricing plans for creators and teams who need repeatable prompt package generation from reference videos.',
    brand: {
      '@type': 'Brand',
      name: envConfigs.app_name,
    },
    image: toAbsoluteUrl(envConfigs.app_preview_image),
    url: currentUrl,
    offers,
  };
}

export function getShowcasesJsonLd(locale: Locale) {
  const currentPath = getLocalizedPath('/showcases', locale);
  const currentUrl = toAbsoluteUrl(currentPath);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Video to Prompt Use Cases',
    description:
      'A collection of practical use cases for video-to-prompt workflows across creators, marketing, and production teams.',
    url: currentUrl,
    inLanguage: buildInLanguage(locale),
  };
}

export function getUpdatesJsonLd(locale: Locale) {
  const currentPath = getLocalizedPath('/updates', locale);
  const currentUrl = toAbsoluteUrl(currentPath);

  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Video to Prompt Changelog',
    description:
      'Official changelog page for Video to Prompt, including release updates and workflow improvements.',
    url: currentUrl,
    inLanguage: buildInLanguage(locale),
  };
}


export function getFaqJsonLd(locale: Locale, items: FaqItem[] = []) {
  const mainEntity = items
    .filter((item) => item.question && item.answer)
    .map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }));

  if (mainEntity.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: buildInLanguage(locale),
    mainEntity,
  };
}

export function getHowToJsonLd(locale: Locale, steps: HowToStepItem[] = []) {
  const howToSteps = steps
    .filter((step) => step.title)
    .map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description || step.title,
    }));

  if (howToSteps.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to turn a video into prompts',
    description:
      'Upload a reference video, analyze visual language, and copy a structured prompt package for imitation shooting.',
    inLanguage: buildInLanguage(locale),
    totalTime: 'PT3M',
    step: howToSteps,
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Video to Prompt',
      },
    ],
  };
}
