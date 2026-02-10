import { Composition } from 'remotion';

import { UseCasesPromo } from './UseCasesPromo';
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
    </>
  );
};
