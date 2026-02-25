import {
  Check,
  Copy,
  Link2,
  Loader2,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import type React from 'react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { cn } from '../../lib/utils';

export interface PromptPackage {
  summary: string;
  masterPrompt: string;
  shortPrompt: string;
  negativePrompt: string;
  keywords: string[];
  shots: string[];
}

export type PromptLanguage = 'en' | 'zh';

export interface VideoRestoreText {
  analysisDone: string;
  packageReady: string;
  newVideo: string;
  copyMaster: string;
  copyShots: string;
  copyShootPlan: string;
  copyAll: string;
  copy: string;
  masterPrompt: string;
  shortPrompt: string;
  negativePrompt: string;
  shots: string;
  noShots: string;
  keywords: string;
  noKeywords: string;
  shootPlan: string;
  shootPlanHint: string;
  uploadHintTitle: string;
  uploadHintSub: string;
  uploadReady: string;
  uploading: string;
  urlHint: string;
  urlFallbackTitle: string;
  urlFallbackPlaceholder: string;
  detecting: string;
  unavailable: string;
  detected: string;
  generate: string;
  generating: string;
}

export function buildShotListText(shots: string[], language: PromptLanguage): string {
  if (shots.length === 0) {
    return language === 'zh' ? '未返回镜头清单。' : 'No shot list returned.';
  }

  return shots.map((shot, index) => `${index + 1}. ${shot}`).join('\n');
}

interface VideoRestoreResultViewProps {
  result: PromptPackage;
  text: VideoRestoreText;
  copiedField: string;
  language: PromptLanguage;
  shootPlanText: string;
  onReset: () => void;
  onCopy: (key: string, content: string) => void;
  onCopyAll: () => void;
}

export function VideoRestoreResultView({
  result,
  text,
  copiedField,
  language,
  shootPlanText,
  onReset,
  onCopy,
  onCopyAll,
}: VideoRestoreResultViewProps) {
  return (
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
          onClick={onReset}
          className="border-white/20 hover:bg-white/5"
        >
          {text.newVideo}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopy('master', result.masterPrompt)}
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
          onClick={() => onCopy('shots', buildShotListText(result.shots, language))}
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
          onClick={() => onCopy('shoot-plan', shootPlanText)}
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
          onClick={onCopyAll}
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
            onClick={() => onCopy('master-inline', result.masterPrompt)}
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
              onClick={() => onCopy('short', result.shortPrompt)}
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
              onClick={() => onCopy('negative', result.negativePrompt)}
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
            onClick={() => onCopy('shoot-plan-inline', shootPlanText)}
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
  );
}

interface UploadFileView {
  name: string;
  sizeText: string;
  isReady: boolean;
}

interface VideoRestoreUploadViewProps {
  text: VideoRestoreText;
  uploadedFile: UploadFileView | null;
  uploadProgress: number;
  isUploading: boolean;
  isDraggingUpload: boolean;
  mediaUrl: string;
  statusText: string;
  maxFileSizeText: string;
  isGenerateDisabled: boolean;
  isGenerating: boolean;
  onDropZoneClick: () => void;
  onDropZoneDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDropZoneDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDropZoneDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onClearFile: () => void;
  onMediaUrlChange: (value: string) => void;
  onGenerate: () => void;
}

export function VideoRestoreUploadView({
  text,
  uploadedFile,
  uploadProgress,
  isUploading,
  isDraggingUpload,
  mediaUrl,
  statusText,
  maxFileSizeText,
  isGenerateDisabled,
  isGenerating,
  onDropZoneClick,
  onDropZoneDragOver,
  onDropZoneDragLeave,
  onDropZoneDrop,
  onClearFile,
  onMediaUrlChange,
  onGenerate,
}: VideoRestoreUploadViewProps) {
  return (
    <div className="space-y-5">
      <div>
        {!uploadedFile ? (
          <div
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-black/30 py-12 transition-colors',
              isDraggingUpload
                ? 'border-primary/70 bg-primary/10'
                : 'border-white/10 hover:border-primary/50'
            )}
            onClick={onDropZoneClick}
            onDragOver={onDropZoneDragOver}
            onDragLeave={onDropZoneDragLeave}
            onDrop={onDropZoneDrop}
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
                <p className="truncate text-sm font-medium text-white">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {uploadedFile.sizeText}
                  {uploadedFile.isReady ? (
                    <span className="ml-2 text-emerald-400">✓ {text.uploadReady}</span>
                  ) : null}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFile}
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
          {text.urlHint} · {maxFileSizeText}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link2 className="h-3.5 w-3.5" />
          {text.urlFallbackTitle}
        </div>
        <Input
          value={mediaUrl}
          onChange={(event) => onMediaUrlChange(event.target.value)}
          placeholder={text.urlFallbackPlaceholder}
          className="h-11 border-white/10 bg-black/30 text-white placeholder:text-gray-500"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-gray-400">
        {statusText}
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerateDisabled}
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
  );
}
