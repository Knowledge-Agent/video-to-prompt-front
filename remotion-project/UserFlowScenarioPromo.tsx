import { Video } from '@remotion/media';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Scenario = {
  id: string;
  tabLabel: string;
  title: string;
  format: string;
  persona: string;
  beforeSrc: string;
  afterSrc: string;
  summary: string;
  promptLines: string[];
  tags: string[];
};

const SCENARIOS: Scenario[] = [
  {
    id: 'shorts-hook',
    tabLabel: 'YouTube Shorts',
    title: 'Shorts Hook Reenactment',
    format: '9:16 fast hook',
    persona: 'Shorts creator',
    beforeSrc: '/videos/before_other.mp4',
    afterSrc: '/videos/after_other_1.mp4',
    summary: 'Rebuild first 3-second hook rhythm and framing for stronger watch-through.',
    promptLines: [
      'master_prompt: bold opener, quick push-in, high contrast',
      'shot_list: hook close-up -> punch-in reaction -> payoff frame',
      'camera: vertical handheld, micro shake, 0.8x speed ramp',
      'negative_prompt: flat pace, weak hook, washed highlights',
    ],
    tags: ['Hook timing', 'Punch-in', 'Caption rhythm', 'Retention'],
  },
  {
    id: 'long-form-segment',
    tabLabel: 'Long-form',
    title: 'Tutorial Segment Rebuild',
    format: '16:9 explain + b-roll',
    persona: 'Education creator',
    beforeSrc: '/videos/video_before.mp4',
    afterSrc: '/videos/video_after.mp4',
    summary: 'Convert one benchmark segment into repeatable A-roll + B-roll prompt package.',
    promptLines: [
      'master_prompt: clean studio explain shot with product inserts',
      'shot_list: A-roll intro -> b-roll close details -> recap cutaway',
      'camera: tripod medium, smooth side pan, detail macro insert',
      'negative_prompt: jumpy cuts, mismatched color temp, cluttered frame',
    ],
    tags: ['A-roll', 'B-roll', 'Pacing', 'Explainer'],
  },
  {
    id: 'vlog-cinematic',
    tabLabel: 'Vlog',
    title: 'Vlog Cinematic Sequence',
    format: 'travel/lifestyle mood',
    persona: 'Lifestyle creator',
    beforeSrc: '/videos/before_other.mp4',
    afterSrc: '/videos/video_after.mp4',
    summary: 'Extract movement path + color mood, then reenact with consistent story flow.',
    promptLines: [
      'master_prompt: golden-hour city walk, cinematic lifestyle mood',
      'shot_list: environment wide -> walk follow -> emotional detail close',
      'camera: gimbal follow, low-angle pass, natural motion blur',
      'negative_prompt: over-stabilized motion, noisy shadows, harsh skin tones',
    ],
    tags: ['Color mood', 'Motion path', 'Transition', 'Story beat'],
  },
];

const WORKFLOW_STEPS = ['Upload', 'Analyze', 'Copy pack', 'Reenact'];
const INTRO_START = 18;
const SCENE_START = 42;
const SCENE_DURATION = 122;
const TRANSITION_FRAMES = 24;
const OUTRO_START = SCENE_START + SCENE_DURATION * SCENARIOS.length;

