'use client';

import Markdown from '@/components/shared/Markdown';

interface WikiPageViewProps {
  content: string | null;
}

export function WikiPageView({ content }: WikiPageViewProps) {
  if (!content) {
    return (
      <div className="text-foreground/40 italic text-sm py-8 text-center">
        This page has no content yet.
      </div>
    );
  }

  return <Markdown content={content} className="text-foreground/90" />;
}
