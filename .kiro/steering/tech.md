# Tech Stack

## Core Framework
- Next.js 16 (App Router with Turbopack)
- React 19
- TypeScript 5

## Styling
- Tailwind CSS 4
- shadcn/ui components (Radix UI primitives)
- class-variance-authority for component variants
- tailwind-merge + clsx via `cn()` utility

## Database
- Drizzle ORM with multi-database support:
  - PostgreSQL (default)
  - MySQL
  - SQLite/Turso
- Schema files in `src/config/db/schema*.ts`

## Authentication
- better-auth library
- Social providers + email/password
- Email verification flow

## Internationalization
- next-intl for routing and translations
- Supported locales: `en`, `zh`
- Messages in `src/config/locale/messages/`

## Documentation/Content
- fumadocs-mdx for docs
- MDX for blog posts, changelogs, legal pages

## Payments
- Stripe, PayPal, Creem integrations
- Credits system with expiration

## AI Integrations
- Vercel AI SDK
- Replicate, Gemini, OpenRouter providers

## Deployment
- Vercel (default)
- Cloudflare Workers (via opennextjs-cloudflare)
- Docker support

---

## Common Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack

# Build
pnpm build            # Production build
pnpm build:fast       # Build with increased memory

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes (dev)
pnpm db:studio        # Open Drizzle Studio

# Auth
pnpm auth:generate    # Generate better-auth types

# RBAC
pnpm rbac:init        # Initialize roles/permissions
pnpm rbac:assign      # Assign role to user

# Code Quality
pnpm lint             # ESLint
pnpm format           # Prettier format
pnpm format:check     # Check formatting

# Cloudflare
pnpm cf:preview       # Preview on CF Workers
pnpm cf:deploy        # Deploy to CF Workers
```

## Environment Variables
- Copy `.env.example` to `.env`
- Key vars: `DATABASE_URL`, `DATABASE_PROVIDER`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
- Payment keys: `STRIPE_*`, `PAYPAL_*`, `CREEM_*`
