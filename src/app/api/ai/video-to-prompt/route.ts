import { envConfigs } from '@/config';
import { respData, respErr } from '@/shared/lib/resp';

export const runtime = 'nodejs';

const MAX_INPUT_DURATION_SECONDS = 60 * 60;
const EXTERNAL_STATUS_OK = new Set(['completed', 'success', 'done']);

type PromptLanguage = 'en' | 'zh';

type JsonRecord = Record<string, unknown>;

interface PromptPackage {
  summary: string;
  masterPrompt: string;
  shortPrompt: string;
  negativePrompt: string;
  keywords: string[];
  shots: string[];
}

interface AnalyzeResult {
  status: string;
  primaryCategory: string;
  promptPackage: PromptPackage;
}

function normalizeMediaUrl(value: unknown): string {
  const url = typeof value === 'string' ? value.trim() : '';
  if (!url) {
    throw new Error('video url is required');
  }

  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('invalid protocol');
    }
    return parsed.toString();
  } catch {
    throw new Error('invalid video url');
  }
}

function clampDurationSeconds(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.min(Math.max(value, 1), MAX_INPUT_DURATION_SECONDS);
}

function ensureString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeLanguage(value: unknown): PromptLanguage {
  return value === 'zh' ? 'zh' : 'en';
}

function extractShots(finalPrompt: string): string[] {
  if (!finalPrompt) {
    return [];
  }

  const normalized = finalPrompt.replace(/\r\n/g, '\n');

  const cnMatches = [...normalized.matchAll(/镜头\s*\d+\s*[：:]\s*([^\n]+)(?=\n|$)/g)];
  if (cnMatches.length > 0) {
    return cnMatches
      .map((match) => ensureString(match[1]))
      .filter(Boolean)
      .slice(0, 8);
  }

  const enMatches = [
    ...normalized.matchAll(/(?:shot|scene)\s*\d*\s*[：:]\s*([^\n]+)(?=\n|$)/gi),
  ];
  if (enMatches.length > 0) {
    return enMatches
      .map((match) => ensureString(match[1]))
      .filter(Boolean)
      .slice(0, 8);
  }

  return normalized
    .split(/[。！？.!?;；]\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function extractNegativePrompt(
  finalPrompt: string,
  language: PromptLanguage
): string {
  if (!finalPrompt) {
    return language === 'zh'
      ? '避免主体变形、画面抖动和无关元素。'
      : 'Avoid subject distortion, flicker, and irrelevant objects.';
  }

  const cn = [...finalPrompt.matchAll(/禁止[^，。；\n]+/g)].map((match) => match[0]);
  if (cn.length > 0) {
    return cn.slice(0, 6).join('，');
  }

  const en = [...finalPrompt.matchAll(/avoid[^,.;\n]+/gi)].map((match) => match[0]);
  if (en.length > 0) {
    return en.slice(0, 6).join(', ');
  }

  return language === 'zh'
    ? '避免主体变形、画面抖动和无关元素。'
    : 'Avoid subject distortion, flicker, and irrelevant objects.';
}

function extractKeywords(primaryCategory: string, finalPrompt: string): string[] {
  const categoryTokens = primaryCategory
    .split(/[+,，、|]/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (categoryTokens.length > 0) {
    return Array.from(new Set(categoryTokens)).slice(0, 12);
  }

  const textTokens = finalPrompt
    .split(/[\s,，。.!?;；:：()\[\]"'“”‘’]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2)
    .slice(0, 12);

  return Array.from(new Set(textTokens));
}

function buildSummary(primaryCategory: string, language: PromptLanguage): string {
  if (primaryCategory) {
    return language === 'zh'
      ? `已完成场景拆解，风格类别：${primaryCategory}。`
      : `Video analysis completed. Primary category: ${primaryCategory}.`;
  }

  return language === 'zh'
    ? '已完成视频场景拆解，可直接用于仿拍执行。'
    : 'Video analysis completed and ready for reenactment workflow.';
}

function buildShortPrompt(finalPrompt: string, language: PromptLanguage): string {
  const lines = finalPrompt
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0] || finalPrompt;
  const maxLength = language === 'zh' ? 100 : 180;

  return firstLine.length > maxLength
    ? `${firstLine.slice(0, maxLength).trim()}...`
    : firstLine;
}

function normalizeAnalyzeResponse(
  payload: unknown,
  language: PromptLanguage
): AnalyzeResult {
  if (!payload || typeof payload !== 'object') {
    throw new Error('invalid analyze response payload');
  }

  const candidate = payload as JsonRecord;
  const root =
    candidate.data && typeof candidate.data === 'object'
      ? (candidate.data as JsonRecord)
      : candidate;

  const status = ensureString(root.status).toLowerCase();
  const finalPrompt = ensureString(root.final_prompt ?? root.finalPrompt ?? root.prompt);
  const primaryCategory = ensureString(
    root.primary_category ?? root.primaryCategory ?? root.category
  );

  if (!finalPrompt) {
    throw new Error('analyze response missing final_prompt');
  }

  if (status && !EXTERNAL_STATUS_OK.has(status)) {
    const msg = ensureString(root.message, 'analyze response not completed');
    throw new Error(`analyze status: ${status}. ${msg}`);
  }

  const shots = extractShots(finalPrompt);
  const negativePrompt = extractNegativePrompt(finalPrompt, language);
  const keywords = extractKeywords(primaryCategory, finalPrompt);

  return {
    status: status || 'completed',
    primaryCategory,
    promptPackage: {
      summary: buildSummary(primaryCategory, language),
      masterPrompt: finalPrompt,
      shortPrompt: buildShortPrompt(finalPrompt, language),
      negativePrompt,
      keywords,
      shots,
    },
  };
}

async function callAnalyzeApi(mediaUrl: string): Promise<JsonRecord> {
  const endpoint =
    envConfigs.video_to_prompt_api_url ||
    'https://video-to-prompt.fly.dev/api/v1/video/analyze';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (envConfigs.video_to_prompt_api_key) {
    headers.Authorization = `Bearer ${envConfigs.video_to_prompt_api_key}`;
    headers['X-API-Key'] = envConfigs.video_to_prompt_api_key;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ video_url: mediaUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `video analyze request failed: ${response.status} ${errorText}`
    );
  }

  const data = (await response.json()) as unknown;
  if (!data || typeof data !== 'object') {
    throw new Error('invalid analyze response');
  }

  return data as JsonRecord;
}

export async function POST(request: Request) {
  try {
    const { media, durationSeconds: inputDurationSeconds, language } =
      await request.json();

    const mediaUrl = normalizeMediaUrl(media);
    const normalizedLanguage = normalizeLanguage(language);
    const durationSeconds = clampDurationSeconds(inputDurationSeconds);

    const analyzePayload = await callAnalyzeApi(mediaUrl);
    const analyzeResult = normalizeAnalyzeResponse(
      analyzePayload,
      normalizedLanguage
    );

    return respData({
      promptPackage: analyzeResult.promptPackage,
      usage: {
        durationSeconds,
      },
    });
  } catch (error: any) {
    console.error('[VideoToPrompt] Error:', error);
    return respErr(error.message || 'video to prompt failed');
  }
}
