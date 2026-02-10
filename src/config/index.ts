import packageJson from '../../package.json';

// Load .env files for scripts (tsx/ts-node) - but NOT in Edge Runtime or browser
// This ensures scripts can read DATABASE_URL and other env vars
// Check for real Node.js environment by looking at global 'process' properties
if (
  typeof process !== 'undefined' &&
  typeof process.cwd === 'function' &&
  !process.env.NEXT_RUNTIME // Skip if in Next.js runtime (already loaded)
) {
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.development' });
    dotenv.config({ path: '.env', override: false });
  } catch (e) {
    // Silently fail - dotenv might not be available in some environments
  }
}

export type ConfigMap = Record<string, string>;

export const envConfigs: ConfigMap = {
  app_url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  app_name: process.env.NEXT_PUBLIC_APP_NAME ?? 'Video to Prompt',
  app_description:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
    'Turn any video into structured, production-ready prompts for AI video generation.',
  app_logo:
    process.env.NEXT_PUBLIC_APP_LOGO ?? '/imgs/logos/video-to-prompt-logo.svg',
  app_favicon:
    process.env.NEXT_PUBLIC_APP_FAVICON ?? '/imgs/logos/video-to-prompt-logo.svg',
  app_preview_image:
    process.env.NEXT_PUBLIC_APP_PREVIEW_IMAGE ?? '/preview.png',
  theme: process.env.NEXT_PUBLIC_THEME ?? 'default',
  appearance: process.env.NEXT_PUBLIC_APPEARANCE ?? 'system',
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en',
  database_url: process.env.DATABASE_URL ?? '',
  database_auth_token: process.env.DATABASE_AUTH_TOKEN ?? '',
  database_provider: process.env.DATABASE_PROVIDER ?? 'postgresql',
  db_schema_file: process.env.DB_SCHEMA_FILE ?? './src/config/db/schema.ts',
  // PostgreSQL schema name (e.g. 'web'). Default: 'public'
  db_schema: process.env.DB_SCHEMA ?? 'public',
  // Drizzle migrations journal table name (avoid conflicts across projects)
  db_migrations_table:
    process.env.DB_MIGRATIONS_TABLE ?? '__drizzle_migrations',
  // Drizzle migrations journal schema (default in drizzle-kit is 'drizzle')
  // We keep 'public' as template default for stability on fresh Supabase DBs.
  db_migrations_schema: process.env.DB_MIGRATIONS_SCHEMA ?? 'drizzle',
  // Output folder for drizzle-kit generated migrations
  db_migrations_out:
    process.env.DB_MIGRATIONS_OUT ?? './src/config/db/migrations',
  db_singleton_enabled: process.env.DB_SINGLETON_ENABLED || 'false',
  db_max_connections: process.env.DB_MAX_CONNECTIONS || '1',
  auth_url: process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '',
  auth_secret: process.env.AUTH_SECRET ?? '', // openssl rand -base64 32
  version: packageJson.version,
  locale_detect_enabled:
    process.env.NEXT_PUBLIC_LOCALE_DETECT_ENABLED ?? 'false',
  // Aliyun OSS Storage
  aliyun_oss_region: process.env.ALIYUN_OSS_REGION ?? '',
  aliyun_oss_access_key_id: process.env.ALIYUN_OSS_ACCESS_KEY_ID ?? '',
  aliyun_oss_access_key_secret: process.env.ALIYUN_OSS_ACCESS_KEY_SECRET ?? '',
  aliyun_oss_bucket: process.env.ALIYUN_OSS_BUCKET ?? '',
  aliyun_oss_public_domain: process.env.ALIYUN_OSS_PUBLIC_DOMAIN ?? '',
  // Replicate AI
  replicate_api_token: process.env.REPLICATE_API_TOKEN ?? '',
  replicate_api_url:
    process.env.REPLICATE_API_URL ?? 'https://api.replicate.com/v1',
  // OpenRouter AI
  openrouter_api_key: process.env.OPENROUTER_API_KEY ?? '',
  openrouter_base_url:
    process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  // External Video-to-Prompt analyze API
  video_to_prompt_api_url:
    process.env.VIDEO_TO_PROMPT_API_URL ?? 'https://video-to-prompt.fly.dev/api/v1/video/analyze',
  video_to_prompt_api_key: process.env.VIDEO_TO_PROMPT_API_KEY ?? '',
};
