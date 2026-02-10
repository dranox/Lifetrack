'use client';

import dynamic from 'next/dynamic';

const ChatBubble = dynamic(() => import('./ChatBubble'), {
  ssr: false,
});

export function ChatBubbleWrapper() {
  return <ChatBubble />;
}
