'use client';

import {
  Check,
  Copy,
  Link2,
  Loader2,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';

interface VideoRestoreProps {
  srOnlyTitle?: string;
  srOnlyDescription?: string;
  mediaMode?: 'video' | 'image';
  hideTitle?: boolean;
}

interface PromptPackage {
  summary: string;
  masterPrompt: string;
  shortPrompt: string;
  negativePrompt: string;
  keywords: string[];
  shots: string[];
}

type PromptLanguage = 'en' | 'zh';
type DurationStatus = 'idle' | 'detecting' | 'ready' | 'error';

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES =
  'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/mpeg,video/3gpp,video/x-flv';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') || '';

function toApiUrl(path: string): string {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

const UI_TEXT = {
  en: {
    title: 'Video to Prompt',
    subtitle:
      'Upload one reference video, analyze it, and copy a production-ready prompt package for imitation shooting.',


    uploadHintTitle: 'Click to upload a video',
    uploadHintSub: 'or drag and drop',
    uploading: 'Uploading',
    uploadReady: 'Upload complete',
    uploadFailed: 'Upload failed',
    uploadSuccess: 'Video uploaded successfully',
    needVideoFile: 'Please upload a valid video file',

    urlFallbackTitle: 'Or paste a direct video URL',
    urlFallbackPlaceholder: 'https://example.com/video.mp4',
    urlHint: 'If upload is blocked, you can use a public direct file URL.',

    needVideo: 'Please upload a video or provide a video URL',
    detected: 'detected',
    detecting: 'Detecting duration...',
    unavailable: 'Duration unavailable',

    generate: 'Analyze Video',
    generating: 'Analyzing video and generating prompts...',

    analysisDone: 'Analysis complete',
    packageReady: 'Prompt Package Ready for Imitation',

    summary: 'Scene Summary',
    masterPrompt: 'Master Prompt (Core)',
    shortPrompt: 'Short Prompt',
    negativePrompt: 'Negative Prompt',
    keywords: 'Keywords',
    shots: 'Shot List',
    noKeywords: 'No keywords returned.',
    noShots: 'No shot list returned.',

    copy: 'Copy',
    copyAll: 'Copy Full Package',
    copyMaster: 'Copy Master Prompt',
    copyShots: 'Copy Shot List',
    copyShootPlan: 'Copy Imitation Plan',
    newVideo: 'Analyze New Video',

    shootPlan: 'Imitation Shooting Pack',
    shootPlanHint:
      'Use this pack directly for shot recreation: prompt baseline + shot order + keyword constraints.',

    copySuccess: 'Copied',
    copyFailed: 'Copy failed',
    promptGenerated: 'Prompt package generated',
    promptFailed: 'Generate prompt failed',
  },
  zh: {
    title: 'Video to Prompt',
    subtitle:
      '上传一段参考视频，自动分析并拆解为可复制的提示词包，直接用于仿拍执行。',


    uploadHintTitle: '点击上传视频',
    uploadHintSub: '或拖拽到此处',
    uploading: '上传中',
    uploadReady: '上传完成',
    uploadFailed: '上传失败',
    uploadSuccess: '视频上传成功',
    needVideoFile: '请上传有效的视频文件',

    urlFallbackTitle: '或粘贴可访问的视频链接',
    urlFallbackPlaceholder: 'https://example.com/video.mp4',
    urlHint: '如果本地上传受限，可使用公网直链视频。',

    needVideo: '请先上传视频或提供视频链接',
    detected: '已识别',
    detecting: '正在识别时长...',
    unavailable: '时长识别失败',

    generate: '开始分析视频',
    generating: '正在分析视频并生成提示词包...',

    analysisDone: '分析完成',
    packageReady: '可直接仿拍的提示词包已就绪',

    summary: '场景摘要',
    masterPrompt: '主提示词（核心）',
    shortPrompt: '短提示词',
    negativePrompt: '负面提示词',
    keywords: '关键词',
    shots: '镜头清单',
    noKeywords: '未返回关键词。',
    noShots: '未返回镜头清单。',

    copy: '复制',
    copyAll: '复制完整提示词包',
    copyMaster: '复制主提示词',
    copyShots: '复制镜头清单',
    copyShootPlan: '复制仿拍执行包',
    newVideo: '分析新视频',

    shootPlan: '仿拍执行包',
    shootPlanHint: '可直接用于仿拍：主提示词基线 + 镜头顺序 + 关键词约束。',

    copySuccess: '已复制',
    copyFailed: '复制失败',
    promptGenerated: '提示词包生成完成',
    promptFailed: '提示词生成失败',
  },
} as const;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isLikelyVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi|mkv|mpeg|3gp|flv)(\?|#|$)/i.test(url.trim());
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function buildShotListText(shots: string[], language: PromptLanguage): string {
  if (shots.length === 0) {
    return language === 'zh' ? '未返回镜头清单。' : 'No shot list returned.';
  }

  return shots.map((shot, index) => `${index + 1}. ${shot}`).join('\n');
}

function buildCombinedPrompt(pkg: PromptPackage, language: PromptLanguage): string {
  if (language === 'zh') {
    return [
      `【场景摘要】\n${pkg.summary}`,
      `【主提示词】\n${pkg.masterPrompt}`,
      `【短提示词】\n${pkg.shortPrompt}`,
      `【负面提示词】\n${pkg.negativePrompt}`,
      `【关键词】\n${pkg.keywords.join('，')}`,
      `【镜头清单】\n${buildShotListText(pkg.shots, language)}`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `Scene Summary\n${pkg.summary}`,
    `Master Prompt\n${pkg.masterPrompt}`,
    `Short Prompt\n${pkg.shortPrompt}`,
    `Negative Prompt\n${pkg.negativePrompt}`,
    `Keywords\n${pkg.keywords.join(', ')}`,
    `Shot List\n${buildShotListText(pkg.shots, language)}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildShootPlan(pkg: PromptPackage, language: PromptLanguage): string {
  if (language === 'zh') {
    return [
      '【仿拍执行说明】',
      '1. 先使用主提示词生成基线画面。',
      '2. 按镜头清单逐条推进，确保节奏与机位一致。',
      '3. 用关键词锁定风格、光线和材质。',
      '4. 用负面提示词规避跑偏。',
      '',
      '【主提示词】',
      pkg.masterPrompt,
      '',
      '【镜头清单】',
      buildShotListText(pkg.shots, language),
      '',
      '【关键词】',
      pkg.keywords.join('，'),
      '',
      '【负面提示词】',
      pkg.negativePrompt,
    ].join('\n');
  }

  return [
    '[Imitation Shooting Guide]',
    '1. Start from the master prompt as your baseline.',
    '2. Execute shots in order to match pacing and camera movement.',
    '3. Use keywords to lock style, lighting, and texture.',
    '4. Use negative prompt to avoid drift.',
    '',
    '[Master Prompt]',
    pkg.masterPrompt,
    '',
    '[Shot List]',
    buildShotListText(pkg.shots, language),
    '',
    '[Keywords]',
    pkg.keywords.join(', '),
    '',
    '[Negative Prompt]',
    pkg.negativePrompt,
  ].join('\n');
}

async function getVideoDurationSecondsFromUrl(
  url: string
): Promise<number | null> {
  return await new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';

    const cleanup = () => {
      video.removeAttribute('src');
      try {
        video.load();
      } catch {
        // noop
      }
    };

    const handleLoaded = () => {
      const duration = Number(video.duration);
      cleanup();
      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration);
      } else {
        resolve(null);
      }
    };

    const handleError = () => {
      cleanup();
      resolve(null);
    };

    video.addEventListener('loadedmetadata', handleLoaded, { once: true });
    video.addEventListener('error', handleError, { once: true });
    video.src = url;
  });
}

async function copyText(text: string): Promise<void> {
  if (!text) return;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export function VideoRestore({
  srOnlyTitle,
  srOnlyDescription,
  hideTitle,
}: VideoRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const locale = useLocale();

  const language: PromptLanguage = locale.toLowerCase().startsWith('zh')
    ? 'zh'
    : 'en';
  const text = UI_TEXT[language];

  const [isMounted, setIsMounted] = useState(false);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [uploadedDurationSeconds, setUploadedDurationSeconds] = useState<
    number | null
  >(null);
  const [urlDurationSeconds, setUrlDurationSeconds] = useState<number | null>(
    null
  );
  const [urlDurationStatus, setUrlDurationStatus] =
    useState<DurationStatus>('idle');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<PromptPackage | null>(null);
  const [copiedField, setCopiedField] = useState('');
  const [isDraggingUpload, setIsDraggingUpload] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const targetUrl = mediaUrl.trim();

    if (!targetUrl || !isLikelyVideoUrl(targetUrl)) {
      setUrlDurationSeconds(null);
      setUrlDurationStatus('idle');
      return;
    }

    let canceled = false;
    setUrlDurationStatus('detecting');
    setUrlDurationSeconds(null);

    const timer = setTimeout(async () => {
      const duration = await getVideoDurationSecondsFromUrl(targetUrl);
      if (canceled) {
        return;
      }

      if (duration) {
        setUrlDurationSeconds(duration);
        setUrlDurationStatus('ready');
      } else {
        setUrlDurationStatus('error');
        setUrlDurationSeconds(null);
      }
    }, 350);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [mediaUrl]);

  const finalVideoUrl = uploadedUrl || mediaUrl.trim();
  const hasValidInput = finalVideoUrl.length > 0;
  const selectedDurationSeconds = uploadedUrl
    ? uploadedDurationSeconds
    : urlDurationSeconds;
  const shootPlanText = useMemo(() => {
    if (!result) {
      return '';
    }
    return buildShootPlan(result, language);
  }, [result, language]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast.error(text.needVideoFile);
      return;
    }

    setUploadedFile(file);
    setUploadedUrl('');
    setUploadedDurationSeconds(null);
    setResult(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const presignResp = await fetch(toApiUrl('/api/storage/presign'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignResp.ok) {
        throw new Error(`Presign failed: ${presignResp.status}`);
      }

      const presignResult = (await presignResp.json()) as {
        code: number;
        message: string;
        data?: {
          uploadUrl: string;
          formFields: Record<string, string>;
          publicUrl: string;
        };
      };

      if (presignResult.code !== 0 || !presignResult.data) {
        throw new Error(presignResult.message || 'Presign failed');
      }

      const { uploadUrl, formFields, publicUrl } = presignResult.data;
      const formData = new FormData();

      Object.entries(formFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.ontimeout = () => reject(new Error('Upload timeout'));
        xhr.send(formData);
      });

      setUploadedUrl(publicUrl);
      setUploadProgress(100);

      const duration = await getVideoDurationSecondsFromUrl(publicUrl);
      setUploadedDurationSeconds(duration);

      toast.success(text.uploadSuccess);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(getErrorMessage(error, text.uploadFailed));
      setUploadedFile(null);
      setUploadedUrl('');
      setUploadedDurationSeconds(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setUploadedUrl('');
    setUploadedDurationSeconds(null);
    setUploadProgress(0);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeVideo = async () => {
    if (!hasValidInput) {
      toast.error(text.needVideo);
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch(toApiUrl('/api/ai/video-to-prompt'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media: finalVideoUrl,
          durationSeconds: selectedDurationSeconds,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const payload = (await response.json()) as {
        code: number;
        message: string;
        data?: {
          promptPackage?: PromptPackage;
        };
      };

      if (payload.code !== 0 || !payload.data?.promptPackage) {
        throw new Error(payload.message || text.promptFailed);
      }

      setResult(payload.data.promptPackage);
      toast.success(text.promptGenerated);
    } catch (error) {
      console.error('Generate prompt failed:', error);
      toast.error(getErrorMessage(error, text.promptFailed));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (key: string, content: string) => {
    if (!content) {
      return;
    }

    try {
      await copyText(content);
      setCopiedField(key);
      toast.success(text.copySuccess);
      window.setTimeout(() => {
        setCopiedField('');
      }, 1500);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error(text.copyFailed);
    }
  };

  const handleCopyAll = () => {
    if (!result) {
      return;
    }
    void handleCopy('all', buildCombinedPrompt(result, language));
  };

  const handleDropZoneDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingUpload(true);
  };

  const handleDropZoneDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingUpload(false);
  };

  const handleDropZoneDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingUpload(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    const syntheticEvent = {
      target: {
        files: [file],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    void handleFileSelect(syntheticEvent);
  };

  const resetAll = () => {
    setResult(null);
    setMediaUrl('');
    clearFile();
  };

  return (
    <div className="container w-full">
      {!hideTitle && (
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {srOnlyTitle || text.title}
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            {srOnlyDescription || text.subtitle}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur md:p-6">
          {result ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-primary">{text.analysisDone}</p>
                  <h3 className="text-xl font-semibold text-white md:text-2xl">
                    {text.packageReady}
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">{result.summary}</p>
                </div>

                <Button
                  variant="outline"
                  onClick={resetAll}
                  className="border-white/20 hover:bg-white/5"
                >
                  {text.newVideo}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy('master', result.masterPrompt)}
                  className="border-white/20 text-xs text-gray-100 hover:bg-white/5"
                >
                  {copiedField === 'master' ? (
                    <Check className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <Copy className="mr-1 h-3.5 w-3.5" />
                  )}
                  {text.copyMaster}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleCopy('shots', buildShotListText(result.shots, language))
                  }
                  className="border-white/20 text-xs text-gray-100 hover:bg-white/5"
                >
                  {copiedField === 'shots' ? (
                    <Check className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <Copy className="mr-1 h-3.5 w-3.5" />
                  )}
                  {text.copyShots}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy('shoot-plan', shootPlanText)}
                  className="border-white/20 text-xs text-gray-100 hover:bg-white/5"
                >
                  {copiedField === 'shoot-plan' ? (
                    <Check className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <Copy className="mr-1 h-3.5 w-3.5" />
                  )}
                  {text.copyShootPlan}
                </Button>

                <Button
                  size="sm"
                  variant="default"
                  onClick={handleCopyAll}
                  className="bg-primary text-xs text-primary-foreground hover:bg-primary/90"
                >
                  {copiedField === 'all' ? (
                    <Check className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <Copy className="mr-1 h-3.5 w-3.5" />
                  )}
                  {text.copyAll}
                </Button>
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{text.masterPrompt}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-gray-300 hover:bg-white/5"
                    onClick={() => handleCopy('master-inline', result.masterPrompt)}
                  >
                    {copiedField === 'master-inline' ? (
                      <Check className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <Copy className="mr-1 h-3.5 w-3.5" />
                    )}
                    {text.copy}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={result.masterPrompt}
                  className="min-h-[170px] border-white/10 bg-black/20 text-gray-100"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{text.shortPrompt}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-gray-300 hover:bg-white/5"
                      onClick={() => handleCopy('short', result.shortPrompt)}
                    >
                      {copiedField === 'short' ? (
                        <Check className="mr-1 h-3.5 w-3.5" />
                      ) : (
                        <Copy className="mr-1 h-3.5 w-3.5" />
                      )}
                      {text.copy}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={result.shortPrompt}
                    className="min-h-[120px] border-white/10 bg-black/20 text-gray-100"
                  />
                </div>

                <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{text.negativePrompt}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-gray-300 hover:bg-white/5"
                      onClick={() => handleCopy('negative', result.negativePrompt)}
                    >
                      {copiedField === 'negative' ? (
                        <Check className="mr-1 h-3.5 w-3.5" />
                      ) : (
                        <Copy className="mr-1 h-3.5 w-3.5" />
                      )}
                      {text.copy}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={result.negativePrompt}
                    className="min-h-[120px] border-white/10 bg-black/20 text-gray-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-4">
                  <p className="text-sm font-medium text-white">{text.shots}</p>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {result.shots.length > 0 ? (
                      result.shots.map((shot, index) => (
                        <li
                          key={`${shot}-${index}`}
                          className="rounded-lg border border-white/10 bg-black/25 px-3 py-2"
                        >
                          <span className="mr-2 text-primary">{index + 1}.</span>
                          {shot}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">{text.noShots}</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3 rounded-xl border border-white/10 bg-black/25 p-4">
                  <p className="text-sm font-medium text-white">{text.keywords}</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.length > 0 ? (
                      result.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-gray-200"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">{text.noKeywords}</span>
                    )}
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/10 p-3">
                    <p className="text-xs font-medium text-primary">{text.shootPlan}</p>
                    <p className="mt-1 text-xs text-gray-300">{text.shootPlanHint}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white">{text.shootPlan}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-gray-300 hover:bg-white/5"
                    onClick={() => handleCopy('shoot-plan-inline', shootPlanText)}
                  >
                    {copiedField === 'shoot-plan-inline' ? (
                      <Check className="mr-1 h-3.5 w-3.5" />
                    ) : (
                      <Copy className="mr-1 h-3.5 w-3.5" />
                    )}
                    {text.copy}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={shootPlanText}
                  className="min-h-[200px] border-white/10 bg-black/20 text-gray-100"
                />
              </div>

            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_VIDEO_TYPES}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!uploadedFile ? (
                  <div
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-black/30 py-12 transition-colors',
                      isDraggingUpload
                        ? 'border-primary/70 bg-primary/10'
                        : 'border-white/10 hover:border-primary/50'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDropZoneDragOver}
                    onDragLeave={handleDropZoneDragLeave}
                    onDrop={handleDropZoneDrop}
                  >
                    <div className="mb-3 rounded-full bg-white/5 p-3">
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-white">{text.uploadHintTitle}</p>
                    <p className="mt-1 text-xs text-gray-500">{text.uploadHintSub}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadedFile.size)}
                          {uploadedUrl ? (
                            <span className="ml-2 text-emerald-400">✓ {text.uploadReady}</span>
                          ) : null}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        disabled={isUploading}
                        className="hover:bg-white/5"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {isUploading && (
                      <div className="mt-3">
                        <div className="h-1 overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-center text-xs text-gray-500">
                          {text.uploading} {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <p className="mt-2 text-xs text-gray-500">
                  {text.urlHint} · {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Link2 className="h-3.5 w-3.5" />
                  {text.urlFallbackTitle}
                </div>
                <Input
                  value={mediaUrl}
                  onChange={(event) => {
                    setMediaUrl(event.target.value);
                    setResult(null);
                  }}
                  placeholder={text.urlFallbackPlaceholder}
                  className="h-11 border-white/10 bg-black/30 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-gray-400">
                {selectedDurationSeconds
                  ? `${selectedDurationSeconds.toFixed(2)}s ${text.detected}`
                  : mediaUrl.trim() && urlDurationStatus === 'detecting'
                    ? text.detecting
                    : mediaUrl.trim() && urlDurationStatus === 'error'
                      ? text.unavailable
                      : language === 'zh'
                        ? '准备就绪，可直接开始分析'
                        : 'Ready. Upload or paste a video URL to start analysis.'}
              </div>

              <Button
                onClick={analyzeVideo}
                disabled={!isMounted || !hasValidInput || isUploading || isGenerating}
                className="w-full bg-gradient-to-r from-primary to-accent font-medium text-primary-foreground shadow-lg shadow-primary/35 hover:from-primary/90 hover:to-accent/90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {text.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {text.generate}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
