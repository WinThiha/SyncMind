'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownProps {
  content: string;
  className?: string;
}

export default function Markdown({ content, className = '' }: MarkdownProps) {
  return (
    <div className={`
      prose dark:prose-invert max-w-none break-words overflow-x-hidden
      [&_pre]:overflow-x-auto [&_pre]:max-w-full
      [&_code]:break-all [&_pre_code]:break-normal
      [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto
      [&_img]:max-w-full [&_img]:h-auto
      [&_a]:break-all
      ${className}
    `}>
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
}
