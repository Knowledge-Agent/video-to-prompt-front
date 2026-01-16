/**
 * SeedVR2 Media Restoration Component
 * 支持视频和图片的 AI 修复增强
 * pos: src/shared/blocks/generator/video-restore.tsx
 */
'use client';

import {
    ChevronDown,
    Download,
    Image as ImageIcon,
    Link2,
    Loader2,
    Settings2,
    Sparkles,
    Upload,
    Video,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';

interface VideoRestoreProps {
  srOnlyTitle?: string;
  srOnlyDescription?: string;
  mediaMode?: 'video' | 'image';
  hideTitle?: boolean;
}

const RESTORE_CREDITS = 10;
const MAX_FILE_SIZE = 500 * 1024 * 1024;

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'webp', label: 'WebP' },
  { value: 'png', label: 'PNG' },
  { value: 'jpg', label: 'JPG' },
];

const FPS_OPTIONS = [
  { value: '24', label: '24' },
  { value: '30', label: '30' },
  { value: '60', label: '60' },
];

// 支持的视频和图片类型
const ACCEPTED_VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska';
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

export function VideoRestore({ srOnlyTitle, srOnlyDescription, mediaMode, hideTitle }: VideoRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaType, setMediaType] = useState<MediaType>(null);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fps, setFps] = useState('24');
  const [outputFormat, setOutputFormat] = useState('webp');
  const [outputQuality, setOutputQuality] = useState(90);
  const [applyColorFix, setApplyColorFix] = useState(true);

  const [restoredUrl, setRestoredUrl] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [originalMediaType, setOriginalMediaType] = useState<MediaType>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('enhanced');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { user, setIsShowSignModal, fetchUserCredits } = useAppContext();

  useEffect(() => { setIsMounted(true); }, []);

  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const finalMediaUrl = inputMode === 'upload' ? uploadedUrl : mediaUrl;
  const hasValidInput = finalMediaUrl.trim().length > 0;
  const isComplete = restoredUrl.length > 0;
  const currentMediaType = getMediaType(uploadedFile, inputMode === 'url' ? mediaUrl : '');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) { toast.error(`File too large. Max ${formatFileSize(MAX_FILE_SIZE)}`); return; }
    
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) { 
      toast.error('Please select a video or image file'); 
      return; 
    }

    setUploadedFile(file);
    setUploadedUrl('');
    setMediaType(isVideo ? 'video' : 'image');
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // 使用统一的媒体上传 API
      const resp = await fetch('/api/storage/upload-media', { method: 'POST', body: formData });
      if (!resp.ok) throw new Error(`Upload failed: ${resp.status}`);
      const { code, message, data } = await resp.json();
      console.log('[MediaRestore] Upload response:', { code, message, data });
      if (code !== 0) throw new Error(message || 'Upload failed');
      if (!data?.url) throw new Error('No URL returned from upload');
      setUploadedUrl(data.url);
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
    setUploadProgress(0);
    setRestoredUrl('');
    setOriginalUrl('');
    setMediaType(null);
    setOriginalMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartRestore = async () => {
    if (!user) { setIsShowSignModal(true); return; }
    if (remainingCredits < RESTORE_CREDITS) { toast.error(`Insufficient credits. Need ${RESTORE_CREDITS}, have ${remainingCredits}.`); return; }
    if (!hasValidInput) { toast.error('Please upload a file or enter a URL.'); return; }

    const detectedType = currentMediaType || mediaType;
    
    setIsGenerating(true);
    setRestoredUrl('');
    setOriginalUrl(finalMediaUrl.trim());
    setOriginalMediaType(detectedType);
    setProcessingStatus('starting');

    try {
      const progressInterval = setInterval(() => {
        setProcessingStatus(prev => prev === 'starting' ? 'processing' : prev);
      }, 3000);

      const resp = await fetch('/api/ai/seedvr2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media: finalMediaUrl.trim(),
          fps: detectedType === 'video' ? parseInt(fps) : undefined,
          output_format: outputFormat,
          output_quality: outputQuality,
          apply_color_fix: applyColorFix,
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
        toast.success(detectedType === 'image' ? 'Image enhanced!' : 'Video restored!');
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
      const resp = await fetch(`/api/proxy/file?url=${encodeURIComponent(restoredUrl)}`);
      if (!resp.ok) throw new Error('Download failed');
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `seedvr2-enhanced.${outputFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Download failed');
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 完成状态 UI
  if (isComplete) {
    const isImageResult = originalMediaType === 'image';
    
    return (
      <div className="container w-full">
        <div className="mx-auto max-w-4xl">
          {/* Layer 2: 白色内容框 */}
          <div className="rounded-xl border border-white/20 bg-white/5 backdrop-blur p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-white">Enhancement Complete!</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {isImageResult 
                ? 'Your image has been enhanced to high quality'
                : 'Your video has been restored and upscaled to 4K quality'}
            </p>

            {/* Preview Mode Tabs */}
            <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as PreviewMode)} className="mb-4">
              <TabsList className="bg-black/30 border border-white/10">
                <TabsTrigger value="original" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">Original</TabsTrigger>
                <TabsTrigger value="enhanced" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">Enhanced</TabsTrigger>
                <TabsTrigger value="side-by-side" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">Side-by-Side</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Media Preview */}
            <div className="rounded-lg overflow-hidden bg-black/30 border border-white/10 mb-6" style={{ height: '400px' }}>
              {previewMode === 'side-by-side' ? (
                <div className="grid grid-cols-2 gap-1 h-full">
                  <div className="relative h-full">
                    {isImageResult ? (
                      <img src={originalUrl} alt="Original" className="w-full h-full object-contain" />
                    ) : (
                      <video src={originalUrl} controls className="w-full h-full object-contain" />
                    )}
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">Original</span>
                  </div>
                  <div className="relative h-full">
                    {isImageResult ? (
                      <img src={restoredUrl} alt="Enhanced" className="w-full h-full object-contain" />
                    ) : (
                      <video src={restoredUrl} controls className="w-full h-full object-contain" />
                    )}
                    <span className="absolute top-2 left-2 bg-orange-500 text-black text-xs px-2 py-1 rounded font-medium">
                      {isImageResult ? 'Enhanced' : 'Enhanced 4K'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative h-full flex items-center justify-center">
                  {isImageResult ? (
                    <img 
                      src={previewMode === 'original' ? originalUrl : restoredUrl} 
                      alt={previewMode === 'original' ? 'Original' : 'Enhanced'}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <video 
                      src={previewMode === 'original' ? originalUrl : restoredUrl} 
                      controls 
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                  <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded ${previewMode === 'original' ? 'bg-black/70 text-white' : 'bg-orange-500 text-black font-medium'}`}>
                    {previewMode === 'original' ? 'Original' : (isImageResult ? 'Enhanced' : 'Enhanced 4K')}
                  </span>
                </div>
              )}
            </div>

            {/* Actions - Layer 3: 橙色行动点 */}
            <div className="flex gap-3">
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading} 
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-black font-medium shadow-lg shadow-orange-500/50 hover:shadow-orange-500/60"
              >
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download Enhanced {isImageResult ? 'Image' : 'Video'}
              </Button>
              <Button variant="outline" onClick={handleNewRestore} className="border-white/20 hover:border-white/30 hover:bg-white/5">
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
        <div className="mx-auto max-w-3xl text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl text-white">
            {srOnlyTitle || 'Transform Any Video to 4K with SeedVR2'}
          </h1>
          <p className="text-gray-400 mt-4 text-lg">
            {srOnlyDescription || 'Professional AI restoration that removes noise, fixes artifacts, and recovers details. No editing experience needed.'}
          </p>
        </div>
      )}

      <div className="mx-auto max-w-2xl">
        {/* Layer 2: 白色内容框 */}
        <div className="rounded-xl border border-white/20 bg-white/5 backdrop-blur p-6">
          {/* Input Mode Tabs - 橙色激活状态 */}
          <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)} className="mb-6">
            <TabsList className="bg-black/30 border border-white/10">
              <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                <Upload className="h-4 w-4" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                <Link2 className="h-4 w-4" />
                From URL
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isGenerating ? (
            /* Processing View */
            <div className="py-16 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500 mb-4" />
              <p className="text-lg font-medium text-white">
                {processingStatus === 'starting' ? 'Starting...' : 
                 processingStatus === 'processing' ? 'Processing...' : 
                 'Enhancing...'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {processingStatus === 'starting' ? 'Initializing AI model' : 
                 processingStatus === 'processing' ? 'AI is enhancing your media' : 
                 'This may take a few minutes'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className={`h-2 w-2 rounded-full ${processingStatus === 'starting' ? 'bg-orange-500' : 'bg-white/10'}`} />
                <div className={`h-2 w-2 rounded-full ${processingStatus === 'processing' ? 'bg-orange-500 animate-pulse' : 'bg-white/10'}`} />
                <div className="h-2 w-2 rounded-full bg-white/10" />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {processingStatus === 'starting' ? 'Step 1/3: Starting' : 
                 processingStatus === 'processing' ? 'Step 2/3: Processing' : 
                 'Preparing...'}
              </p>
            </div>
          ) : (
            <>
              {/* Upload Area */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block text-white">Video or Image</Label>
                
                {inputMode === 'upload' ? (
                  <>
                    <input ref={fileInputRef} type="file" accept={ACCEPTED_FILE_TYPES} onChange={handleFileSelect} className="hidden" />
                    {!uploadedFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-white/10 hover:border-orange-500/50 bg-black/30 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 transition-colors"
                      >
                        <div className="rounded-full bg-white/5 p-3 mb-3">
                          {mediaMode === 'image' ? (
                            <ImageIcon className="text-gray-400 h-8 w-8" />
                          ) : mediaMode === 'video' ? (
                            <Video className="text-gray-400 h-8 w-8" />
                          ) : (
                            <div className="flex gap-1">
                              <Video className="text-gray-400 h-5 w-5" />
                              <ImageIcon className="text-gray-400 h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <p className="text-white text-sm font-medium">
                          {mediaMode === 'image' 
                            ? 'Click to upload an image' 
                            : mediaMode === 'video'
                            ? 'Click to upload a video'
                            : 'Click to upload a video or image'}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">or drag and drop</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-white/10 bg-black/30 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {mediaType === 'image' ? (
                              <ImageIcon className="text-orange-500 h-8 w-8" />
                            ) : (
                              <Video className="text-orange-500 h-8 w-8" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-white truncate max-w-[300px]">{uploadedFile.name}</p>
                              <p className="text-gray-500 text-xs">
                                {formatFileSize(uploadedFile.size)}
                                {uploadedUrl && <span className="text-green-500 ml-2">✓ Ready</span>}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={handleClearFile} disabled={isUploading} className="hover:bg-white/5">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {isUploading && (
                          <div className="mt-3">
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                            </div>
                            <p className="text-gray-500 mt-1 text-center text-xs">Uploading...</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      Videos: MP4/WebM/AVI/MOV/MKV • Images: JPG/PNG/WebP • Max {formatFileSize(MAX_FILE_SIZE)}
                    </p>
                  </>
                ) : (
                  <>
                    <Textarea
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4 or image.jpg"
                      className="min-h-[100px] resize-none bg-black/30 border-white/10 focus:border-orange-500/50 text-white placeholder:text-gray-500"
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Enter a direct link to a video or image file.
                    </p>
                  </>
                )}
              </div>

              {/* Advanced Settings */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="mb-6">
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full">
                  <Settings2 className="h-4 w-4" />
                  <span>Advanced Settings</span>
                  <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">FPS</Label>
                      <Select value={fps} onValueChange={setFps}>
                        <SelectTrigger className="h-9 bg-black/30 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FPS_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-400">Format</Label>
                      <Select value={outputFormat} onValueChange={setOutputFormat}>
                        <SelectTrigger className="h-9 bg-black/30 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {OUTPUT_FORMAT_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">Quality</Label>
                      <span className="text-gray-500 text-xs">{outputQuality}%</span>
                    </div>
                    <div className="relative w-full">
                      <div className="absolute top-1/2 left-0 right-0 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
                      <div className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full bg-orange-500" style={{ width: `${outputQuality}%` }} />
                      <input 
                        type="range" value={outputQuality} onChange={(e) => setOutputQuality(Number(e.target.value))} 
                        min={1} max={100} step={1} 
                        className="relative w-full h-1.5 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-orange-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-400">Color Correction</Label>
                    <Switch checked={applyColorFix} onCheckedChange={setApplyColorFix} />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Start Button - Layer 3: 橙色行动点 */}
              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-black font-medium shadow-lg shadow-orange-500/50 hover:shadow-orange-500/60"
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
