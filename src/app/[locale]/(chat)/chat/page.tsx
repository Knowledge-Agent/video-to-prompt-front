/**
 * Chat Page - DISABLED
 * This page is temporarily disabled for SeedVR2 launch.
 * SeedVR2 focuses on video restoration only.
 * To re-enable: uncomment the code below and remove the redirect.
 */

import { redirect } from 'next/navigation';

export default function ChatPage() {
  redirect('/');
}

/*
import { ChatGenerator } from '@/shared/blocks/chat/generator';

export default function ChatPage() {
  return <ChatGenerator />;
}
*/
