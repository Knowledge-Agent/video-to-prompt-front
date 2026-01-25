import { redirect } from '@/core/i18n/navigation';
import { getAllConfigs } from '@/shared/models/config';

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const configs = await getAllConfigs();
  const enableAiTasks = configs.activity_ai_tasks_enabled !== 'false';
  const enableAiChats = configs.activity_ai_chats_enabled !== 'false';

  if (enableAiTasks) {
    redirect({ href: '/activity/ai-tasks', locale });
  }
  if (enableAiChats) {
    redirect({ href: '/activity/chats', locale });
  }

  redirect({ href: '/settings', locale });
}
