import path from 'node:path';

import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

const projectRoot = process.cwd();

Config.overrideWebpackConfig((currentConfig) => {
  const withTailwind = enableTailwind(currentConfig);

  return {
    ...withTailwind,
    resolve: {
      ...(withTailwind.resolve ?? {}),
      alias: {
        ...((withTailwind.resolve && withTailwind.resolve.alias) || {}),
        '@': path.resolve(projectRoot, 'src'),
      },
    },
  };
});
