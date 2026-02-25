export type TemplateEventName =
  | 'template_view'
  | 'template_click'
  | 'template_copy'
  | 'template_apply'
  | 'template_analyze_start'
  | 'template_analyze_success';

export interface TemplateEventPayload {
  eventName: TemplateEventName;
  templateId: string;
  templateName?: string;
  styleTag?: string;
  source?: string;
  locale?: string;
  metadata?: Record<string, unknown>;
}

export interface ActiveTemplateContext {
  templateId: string;
  templateName?: string;
  styleTag?: string;
  source?: string;
  updatedAt?: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') || '';
const SESSION_STORAGE_KEY = 'template_event_session_id';
const ACTIVE_TEMPLATE_STORAGE_KEY = 'active_template_context';
const ACTIVE_TEMPLATE_MAX_AGE_MS = 1000 * 60 * 60 * 12;

function toApiUrl(path: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

function normalizeTemplateId(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, 120);
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

function getTemplateSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      return existing;
    }

    const generated =
      (window.crypto?.randomUUID?.() ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`).slice(0, 120);

    window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
    return generated;
  } catch {
    return '';
  }
}

export function setActiveTemplateContext(input: ActiveTemplateContext): void {
  if (typeof window === 'undefined') {
    return;
  }

  const templateId = normalizeTemplateId(input.templateId);
  if (!templateId) {
    return;
  }

  const payload: ActiveTemplateContext = {
    templateId,
    templateName: normalizeText(input.templateName, 180) || undefined,
    styleTag: normalizeText(input.styleTag, 80) || undefined,
    source: normalizeText(input.source, 80) || undefined,
    updatedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(
      ACTIVE_TEMPLATE_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch {
    // ignore persistence errors
  }
}

export function getActiveTemplateContext(
  fallbackSource = 'video_to_prompt'
): ActiveTemplateContext {
  if (typeof window === 'undefined') {
    return {
      templateId: 'direct-video-upload',
      templateName: 'Direct Upload',
      source: fallbackSource,
    };
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_TEMPLATE_STORAGE_KEY);
    if (!raw) {
      return {
        templateId: 'direct-video-upload',
        templateName: 'Direct Upload',
        source: fallbackSource,
      };
    }

    const parsed = JSON.parse(raw) as ActiveTemplateContext;
    const templateId = normalizeTemplateId(parsed.templateId);
    const updatedAt =
      typeof parsed.updatedAt === 'number' ? parsed.updatedAt : undefined;

    if (!templateId) {
      throw new Error('invalid template context id');
    }

    if (updatedAt && Date.now() - updatedAt > ACTIVE_TEMPLATE_MAX_AGE_MS) {
      window.localStorage.removeItem(ACTIVE_TEMPLATE_STORAGE_KEY);
      return {
        templateId: 'direct-video-upload',
        templateName: 'Direct Upload',
        source: fallbackSource,
      };
    }

    return {
      templateId,
      templateName: normalizeText(parsed.templateName, 180) || undefined,
      styleTag: normalizeText(parsed.styleTag, 80) || undefined,
      source: normalizeText(parsed.source, 80) || fallbackSource,
      updatedAt,
    };
  } catch {
    return {
      templateId: 'direct-video-upload',
      templateName: 'Direct Upload',
      source: fallbackSource,
    };
  }
}

export async function trackTemplateEvent(payload: TemplateEventPayload) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!payload.templateId || !payload.eventName) {
    return;
  }

  const requestBody = {
    ...payload,
    pagePath: `${window.location.pathname}${window.location.search}`,
    sessionId: getTemplateSessionId(),
  };

  const endpoint = toApiUrl('/api/analytics/template-event');

  try {
    const serialized = JSON.stringify(requestBody);

    if (navigator.sendBeacon) {
      const blob = new Blob([serialized], { type: 'application/json' });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) {
        return;
      }
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serialized,
      keepalive: true,
    });
  } catch {
    // ignore analytics errors
  }
}