const clamped = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const ScenarioStage = ({
  scenario,
  localFrame,
  opacity,
  fps,
}: {
  scenario: Scenario;
  localFrame: number;
  opacity: number;
  fps: number;
}) => {
  const analysisProgress = interpolate(localFrame, [16, 58], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const promptReveal = spring({
    frame: localFrame - 52,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  const beforeToAfter = interpolate(localFrame, [74, 112], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const copyPulse = localFrame >= 62 && localFrame <= 90
    ? interpolate(Math.sin((localFrame / fps) * Math.PI * 2), [-1, 1], [0.95, 1.05])
    : 1;

  const cursorVisible = localFrame >= 60 && localFrame <= 92;
  const cursorX = interpolate(localFrame, [60, 84], [1265, 1452], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cursorY = interpolate(localFrame, [60, 84], [758, 830], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const clickRing = interpolate(localFrame, [82, 92], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.12fr 1fr',
          gap: 24,
          flex: 1,
        }}
      >
        <div
          style={{
            borderRadius: 24,
            overflow: 'hidden',
            border: '1px solid rgba(167, 132, 255, 0.28)',
            background:
              'linear-gradient(180deg, rgba(23, 17, 44, 0.86) 0%, rgba(10, 11, 24, 0.96) 100%)',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: 62,
              padding: '0 18px',
              borderBottom: '1px solid rgba(164, 126, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 23, fontWeight: 640 }}>{scenario.title}</div>
              <div
                style={{
                  borderRadius: 999,
                  border: '1px solid rgba(132, 209, 255, 0.36)',
                  padding: '4px 10px',
                  fontSize: 13,
                  color: '#cfe9ff',
                }}
              >
                {scenario.format}
              </div>
            </div>
            <div
              style={{
                borderRadius: 999,
                border: '1px solid rgba(172, 133, 255, 0.33)',
                padding: '6px 12px',
                fontSize: 14,
                color: '#e7ddff',
              }}
            >
              {scenario.persona}
            </div>
          </div>

          <div style={{ position: 'relative', height: 542 }}>
            <Video
              src={staticFile(scenario.beforeSrc)}
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: interpolate(beforeToAfter, [0, 1], [1, 0]),
              }}
            />

            <Video
              src={staticFile(scenario.afterSrc)}
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: beforeToAfter,
              }}
            />

            <div
              style={{
                position: 'absolute',
                left: 18,
                top: 18,
                padding: '9px 14px',
                borderRadius: 12,
                border: '1px solid rgba(177, 135, 255, 0.34)',
                background: 'rgba(20, 16, 42, 0.62)',
                fontSize: 16,
                color: '#ece2ff',
              }}
            >
              {beforeToAfter < 0.52 ? 'Input reference clip' : 'Reenacted output'}
            </div>

            <div
              style={{
                position: 'absolute',
                right: 18,
                bottom: 18,
                padding: '8px 12px',
                borderRadius: 999,
                fontSize: 14,
                color: '#130a21',
                background:
                  'linear-gradient(90deg, rgba(236, 72, 153, 1) 0%, rgba(249, 115, 22, 1) 100%)',
                opacity: promptReveal,
                transform: `translateY(${interpolate(promptReveal, [0, 1], [8, 0])}px)`,
              }}
            >
              Prompt applied
            </div>
          </div>

          <div
            style={{
              height: 96,
              padding: '0 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(167, 132, 255, 0.2)',
            }}
          >
            <div style={{ fontSize: 18, color: '#e8dcff', maxWidth: 640 }}>{scenario.summary}</div>
            <div style={{ fontSize: 16, color: '#d5c5ff' }}>YouTube flow</div>
          </div>
        </div>

        <div
          style={{
            borderRadius: 24,
            border: '1px solid rgba(167, 132, 255, 0.28)',
            background:
              'linear-gradient(180deg, rgba(20, 15, 38, 0.9) 0%, rgba(7, 9, 22, 0.98) 100%)',
            padding: '20px 20px 18px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {WORKFLOW_STEPS.map((step, index) => {
              const start = 8 + index * 22;
              const done = localFrame > start + 15;
              const active = localFrame >= start && localFrame <= start + 15;

              return (
                <div
                  key={step}
                  style={{
                    borderRadius: 10,
                    border: done
                      ? '1px solid rgba(160, 221, 255, 0.45)'
                      : active
                        ? '1px solid rgba(236, 72, 153, 0.78)'
                        : '1px solid rgba(118, 132, 184, 0.28)',
                    background: done
                      ? 'rgba(28, 58, 78, 0.45)'
                      : active
                        ? 'rgba(129, 35, 87, 0.55)'
                        : 'rgba(15, 20, 42, 0.42)',
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#f6f2ff',
                    fontWeight: 600,
                  }}
                >
                  {step}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 16,
              borderRadius: 14,
              border: '1px solid rgba(167, 132, 255, 0.3)',
              background: 'rgba(9, 12, 30, 0.68)',
              padding: 14,
            }}
          >
            <div style={{ fontSize: 17, color: '#e3d9ff', marginBottom: 8 }}>
              Scene analysis
            </div>
            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: 'rgba(57, 67, 116, 0.46)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${analysisProgress}%`,
                  height: '100%',
                  borderRadius: 999,
                  background:
                    'linear-gradient(90deg, rgba(236, 72, 153, 0.98) 0%, rgba(249, 115, 22, 0.98) 100%)',
                }}
              />
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {scenario.tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    borderRadius: 999,
                    border: '1px solid rgba(174, 138, 255, 0.36)',
                    background: 'rgba(37, 26, 62, 0.55)',
                    padding: '6px 10px',
                    fontSize: 13,
                    color: '#e8ddff',
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 14,
              border: '1px solid rgba(167, 132, 255, 0.35)',
              background: 'rgba(8, 10, 24, 0.82)',
              padding: '12px 12px 14px',
              opacity: promptReveal,
              transform: `translateY(${interpolate(promptReveal, [0, 1], [10, 0])}px)`,
            }}
          >
            <div style={{ fontSize: 17, color: '#e3d9ff', marginBottom: 8 }}>
              Prompt package
            </div>
            <div
              style={{
                fontSize: 13,
                lineHeight: 1.52,
                color: '#f5f1ff',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
            >
              {scenario.promptLines.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <div
                style={{
                  borderRadius: 10,
                  border: '1px solid rgba(255, 210, 235, 0.8)',
                  background:
                    'linear-gradient(90deg, rgba(236, 72, 153, 1) 0%, rgba(249, 115, 22, 1) 100%)',
                  color: '#180c21',
                  padding: '8px 14px',
                  fontSize: 15,
                  fontWeight: 700,
                  transform: `scale(${copyPulse})`,
                }}
              >
                Copy prompt package
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              color: '#c5b6e6',
            }}
          >
            Estimated cost · 6 credits
          </div>
        </div>
      </div>

      {cursorVisible ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: cursorX,
              top: cursorY,
              width: 17,
              height: 17,
              borderRadius: 999,
              background: '#fff',
              boxShadow: '0 0 12px rgba(255,255,255,0.82)',
              opacity,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: cursorX - 11,
              top: cursorY - 11,
              width: 40,
              height: 40,
              borderRadius: 999,
              border: '2px solid rgba(248, 160, 208, 0.82)',
              opacity: clickRing * opacity,
              transform: `scale(${interpolate(clickRing, [0, 1], [0.5, 1.7])})`,
            }}
          />
        </>
      ) : null}
    </AbsoluteFill>
  );
};

