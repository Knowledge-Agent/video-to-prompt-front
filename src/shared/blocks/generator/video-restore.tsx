/**
 * SeedVR2 Media Restoration Component
 * 支持视频和图片的 AI 修复增强
 * pos: src/shared/blocks/generator/video-restore.tsx
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Image as ImageIcon,
  Link2,
  Loader2,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';

interface VideoRestoreProps {
  srOnlyTitle?: string;
  srOnlyDescription?: string;
  mediaMode?: 'video' | 'image';
  hideTitle?: boolean;
}

const IMAGE_CREDITS = 1;
const VIDEO_FALLBACK_CREDITS = 10;
const MAX_FILE_SIZE = 500 * 1024 * 1024;

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'webp', label: 'WebP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
];

const DEFAULT_VIDEO_FPS = 24;
const DEFAULT_OUTPUT_QUALITY = 90;
const DEFAULT_APPLY_COLOR_FIX = true;

// 支持的视频和图片类型
const ACCEPTED_VIDEO_TYPES =
  'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska';
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';
const ACCEPTED_FILE_TYPES = `${ACCEPTED_VIDEO_TYPES},${ACCEPTED_IMAGE_TYPES}`;

type InputMode = 'upload' | 'url';
type PreviewMode = 'original' | 'enhanced' | 'side-by-side';
type MediaType = 'video' | 'image' | null;

function extractOutputUrl(data: any): string | null {
  if (data?.output) {
    if (typeof data.output === 'string') return data.output;
    if (Array.isArray(data.output) && data.output[0]) return data.output[0];
  }
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function calcVideoCreditsByDurationSeconds(durationSeconds: number): number {
  return Math.max(1, Math.ceil(durationSeconds * 2));
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

    const onLoadedMetadata = () => {
      const duration = Number(video.duration);
      cleanup();
      if (Number.isFinite(duration) && duration > 0) {
        resolve(duration);
      } else {
        resolve(null);
      }
    };

    const onError = () => {
      cleanup();
      resolve(null);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
    video.addEventListener('error', onError, { once: true });
    video.src = url;
  });
}

function guessExtensionFromContentType(
  contentType: string | null
): string | null {
  if (!contentType) return null;
  const ct = contentType.toLowerCase();
  if (ct.includes('video/mp4')) return 'mp4';
  if (ct.includes('video/webm')) return 'webm';
  if (ct.includes('image/webp')) return 'webp';
  if (ct.includes('image/png')) return 'png';
  if (ct.includes('image/jpeg')) return 'jpg';
  if (ct.includes('image/jpg')) return 'jpg';
  return null;
}

function guessExtensionFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const pathname = u.pathname.toLowerCase();
    const match = pathname.match(/\.([a-z0-9]+)$/i);
    if (!match) return null;
    const ext = match[1];
    if (['mp4', 'webm', 'webp', 'png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
      return ext === 'jpeg' ? 'jpg' : ext;
    }
    return null;
  } catch {
    return null;
  }
}

function getMediaType(file: File | null, url: string): MediaType {
  if (file) {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
  }
  if (url) {
    const lowerUrl = url.toLowerCase();
    if (/\.(mp4|webm|mov|avi|mkv)(\?|$)/.test(lowerUrl)) return 'video';
    if (/\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(lowerUrl)) return 'image';
  }
  return null;
}

export function VideoRestore({
  srOnlyTitle,
  srOnlyDescription,
  mediaMode,
  hideTitle,
}: VideoRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadedDurationSeconds, setUploadedDurationSeconds] = useState<
    number | null
  >(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState<MediaType>(null);

  const [urlDurationSeconds, setUrlDurationSeconds] = useState<number | null>(
    null
  );
  const [urlDurationStatus, setUrlDurationStatus] = useState<
    'idle' | 'detecting' | 'ready' | 'error'
  >('idle');

  const [outputFormat, setOutputFormat] = useState(() => 'webp');

  const [restoredUrl, setRestoredUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [originalMediaType, setOriginalMediaType] = useState<MediaType>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('enhanced');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<number | null>(
    null
  );

  const { user, setIsShowSignModal, fetchUserCredits } = useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const finalMediaUrl = inputMode === 'upload' ? uploadedUrl : mediaUrl;
  const hasValidInput = finalMediaUrl.trim().length > 0;
  const isComplete = restoredUrl.length > 0;
  const currentMediaType = getMediaType(
    uploadedFile,
    inputMode === 'url' ? mediaUrl : ''
  );

  const detectedMediaType = currentMediaType || mediaType;

  const selectedDurationSeconds =
    detectedMediaType === 'video'
      ? inputMode === 'upload'
        ? uploadedDurationSeconds
        : urlDurationSeconds
      : null;

  const estimatedCredits =
    detectedMediaType === 'video' && selectedDurationSeconds
      ? calcVideoCreditsByDurationSeconds(selectedDurationSeconds)
      : detectedMediaType === 'image'
        ? IMAGE_CREDITS
        : VIDEO_FALLBACK_CREDITS;

  useEffect(() => {
    const allowed =
      outputFormat === 'webp' ||
      outputFormat === 'png' ||
      outputFormat === 'jpg';
    if (!allowed) {
      setOutputFormat('webp');
    }
  }, [detectedMediaType, outputFormat]);

  useEffect(() => {
    if (inputMode !== 'url') {
      setUrlDurationSeconds(null);
      setUrlDurationStatus('idle');
      return;
    }

    const url = mediaUrl.trim();
    const isVideoUrl = /\.(mp4|webm|mov|avi|mkv)(\?|#|$)/i.test(url);
    if (!url || !isVideoUrl) {
      setUrlDurationSeconds(null);
      setUrlDurationStatus('idle');
      return;
    }

    let cancelled = false;
    setUrlDurationStatus('detecting');
    setUrlDurationSeconds(null);

    const timer = setTimeout(async () => {
      const duration = await getVideoDurationSecondsFromUrl(url);
      if (cancelled) return;

      if (duration) {
        setUrlDurationSeconds(duration);
        setUrlDurationStatus('ready');
      } else {
        setUrlDurationSeconds(null);
        setUrlDurationStatus('error');
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inputMode, mediaUrl]);

  const handleAspectRatioFromVideo = (
    e: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      setPreviewAspectRatio(video.videoWidth / video.videoHeight);
    }
  };

  const handleAspectRatioFromImage = (
    e: React.SyntheticEvent<HTMLImageElement>
  ) => {
    const img = e.currentTarget;
    if (img.naturalWidth && img.naturalHeight) {
      setPreviewAspectRatio(img.naturalWidth / img.naturalHeight);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large. Max ${formatFileSize(MAX_FILE_SIZE)}`);
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast.error('Please select a video or image file');
      return;
    }

    setUploadedFile(file);
    setUploadedUrl('');
    setUploadedDurationSeconds(null);
    setMediaType(isVideo ? 'video' : 'image');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Get presigned upload credentials from backend
      const presignResp = await fetch('/api/storage/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });
      if (!presignResp.ok)
        throw new Error(`Presign failed: ${presignResp.status}`);
      const presignResult = await presignResp.json();
      if (presignResult.code !== 0)
        throw new Error(presignResult.message || 'Presign failed');

      const { uploadUrl, formFields, publicUrl } = presignResult.data;
      console.log(
        '[MediaRestore] Got presign credentials, uploading directly to OSS...'
      );

      // Step 2: Upload directly to OSS (bypasses Vercel 4.5MB limit)
      const formData = new FormData();
      // Add all form fields first (order matters for OSS)
      Object.entries(formFields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      // Add file last
      formData.append('file', file);

      // Use XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl, true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(
              new Error(`OSS upload failed: ${xhr.status} ${xhr.statusText}`)
            );
          }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.ontimeout = () => reject(new Error('Upload timeout'));

        xhr.send(formData);
      });

      console.log('[MediaRestore] Direct OSS upload success:', publicUrl);
      setUploadedUrl(publicUrl);

      if (isVideo) {
        const duration = await getVideoDurationSecondsFromUrl(publicUrl);
        setUploadedDurationSeconds(duration);
      }

      setUploadProgress(100);
      toast.success('File uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      setUploadedFile(null);
      setMediaType(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setUploadedUrl('');
    setUploadedDurationSeconds(null);
    setUploadProgress(0);
    setRestoredUrl('');
    setOriginalUrl('');
    setMediaType(null);
    setOriginalMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartRestore = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }
    if (remainingCredits < estimatedCredits) {
      toast.error(
        `Insufficient credits. Need ${estimatedCredits}, have ${remainingCredits}.`
      );
      return;
    }
    if (!hasValidInput) {
      toast.error('Please upload a file or enter a URL.');
      return;
    }

    const detectedType = currentMediaType || mediaType;

    setIsGenerating(true);
    setRestoredUrl('');
    setOriginalUrl(finalMediaUrl.trim());
    setOriginalMediaType(detectedType);
    setProcessingStatus('starting');

    try {
      const progressInterval = setInterval(() => {
        setProcessingStatus((prev) =>
          prev === 'starting' ? 'processing' : prev
        );
      }, 3000);

      const resp = await fetch('/api/ai/seedvr2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media: finalMediaUrl.trim(),
          mediaType: detectedType,
          durationSeconds:
            detectedType === 'video'
              ? inputMode === 'upload'
                ? uploadedDurationSeconds
                : urlDurationSeconds
              : null,
          fps: detectedType === 'video' ? DEFAULT_VIDEO_FPS : undefined,
          output_format: outputFormat,
          output_quality: DEFAULT_OUTPUT_QUALITY,
          apply_color_fix: DEFAULT_APPLY_COLOR_FIX,
        }),
      });

      clearInterval(progressInterval);

      if (!resp.ok) throw new Error(`Request failed: ${resp.status}`);
      const { code, message, data } = await resp.json();
      if (code !== 0) throw new Error(message || 'Failed');

      const outputUrl = extractOutputUrl(data);
      if (outputUrl) {
        setRestoredUrl(outputUrl);
        setPreviewMode('enhanced');
        setProcessingStatus('succeeded');
        toast.success(
          detectedType === 'image' ? 'Image enhanced!' : 'Video restored!'
        );
      } else {
        throw new Error('No output returned');
      }

      await fetchUserCredits();
    } catch (error: any) {
      console.error('Restore error:', error);
      toast.error(`Failed: ${error.message}`);
      setProcessingStatus('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!restoredUrl) return;
    try {
      setIsDownloading(true);
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(restoredUrl)}`
      );
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(
          `Download failed (${resp.status})${text ? `: ${text}` : ''}`
        );
      }
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const contentType = resp.headers.get('content-type') || blob.type || null;
      const ext =
        guessExtensionFromContentType(contentType) ||
        guessExtensionFromUrl(restoredUrl) ||
        outputFormat;
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `seedvr2-enhanced.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Downloaded!');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error?.message || 'Download failed');
      try {
        window.open(restoredUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // noop
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNewRestore = () => {
    setRestoredUrl('');
    setOriginalUrl('');
    setUploadedFile(null);
    setUploadedUrl('');
    setMediaUrl('');
    setMediaType(null);
    setOriginalMediaType(null);
    setPreviewAspectRatio(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 完成状态 UI
  if (isComplete) {
    const isImageResult = originalMediaType === 'image';

    return (
      <div className="container w-full">
        <div className="mx-auto max-w-4xl">
          {/* Layer 2: 白色内容框 */}
          <div className="rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur">
            {/* Header */}
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-white">
                Enhancement Complete!
              </h2>
            </div>
            <p className="mb-4 text-sm text-gray-400">
              {isImageResult
                ? 'Your image has been enhanced to high quality'
                : 'Your video has been restored and upscaled to 4K quality'}
            </p>

            {/* Preview Mode Tabs */}
            <Tabs
              value={previewMode}
              onValueChange={(v) => setPreviewMode(v as PreviewMode)}
              className="mb-4"
            >
              <TabsList className="border border-white/10 bg-black/30">
                <TabsTrigger
                  value="original"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-black"
                >
                  Original
                </TabsTrigger>
                <TabsTrigger
                  value="enhanced"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-black"
                >
                  Enhanced
                </TabsTrigger>
                <TabsTrigger
                  value="side-by-side"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-black"
                >
                  Side-by-Side
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Media Preview */}
            <div
              className="mb-6 flex w-full items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/30"
              style={{
                height: previewAspectRatio
                  ? undefined
                  : 'clamp(320px, 60vh, 560px)',
                maxHeight: 'clamp(320px, 60vh, 560px)',
                aspectRatio: previewAspectRatio ?? undefined,
              }}
            >
              {previewMode === 'side-by-side' ? (
                <div className="grid h-full grid-cols-2 gap-1">
                  <div className="relative h-full">
                    {isImageResult ? (
                      <img
                        src={originalUrl}
                        alt="Original"
                        onLoad={handleAspectRatioFromImage}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <video
                        src={originalUrl}
                        controls
                        onLoadedMetadata={handleAspectRatioFromVideo}
                        className="h-full w-full object-contain"
                      />
                    )}
                    <span className="absolute top-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      Original
                    </span>
                  </div>
                  <div className="relative h-full">
                    {isImageResult ? (
                      <img
                        src={restoredUrl}
                        alt="Enhanced"
                        onLoad={handleAspectRatioFromImage}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <video
                        src={restoredUrl}
                        controls
                        onLoadedMetadata={handleAspectRatioFromVideo}
                        className="h-full w-full object-contain"
                      />
                    )}
                    <span className="absolute top-2 left-2 rounded bg-orange-500 px-2 py-1 text-xs font-medium text-black">
                      {isImageResult ? 'Enhanced' : 'Enhanced 4K'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative flex h-full w-full items-center justify-center">
                  {isImageResult ? (
                    <img
                      src={
                        previewMode === 'original' ? originalUrl : restoredUrl
                      }
                      alt={previewMode === 'original' ? 'Original' : 'Enhanced'}
                      onLoad={handleAspectRatioFromImage}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <video
                      src={
                        previewMode === 'original' ? originalUrl : restoredUrl
                      }
                      controls
                      onLoadedMetadata={handleAspectRatioFromVideo}
                      className="h-full w-full object-contain"
                    />
                  )}
                  <span
                    className={`absolute top-2 left-2 rounded px-2 py-1 text-xs ${previewMode === 'original' ? 'bg-black/70 text-white' : 'bg-orange-500 font-medium text-black'}`}
                  >
                    {previewMode === 'original'
                      ? 'Original'
                      : isImageResult
                        ? 'Enhanced'
                        : 'Enhanced 4K'}
                  </span>
                </div>
              )}
            </div>

            {/* Actions - Layer 3: 橙色行动点 */}
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 font-medium text-black shadow-lg shadow-orange-500/50 hover:from-orange-600 hover:to-red-700 hover:shadow-orange-500/60"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download Enhanced {isImageResult ? 'Image' : 'Video'}
              </Button>
              <Button
                variant="outline"
                onClick={handleNewRestore}
                className="border-white/20 hover:border-white/30 hover:bg-white/5"
              >
                <Upload className="mr-2 h-4 w-4" />
                New {isImageResult ? 'Image' : 'Video'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 上传/处理状态 UI
  return (
    <div className="container w-full">
      {/* 标题 - 纯白色 - 仅在 hideTitle 为 false 时显示 */}
      {!hideTitle && (
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {srOnlyTitle || 'Transform Any Video to 4K with SeedVR2'}
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            {srOnlyDescription ||
              'Professional AI restoration that removes noise, fixes artifacts, and recovers details. No editing experience needed.'}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        {/* Layer 2: 白色内容框 */}
        <div className="rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur">
          {/* Input Mode Tabs - 橙色激活状态 */}
          <Tabs
            value={inputMode}
            onValueChange={(v) => setInputMode(v as InputMode)}
            className="mb-6"
          >
            <TabsList className="border border-white/10 bg-black/30">
              <TabsTrigger
                value="upload"
                className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-black"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger
                value="url"
                className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-black"
              >
                <Link2 className="h-4 w-4" />
                From URL
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isGenerating ? (
            /* Processing View */
            <div className="py-16 text-center">
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-orange-500" />
              <p className="text-lg font-medium text-white">
                {processingStatus === 'starting'
                  ? 'Starting...'
                  : processingStatus === 'processing'
                    ? 'Processing...'
                    : 'Enhancing...'}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                {processingStatus === 'starting'
                  ? 'Initializing AI model'
                  : processingStatus === 'processing'
                    ? 'AI is enhancing your media'
                    : 'This may take a few minutes'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${processingStatus === 'starting' ? 'bg-orange-500' : 'bg-white/10'}`}
                />
                <div
                  className={`h-2 w-2 rounded-full ${processingStatus === 'processing' ? 'animate-pulse bg-orange-500' : 'bg-white/10'}`}
                />
                <div className="h-2 w-2 rounded-full bg-white/10" />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {processingStatus === 'starting'
                  ? 'Step 1/3: Starting'
                  : processingStatus === 'processing'
                    ? 'Step 2/3: Processing'
                    : 'Preparing...'}
              </p>
            </div>
          ) : (
            <>
              {/* Upload Area */}
              <div className="mb-4">
                {inputMode === 'upload' ? (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_FILE_TYPES}
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {!uploadedFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-black/30 py-12 transition-colors hover:border-orange-500/50"
                      >
                        <div className="mb-3 rounded-full bg-white/5 p-3">
                          {mediaMode === 'image' ? (
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          ) : mediaMode === 'video' ? (
                            <Video className="h-8 w-8 text-gray-400" />
                          ) : (
                            <div className="flex gap-1">
                              <Video className="h-5 w-5 text-gray-400" />
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-white">
                          {mediaMode === 'image'
                            ? 'Click to upload an image'
                            : mediaMode === 'video'
                              ? 'Click to upload a video'
                              : 'Click to upload a video or image'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          or drag and drop
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {mediaType === 'image' ? (
                              <ImageIcon className="h-8 w-8 text-orange-500" />
                            ) : (
                              <Video className="h-8 w-8 text-orange-500" />
                            )}
                            <div>
                              <p className="max-w-[300px] truncate text-sm font-medium text-white">
                                {uploadedFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(uploadedFile.size)}
                                {uploadedUrl && (
                                  <span className="ml-2 text-green-500">
                                    ✓ Ready
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFile}
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
                                className="h-full bg-orange-500 transition-all"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="mt-1 text-center text-xs text-gray-500">
                              Uploading...
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Videos: MP4/WebM/AVI/MOV/MKV • Images: JPG/PNG/WebP • Max{' '}
                      {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </>
                ) : (
                  <>
                    <Textarea
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4 or image.jpg"
                      className="min-h-[100px] resize-none border-white/10 bg-black/30 text-white placeholder:text-gray-500 focus:border-orange-500/50"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Enter a direct link to a video or image file.
                    </p>
                  </>
                )}
              </div>

              <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded bg-orange-500/15 px-2 py-1 text-xs font-medium text-orange-200">
                    {estimatedCredits} credits
                  </span>
                  <span className="truncate text-xs text-gray-400">
                    {detectedMediaType === 'video'
                      ? selectedDurationSeconds
                        ? `${selectedDurationSeconds.toFixed(2)}s`
                        : inputMode === 'url'
                          ? urlDurationStatus === 'detecting'
                            ? 'Detecting duration...'
                            : urlDurationStatus === 'error'
                              ? 'Duration unavailable'
                              : '—'
                          : 'Detecting duration...'
                      : 'Fixed cost'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Format</span>
                    <Select
                      value={outputFormat}
                      onValueChange={setOutputFormat}
                    >
                      <SelectTrigger className="h-8 w-[92px] border-white/10 bg-black/30 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OUTPUT_FORMAT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <span className="shrink-0 text-xs text-gray-500">
                    Remaining:{' '}
                    <span className="text-gray-300">{remainingCredits}</span>
                  </span>
                </div>
              </div>

              {/* Start Button - Layer 3: 橙色行动点 */}
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 font-medium text-black shadow-lg shadow-orange-500/50 hover:from-orange-600 hover:to-red-700 hover:shadow-orange-500/60"
                size="lg"
                disabled={!isMounted || !hasValidInput || isUploading}
                onClick={handleStartRestore}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Start AI Restoration
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
