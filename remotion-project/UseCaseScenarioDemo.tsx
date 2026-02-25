import type React from 'react';

import { Video } from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import type {
  PromptPackage,
  VideoRestoreText,
} from '../src/shared/blocks/generator/video-restore-view';
import {
  buildShotListText,
  VideoRestoreResultView,
  VideoRestoreUploadView,
} from '../src/shared/blocks/generator/video-restore-view';

export type UseCaseScenarioDemoProps = {
  tag: string;
  title: string;
  description: string;
  promptText: string;
  sourceVideo: string;
  accentFrom: string;
  accentTo: string;
};

const PHASE_UPLOAD_END = 52;
const PHASE_ANALYZE_END = 108;

const EN_TEXT: VideoRestoreText = {
  analysisDone: 'Analysis complete',
  packageReady: 'Prompt Package Ready for Imitation',
  newVideo: 'Analyze New Video',
  copyMaster: 'Copy Master Prompt',
  copyShots: 'Copy Shot List',
  copyShootPlan: 'Copy Imitation Plan',
  copyAll: 'Copy Full Package',
  copy: 'Copy',
  masterPrompt: 'Master Prompt (Core)',
  shortPrompt: 'Short Prompt',
  negativePrompt: 'Negative Prompt',
  shots: 'Shot List',
  noShots: 'No shot list returned.',
  keywords: 'Keywords',
  noKeywords: 'No keywords returned.',
  shootPlan: 'Imitation Shooting Pack',
  shootPlanHint:
    'Use this pack directly for shot recreation: prompt baseline + shot order + keyword constraints.',
  uploadHintTitle: 'Click to upload a video',
  uploadHintSub: 'or drag and drop',
  uploadReady: 'Upload complete',
  uploading: 'Uploading',
  urlHint: 'If upload is blocked, you can use a public direct file URL.',
  urlFallbackTitle: 'Or paste a direct video URL',
  urlFallbackPlaceholder: 'https://example.com/video.mp4',
  detecting: 'Detecting duration...',
  unavailable: 'Duration unavailable',
  detected: 'detected',
  generate: 'Analyze Video',
  generating: 'Analyzing video and generating prompts...',
};

const SHOTS = [
  'Hook opener with strong first-frame contrast',
  'Main action close-up with camera push-in',
  'Rhythm transition shot matching beat timing',
  'CTA ending shot with clear subject focus',
];

function buildShootPlan(pkg: PromptPackage): string {
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
    buildShotListText(pkg.shots, 'en'),
    '',
    '[Keywords]',
    pkg.keywords.join(', '),
    '',
    '[Negative Prompt]',
    pkg.negativePrompt,
  ].join('\n');
}

export const UseCaseScenarioDemo = ({
  tag,
  title,
  description,
  promptText,
  sourceVideo,
  accentFrom,
  accentTo,
}: UseCaseScenarioDemoProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardReveal = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 120,
    },
  });

  const cardOpacity = interpolate(cardReveal, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const cardY = interpolate(cardReveal, [0, 1], [24, 0], {
    extrapolateRight: 'clamp',
  });

  const bgScale = interpolate(frame, [0, 180], [1, 1.05], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const uploadOpacity = interpolate(
    frame,
    [0, PHASE_ANALYZE_END - 8, PHASE_ANALYZE_END + 6],
    [1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const resultReveal = spring({
    frame: frame - PHASE_ANALYZE_END,
    fps,
    config: {
      damping: 20,
      stiffness: 150,
    },
  });

  const resultOpacity = interpolate(resultReveal, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const resultY = interpolate(resultReveal, [0, 1], [10, 0], {
    extrapolateRight: 'clamp',
  });

  const analyzeProgress = interpolate(
    frame,
    [PHASE_UPLOAD_END, PHASE_ANALYZE_END],
    [0, 100],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    }
  );

  const demoPackage: PromptPackage = {
    summary: `${title} · ${description}`,
    masterPrompt: promptText,
    shortPrompt: promptText.replace('master_prompt:', '').split(',').slice(0, 2).join(',').trim(),
    negativePrompt:
      'avoid overexposure, avoid distorted hands, avoid unstable framing, avoid text glitches',
    keywords: promptText
      .replace('master_prompt:', '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 5),
    shots: SHOTS,
  };

  const shootPlanText = buildShootPlan(demoPackage);

  const statusText =
    frame < PHASE_UPLOAD_END
      ? 'Ready. Upload or paste a video URL to start analysis.'
      : frame < PHASE_ANALYZE_END
        ? 'Analyzing video and generating prompts...'
        : 'Analysis complete. Prompt package ready.';

  const noopDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <AbsoluteFill
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      }}
    >
      <Video
        src={staticFile(sourceVideo)}
        muted
        loop
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${bgScale})`,
        }}
      />

      <AbsoluteFill
        style={{
          background:
            'linear-gradient(180deg, rgba(4,6,16,0.24) 0%, rgba(4,6,16,0.82) 58%, rgba(4,6,16,0.95) 100%)',
        }}
      />

      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 16% 14%, ${accentFrom}40 0%, transparent 40%), radial-gradient(circle at 86% 18%, ${accentTo}3a 0%, transparent 42%)`,
        }}
      />

      <div
        className="dark"
        style={{
          position: 'absolute',
          inset: 0,
          padding: 30,
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
        }}
      >
        <div
          style={{
            margin: '0 auto',
            width: '100%',
            maxWidth: 1060,
          }}
        >
          <div className="rounded-2xl border border-white/20 bg-white/5 p-5 backdrop-blur md:p-6">
            <div
              style={{
                position: 'relative',
                minHeight: 604,
              }}
            >
              <div
                style={{
                  opacity: uploadOpacity,
                  pointerEvents: 'none',
                }}
              >
                <VideoRestoreUploadView
                  text={EN_TEXT}
                  uploadedFile={
                    frame < PHASE_UPLOAD_END
                      ? null
                      : {
                          name: `${title.toLowerCase().replace(/\s+/g, '-')}.mp4`,
                          sizeText: '14.6 MB',
                          isReady: true,
                        }
                  }
                  uploadProgress={100}
                  isUploading={false}
                  isDraggingUpload={false}
                  mediaUrl="https://example.com/video.mp4"
                  statusText={statusText}
                  maxFileSizeText="500.0 MB"
                  isGenerateDisabled={false}
                  isGenerating={frame >= PHASE_UPLOAD_END && frame < PHASE_ANALYZE_END}
                  onDropZoneClick={() => undefined}
                  onDropZoneDragOver={noopDrag}
                  onDropZoneDragLeave={noopDrag}
                  onDropZoneDrop={noopDrag}
                  onClearFile={() => undefined}
                  onMediaUrlChange={() => undefined}
                  onGenerate={() => undefined}
                />
              </div>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: resultOpacity,
                  transform: `translateY(${resultY}px)`,
                  pointerEvents: 'none',
                }}
              >
                <VideoRestoreResultView
                  result={demoPackage}
                  text={EN_TEXT}
                  copiedField=""
                  language="en"
                  shootPlanText={shootPlanText}
                  onReset={() => undefined}
                  onCopy={() => undefined}
                  onCopyAll={() => undefined}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: 44,
            top: 44,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: '#edf2ff',
            fontSize: 12,
            padding: '5px 10px',
          }}
        >
          {tag}
        </div>
      </div>
    </AbsoluteFill>
  );
};
