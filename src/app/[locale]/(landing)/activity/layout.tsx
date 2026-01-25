import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

import { ConsoleLayout } from '@/shared/blocks/console/layout';
import { getAllConfigs } from '@/shared/models/config';

export default async function ActivityLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getTranslations('activity.sidebar');

  const configs = await getAllConfigs();

  // settings title
  const title = t('title');

  // settings nav
  const nav = t.raw('nav');

  const enableAiTasks = configs.activity_ai_tasks_enabled !== 'false';
  const enableAiChats = configs.activity_ai_chats_enabled !== 'false';

  const filteredNav = {
    ...nav,
    items: (nav?.items || []).filter((item: any) => {
      const url = String(item?.url || '');
      if (!enableAiTasks && url === '/activity/ai-tasks') {
        return false;
      }
      if (!enableAiChats && url === '/activity/chats') {
        return false;
      }
      return true;
    }),
  };

  const topNav = t.raw('top_nav');

  return (
    <ConsoleLayout
      title={title}
      nav={filteredNav}
      topNav={topNav}
      className="py-16 md:py-20"
    >
      {children}
    </ConsoleLayout>
  );
}
