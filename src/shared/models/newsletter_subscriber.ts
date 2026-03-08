import { desc, eq } from 'drizzle-orm';

import { newsletterSubscriber } from '@/config/db/schema';
import { db } from '@/core/db';
import { getUuid } from '@/shared/lib/hash';

export type NewsletterSubscriber = typeof newsletterSubscriber.$inferSelect;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(input: string): string {
  return String(input || '').trim().toLowerCase();
}

export function isValidNewsletterEmail(input: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(input));
}

export async function createNewsletterSubscriber(input: {
  email: string;
  source?: string;
  locale?: string;
  ip?: string;
  userAgent?: string;
}) {
  const email = normalizeEmail(input.email);
  if (!isValidNewsletterEmail(email)) {
    throw new Error('invalid email');
  }

  const [existing] = await db()
    .select()
    .from(newsletterSubscriber)
    .where(eq(newsletterSubscriber.email, email))
    .limit(1);

  if (existing) {
    return { created: false, subscriber: existing };
  }

  const [createdSubscriber] = await db()
    .insert(newsletterSubscriber)
    .values({
      id: getUuid(),
      email,
      status: 'active',
      source: String(input.source || '')
        .trim()
        .slice(0, 80),
      locale: String(input.locale || '')
        .trim()
        .slice(0, 20),
      ip: String(input.ip || '')
        .trim()
        .slice(0, 45),
      userAgent: String(input.userAgent || '')
        .trim()
        .slice(0, 500),
    })
    .returning();

  return { created: true, subscriber: createdSubscriber };
}

export async function getNewsletterSubscribers({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<NewsletterSubscriber[]> {
  return await db()
    .select()
    .from(newsletterSubscriber)
    .orderBy(desc(newsletterSubscriber.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);
}
