'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { WikiChatMessage } from './WikiChatMessage';
import { wikiAiChat, ChatMessage } from '@/lib/api/wiki';
import { useLocale } from '@/context/LocaleContext';

interface WikiChatPanelProps {
  projectId: string;
  onClose: () => void;
}

export function WikiChatPanel({ projectId, onClose }: WikiChatPanelProps) {
  const { t, locale } = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const answer = await wikiAiChat(projectId, text, [...messages, userMsg], locale);
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('wiki.chat.error') },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-background border-l border-border-glow shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-glow shrink-0">
        <div>
          <p className="text-sm font-bold text-foreground">{t('wiki.chat.title')}</p>
          <p className="text-xs text-foreground/40">{t('wiki.chat.subtitle')}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-colors"
          aria-label="Close chat"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-foreground/40 text-center pt-8">
            {t('wiki.chat.emptyHint')}
          </p>
        )}
        {messages.map((msg, i) => (
          <WikiChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-2xl rounded-tl-sm bg-foreground/5 border border-border-glow">
              <Loader2 size={14} className="animate-spin text-foreground/40" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-border-glow shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('wiki.chat.placeholder')}
          maxLength={1000}
          disabled={loading}
          className="flex-1 text-sm bg-foreground/5 border border-border-glow rounded-xl px-3 py-2 focus:outline-none focus:border-brand-primary/50 text-foreground placeholder:text-foreground/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
