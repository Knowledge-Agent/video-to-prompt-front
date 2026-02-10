import { Video } from '@remotion/media';
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type Card = {
  title: string;
  tag: string;
  desc: string;
  image: string;
  video?: string;
};

const cards: Card[] = [
  {
    title: 'Creator Reenactment',
    tag: 'Creator',
    desc: 'Reference clip → copy-ready prompts',
    image: '/imgs/features/landing-page.png',
    video: '/videos/video_before.mp4',
  },
  {
    title: 'Ad Variant Production',
    tag: 'Marketing',
    desc: 'Winning ad → reusable prompt variants',
    image: '/imgs/features/1.png',
    video: '/videos/video_after.mp4',
  },
  {
    title: 'Shot Planning',
    tag: 'Production',
    desc: 'Scene logic → execution shot list',
    image: '/imgs/features/2.png',
  },
  {
    title: 'Prompt Library Ops',
    tag: 'Team',
    desc: 'Incoming footage → standardized assets',
    image: '/imgs/features/3.png',
  },
];

const cardWidth = 430;
const mediaHeight = 240;

export const UseCasesPromo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const headerY = interpolate(frame, [0, 20], [25, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(circle at 50% -10%, #1f2a5a 0%, #050816 40%, #03040c 100%)',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
        color: '#ffffff',
      }}
    >
      <AbsoluteFill
        style={{
          padding: '72px 84px 64px',
        }}
      >
        <div
          style={{
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
            textAlign: 'center',
            marginBottom: 42,
          }}
        >
          <div
            style={{
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: -1.8,
              lineHeight: 1.02,
            }}
          >
            Video to Prompt Use Cases
          </div>
          <div
            style={{
              marginTop: 16,
              fontSize: 34,
              color: 'rgba(214,221,240,0.9)',
              fontWeight: 500,
            }}
          >
            Visual scenarios · minimal text · direct workflow
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24,
          }}
        >
          {cards.map((card, index) => {
            const delay = 12 + index * 8;
            const appear = spring({
              frame: frame - delay,
              fps,
              config: {
                damping: 18,
                stiffness: 140,
              },
            });

            const translateY = interpolate(appear, [0, 1], [70, 0]);
            const opacity = interpolate(appear, [0, 1], [0, 1]);

            return (
              <div
                key={card.title}
                style={{
                  width: cardWidth,
                  borderRadius: 24,
                  overflow: 'hidden',
                  border: '1px solid rgba(155,173,255,0.25)',
                  background:
                    'linear-gradient(180deg, rgba(11,15,33,0.9) 0%, rgba(9,11,24,0.95) 100%)',
                  boxShadow: '0 24px 40px rgba(0, 0, 0, 0.35)',
                  transform: `translateY(${translateY}px)`,
                  opacity,
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: mediaHeight,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {card.video ? (
                    <Video
                      src={staticFile(card.video)}
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Img
                      src={staticFile(card.image)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                </div>

                <div style={{ padding: '18px 18px 20px' }}>
                  <div
                    style={{
                      fontSize: 22,
                      color: '#a9b8ff',
                      fontWeight: 600,
                      marginBottom: 10,
                    }}
                  >
                    {card.tag}
                  </div>
                  <div
                    style={{
                      fontSize: 40,
                      lineHeight: 1.06,
                      fontWeight: 700,
                      letterSpacing: -0.9,
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 28,
                      lineHeight: 1.25,
                      color: 'rgba(215,220,236,0.95)',
                    }}
                  >
                    {card.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
