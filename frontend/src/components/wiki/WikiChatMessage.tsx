'use client';

import Markdown from '@/components/shared/Markdown';

interface WikiChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export function WikiChatMessage({ role, content }: WikiChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm bg-brand-primary/15 border border-brand-primary/20 text-sm text-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] px-3 py-2 rounded-2xl rounded-tl-sm bg-foreground/5 border border-border-glow text-sm">
        <Markdown content={content} className="text-foreground/85" />
      </div>
    </div>
  );
}
