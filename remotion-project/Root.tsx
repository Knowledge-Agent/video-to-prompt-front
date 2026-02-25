import { Composition } from 'remotion';

import { UseCasesPromo } from './UseCasesPromo';
import {
  UseCaseScenarioDemo,
  UseCaseScenarioDemoProps,
} from './UseCaseScenarioDemo';
import { UserFlowScenarioPromo } from './UserFlowScenarioPromo';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="UserFlowScenarioPromo"
        component={UserFlowScenarioPromo}
        durationInFrames={440}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="UseCasesPromo"
        component={UseCasesPromo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="UseCaseDemoShortsHook"
        component={UseCaseScenarioDemo}
        durationInFrames={180}
        fps={30}
        width={1280}
        height={720}
        defaultProps={
          {
            tag: 'YouTube Shorts',
            title: 'Hook Reenactment',
            description:
              'Convert the first 3-second hook into a reusable prompt package for fast reenactment.',
            promptText:
              'master_prompt: 9:16 hook opener, punch-in reaction, strong contrast, caption rhythm',
            sourceVideo: '/videos/before_other.mp4',
            accentFrom: '#5B8CFF',
            accentTo: '#9A6BFF',
          } satisfies UseCaseScenarioDemoProps
        }
      />

      <Composition
        id="UseCaseDemoTutorialSegment"
        component={UseCaseScenarioDemo}
        durationInFrames={180}
        fps={30}
        width={1280}
        height={720}
        defaultProps={
          {
            tag: 'YouTube Tutorial',
            title: 'A-Roll + B-Roll Segment',
            description:
              'Turn one tutorial section into repeatable A-roll and B-roll prompt instructions.',
            promptText:
              'master_prompt: medium explain shot, product cutaways, stable pacing, clean light continuity',
            sourceVideo: '/videos/video_before.mp4',
            accentFrom: '#28B7A8',
            accentTo: '#5FD1C6',
          } satisfies UseCaseScenarioDemoProps
        }
      />

      <Composition
        id="UseCaseDemoReviewBreakdown"
        component={UseCaseScenarioDemo}
        durationInFrames={180}
        fps={30}
        width={1280}
        height={720}
        defaultProps={
          {
            tag: 'YouTube Product Review',
            title: 'Feature Demo Breakdown',
            description:
              'Break review narrative into close-up, comparison, and CTA shots with copy-ready prompts.',
            promptText:
              'master_prompt: detail close-ups, side-by-side comparison, clear CTA outro, neutral daylight tone',
            sourceVideo: '/videos/video_after.mp4',
            accentFrom: '#F97316',
            accentTo: '#FB923C',
          } satisfies UseCaseScenarioDemoProps
        }
      />

      <Composition
        id="UseCaseDemoVlogSequence"
        component={UseCaseScenarioDemo}
        durationInFrames={180}
        fps={30}
        width={1280}
        height={720}
        defaultProps={
          {
            tag: 'YouTube Vlog',
            title: 'Lifestyle Sequence Rebuild',
            description:
              'Extract movement path and mood cues to keep vlog transitions and emotion shots consistent.',
            promptText:
              'master_prompt: cinematic walk sequence, natural motion blur, warm mood grade, emotional close shot',
            sourceVideo: '/videos/after_other_1.mp4',
            accentFrom: '#E879F9',
            accentTo: '#C084FC',
          } satisfies UseCaseScenarioDemoProps
        }
      />
    </>
  );
};
