import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { defaultLocale } from '@/config/locale';

export const revalidate = 3600;

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const target = locale === defaultLocale ? '/' : `/${locale}`;
  redirect(target);
}
