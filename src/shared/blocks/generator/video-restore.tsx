'use client';

import { useLocale } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useAppContext } from '@/shared/contexts/app';
import {
  getActiveTemplateContext,
  trackTemplateEvent,
} from '@/shared/lib/template-analytics';

import {
  buildShotListText,
  PromptLanguage,
  PromptPackage,
  VideoRestoreResultView,
  VideoRestoreUploadView,
} from './video-restore-view';

interface VideoRestoreProps {
  srOnlyTitle?: string;
  srOnlyDescription?: string;
  mediaMode?: 'video' | 'image';
  hideTitle?: boolean;
}

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
    signInRequired: 'Please sign in to analyze the video',
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
    signInRequired: '请先登录再开始分析视频',
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

  const { user, isCheckSign, setIsShowSignModal } = useAppContext();

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
  const uploadedFileView = uploadedFile
    ? {
        name: uploadedFile.name,
        sizeText: formatFileSize(uploadedFile.size),
        isReady: Boolean(uploadedUrl),
      }
    : null;
  const statusText = selectedDurationSeconds
    ? `${selectedDurationSeconds.toFixed(2)}s ${text.detected}`
    : mediaUrl.trim() && urlDurationStatus === 'detecting'
      ? text.detecting
      : mediaUrl.trim() && urlDurationStatus === 'error'
        ? text.unavailable
        : language === 'zh'
          ? '准备就绪，可直接开始分析'
          : 'Ready. Upload or paste a video URL to start analysis.';

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
    if (isCheckSign) {
      return;
    }

    if (!user) {
      setIsShowSignModal(true);
      toast.error(text.signInRequired);
      return;
    }

    if (!hasValidInput) {
      toast.error(text.needVideo);
      return;
    }

    const templateContext = getActiveTemplateContext('hero_tool');

    void trackTemplateEvent({
      eventName: 'template_analyze_start',
      templateId: templateContext.templateId,
      templateName: templateContext.templateName,
      styleTag: templateContext.styleTag,
      source: templateContext.source || 'hero_tool',
      locale,
      metadata: {
        inputType: uploadedUrl ? 'upload' : 'url',
        hasDuration: typeof selectedDurationSeconds === 'number',
        durationSeconds: selectedDurationSeconds ?? null,
      },
    });

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

      void trackTemplateEvent({
        eventName: 'template_analyze_success',
        templateId: templateContext.templateId,
        templateName: templateContext.templateName,
        styleTag: templateContext.styleTag,
        source: templateContext.source || 'hero_tool',
        locale,
        metadata: {
          inputType: uploadedUrl ? 'upload' : 'url',
          keywordCount: payload.data.promptPackage.keywords.length,
          shotCount: payload.data.promptPackage.shots.length,
          hasNegativePrompt: !!payload.data.promptPackage.negativePrompt,
        },
      });

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

      const templateContext = getActiveTemplateContext('hero_tool');
      void trackTemplateEvent({
        eventName: 'template_copy',
        templateId: templateContext.templateId,
        templateName: templateContext.templateName,
        styleTag: templateContext.styleTag,
        source: templateContext.source || 'hero_tool',
        locale,
        metadata: {
          copyKey: key,
          charCount: content.length,
        },
      });

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
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_VIDEO_TYPES}
            onChange={handleFileSelect}
            className="hidden"
          />
          {result ? (
            <VideoRestoreResultView
              result={result}
              text={text}
              copiedField={copiedField}
              language={language}
              shootPlanText={shootPlanText}
              onReset={resetAll}
              onCopy={(key, content) => {
                void handleCopy(key, content);
              }}
              onCopyAll={handleCopyAll}
            />
          ) : (
            <VideoRestoreUploadView
              text={text}
              uploadedFile={uploadedFileView}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
              isDraggingUpload={isDraggingUpload}
              mediaUrl={mediaUrl}
              statusText={statusText}
              maxFileSizeText={formatFileSize(MAX_FILE_SIZE)}
              isGenerateDisabled={
                !isMounted ||
                isCheckSign ||
                !hasValidInput ||
                isUploading ||
                isGenerating
              }
              isGenerating={isGenerating}
              onDropZoneClick={() => fileInputRef.current?.click()}
              onDropZoneDragOver={handleDropZoneDragOver}
              onDropZoneDragLeave={handleDropZoneDragLeave}
              onDropZoneDrop={handleDropZoneDrop}
              onClearFile={clearFile}
              onMediaUrlChange={(value) => {
                setMediaUrl(value);
                setResult(null);
              }}
              onGenerate={analyzeVideo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
