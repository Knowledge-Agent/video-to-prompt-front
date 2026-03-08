import { respData, respErr } from '@/shared/lib/resp';
import {
  createNewsletterSubscriber,
  isValidNewsletterEmail,
} from '@/shared/models/newsletter_subscriber';

function getRequestIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for') || '';
  const realIp = req.headers.get('x-real-ip') || '';

  const ip = forwardedFor
    .split(',')
    .map((item) => item.trim())
    .find(Boolean);

  return (ip || realIp || '').trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '');
    const source = String(body?.source || 'landing_subscribe');
    const locale = String(body?.locale || '');

    if (!isValidNewsletterEmail(email)) {
      return respErr('invalid email');
    }

    const result = await createNewsletterSubscriber({
      email,
      source,
      locale,
      ip: getRequestIp(req),
      userAgent: req.headers.get('user-agent') || '',
    });

    return respData({
      created: result.created,
    });
  } catch (e) {
    console.log('newsletter subscribe failed:', e);
    return respErr('subscribe failed');
  }
}
