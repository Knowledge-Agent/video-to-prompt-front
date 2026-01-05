# Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # Locale-prefixed routes
│   │   ├── (admin)/        # Admin dashboard (protected)
│   │   ├── (auth)/         # Auth pages (sign-in, sign-up, verify)
│   │   ├── (chat)/         # AI chat interface
│   │   ├── (docs)/         # Documentation pages
│   │   └── (landing)/      # Public pages (home, pricing, blog)
│   └── api/                # API routes
│       ├── ai/             # AI generation endpoints
│       ├── auth/           # Auth handlers
│       ├── chat/           # Chat API
│       ├── payment/        # Payment webhooks/checkout
│       └── user/           # User data endpoints
│
├── config/                 # App configuration
│   ├── db/                 # Database schemas (postgres, mysql, sqlite)
│   ├── locale/             # i18n messages by locale
│   ├── style/              # Global CSS, theme CSS
│   └── theme/              # Theme configuration
│
├── core/                   # Core infrastructure
│   ├── auth/               # better-auth setup
│   ├── db/                 # Drizzle DB connections
│   ├── docs/               # fumadocs source config
│   ├── i18n/               # next-intl routing
│   ├── rbac/               # Role-based access control
│   └── theme/              # Theme loader utilities
│
├── extensions/             # Pluggable integrations
│   ├── ads/                # Ad providers (AdSense)
│   ├── affiliate/          # Affiliate tracking
│   ├── ai/                 # AI providers (Replicate, Gemini, etc.)
│   ├── analytics/          # Analytics (GA, Plausible, Clarity)
│   ├── customer-service/   # Chat widgets (Crisp, Tawk)
│   ├── email/              # Email providers (Resend)
│   ├── payment/            # Payment providers (Stripe, PayPal, Creem)
│   └── storage/            # File storage (S3, R2)
│
├── shared/                 # Shared code
│   ├── blocks/             # Reusable UI blocks (chat, forms, tables)
│   ├── components/         # UI components (shadcn/ui, magicui)
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities (cn, seo, cache, rate-limit)
│   ├── models/             # Data models/queries (user, order, credit)
│   ├── services/           # Business logic (payment, analytics)
│   └── types/              # TypeScript types
│
└── themes/                 # Themeable components
    └── default/
        ├── blocks/         # Landing page sections (hero, features, etc.)
        ├── layouts/        # Page layouts
        └── pages/          # Page templates

content/                    # MDX content
├── docs/                   # Documentation
├── logs/                   # Changelog/updates
├── pages/                  # Legal pages (privacy, terms)
└── posts/                  # Blog posts

public/                     # Static assets
└── imgs/                   # Images (avatars, features, logos)
```

## Key Patterns

### Path Aliases
- `@/*` → `./src/*`
- `@/.source` → `./.source/index.ts` (fumadocs)

### Route Groups
- `(admin)`, `(auth)`, `(landing)` etc. for layout organization
- All under `[locale]` for i18n routing

### Theme System
- Themes in `src/themes/{themeName}/`
- Load via `getThemePage()`, `getThemeBlock()`, `getThemeLayout()`
- Blocks are PascalCase exports (e.g., `Hero`, `Features`)

### Extension Pattern
- Each extension exports a provider/manager class
- Configured via environment variables
- Services in `src/shared/services/` orchestrate extensions

### Database Schema
- Schema selected at build time based on `DATABASE_PROVIDER`
- Alias `@/config/db/schema` resolves to correct schema file