export const UserFlowScenarioPromo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const intro = spring({
    frame: frame - INTRO_START,
    fps,
    config: { damping: 180 },
    durationInFrames: 24,
  });

  const sceneFloat = clamped((frame - SCENE_START) / SCENE_DURATION, 0, SCENARIOS.length - 1);
  const currentIndex = clamped(Math.floor(sceneFloat), 0, SCENARIOS.length - 1);
  const localFrame = Math.max(0, frame - SCENE_START - currentIndex * SCENE_DURATION);

  const transitionProgress =
    currentIndex < SCENARIOS.length - 1
      ? interpolate(
          localFrame,
          [SCENE_DURATION - TRANSITION_FRAMES, SCENE_DURATION],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        )
      : 0;

  const nextLocalFrame = Math.max(0, localFrame - (SCENE_DURATION - TRANSITION_FRAMES));
  const outroOpacity = interpolate(frame, [OUTRO_START, OUTRO_START + 36], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(1000px 620px at 8% -14%, #ec489944 0%, transparent 65%), radial-gradient(960px 620px at 90% 114%, #f9731638 0%, transparent 66%), linear-gradient(180deg, #140f26 0%, #080914 100%)',
        color: '#f6f1ff',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      }}
    >
      <AbsoluteFill style={{ padding: '50px 58px 34px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            opacity: intro,
            transform: `translateY(${interpolate(intro, [0, 1], [14, 0])}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Img
              src={staticFile('/imgs/logos/video-to-prompt-logo.svg')}
              style={{ width: 34, height: 34, opacity: 0.96 }}
            />
            <div>
              <div style={{ fontSize: 26, fontWeight: 730 }}>YouTube Creator Scenarios</div>
              <div style={{ fontSize: 14, color: '#d9c8f5' }}>
                Built with the same workflow as Video to Prompt
              </div>
            </div>
          </div>

          <div
            style={{
              border: '1px solid rgba(236, 72, 153, 0.34)',
              borderRadius: 999,
              padding: '8px 14px',
              fontSize: 14,
              color: '#f2d8eb',
              background: 'rgba(85, 23, 58, 0.35)',
            }}
          >
            Upload once → Copy prompt package → Reenact
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 18,
            opacity: intro,
          }}
        >
          {SCENARIOS.map((scenario, index) => {
            const active = 1 - clamped(Math.abs(sceneFloat - index), 0, 1);
            const borderAlpha = interpolate(active, [0, 1], [0.22, 0.75]);
            const bgAlpha = interpolate(active, [0, 1], [0.26, 0.65]);

            return (
              <div
                key={scenario.id}
                style={{
                  borderRadius: 14,
                  border: `1px solid rgba(236, 72, 153, ${borderAlpha})`,
                  background: `rgba(55, 21, 62, ${bgAlpha})`,
                  padding: '10px 14px',
                  fontSize: 15,
                  color: '#f7ecff',
                  fontWeight: active > 0.6 ? 700 : 550,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{scenario.tabLabel}</span>
                <span style={{ fontSize: 12, color: '#d9c8f5' }}>{scenario.format}</span>
              </div>
            );
          })}
        </div>

        <div style={{ position: 'relative', flex: 1 }}>
          <ScenarioStage
            scenario={SCENARIOS[currentIndex]}
            localFrame={localFrame}
            opacity={1 - transitionProgress}
            fps={fps}
          />

          {currentIndex < SCENARIOS.length - 1 ? (
            <ScenarioStage
              scenario={SCENARIOS[currentIndex + 1]}
              localFrame={nextLocalFrame}
              opacity={transitionProgress}
              fps={fps}
            />
          ) : null}
        </div>

        <div
          style={{
            marginTop: 14,
            textAlign: 'center',
            fontSize: 24,
            color: '#f4e7ff',
            opacity: outroOpacity,
          }}
        >
          One product. Three YouTube creation scenarios. Same executable prompt workflow.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
