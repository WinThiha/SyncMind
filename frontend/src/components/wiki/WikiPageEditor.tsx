'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Save } from 'lucide-react';
import MarkdownEditor from '@/components/shared/MarkdownEditor';
import { GlassButton } from '@/components/ui/GlassButton';
import { wikiAiDraft } from '@/lib/api/wiki';
import { useLocale } from '@/context/LocaleContext';

interface WikiPageEditorProps {
  projectId: string;
  initialTitle?: string;
  initialContent?: string;
  onSave: (title: string, content: string) => Promise<void>;
  onCancel?: () => void;
  saving?: boolean;
}

export function WikiPageEditor({
  projectId,
  initialTitle = '',
  initialContent = '',
  onSave,
  onCancel,
  saving = false,
}: WikiPageEditorProps) {
  const { t, locale } = useLocale();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftResult, setDraftResult] = useState('');
  const [draftError, setDraftError] = useState('');

  async function handleGenerateDraft() {
    if (!draftPrompt.trim()) return;
    setDraftLoading(true);
    setDraftError('');
    try {
      const result = await wikiAiDraft(projectId, draftPrompt, locale);
      setDraftResult(result);
      setDraftModalOpen(false);
      setConfirmModalOpen(true);
    } catch {
      setDraftError(t('wiki.editor.draft.error'));
    } finally {
      setDraftLoading(false);
    }
  }

  function handleApplyDraft() {
    setContent(draftResult);
    setConfirmModalOpen(false);
    setDraftPrompt('');
    setDraftResult('');
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('wiki.editor.titlePlaceholder')}
        className="w-full text-2xl font-bold bg-transparent border-0 border-b border-border-glow pb-2 focus:outline-none focus:border-brand-primary/50 text-foreground placeholder:text-foreground/30 transition-colors"
      />

      {/* Toolbar actions */}
      <div className="flex items-center justify-between">
        <GlassButton
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setDraftModalOpen(true)}
        >
          <Sparkles size={13} />
          {t('wiki.editor.askAiDraft')}
        </GlassButton>

        <div className="flex items-center gap-2">
          {onCancel && (
            <GlassButton
              type="button"
              size="sm"
              variant="secondary"
              onClick={onCancel}
            >
              {t('wiki.edit.cancel')}
            </GlassButton>
          )}
          <GlassButton
            type="button"
            size="sm"
            onClick={() => onSave(title, content)}
            disabled={saving || !title.trim()}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? t('wiki.editor.saving') : t('wiki.editor.save')}
          </GlassButton>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder={t('wiki.editor.contentPlaceholder')}
          rows={20}
        />
      </div>

      {/* AI Draft prompt modal */}
      {draftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg">{t('wiki.editor.draft.title')}</h3>
            <p className="text-sm text-foreground/60">{t('wiki.editor.draft.description')}</p>
            <textarea
              value={draftPrompt}
              onChange={(e) => setDraftPrompt(e.target.value)}
              placeholder={t('wiki.editor.draft.placeholder')}
              rows={4}
              maxLength={500}
              className="w-full p-3 text-sm bg-foreground/5 border border-border-glow rounded-lg focus:outline-none focus:border-brand-primary/50 text-foreground placeholder:text-foreground/40 resize-none"
            />
            {draftError && <p className="text-sm text-red-500">{draftError}</p>}
            <div className="flex gap-2 justify-end">
              <GlassButton
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => { setDraftModalOpen(false); setDraftError(''); }}
              >
                {t('wiki.editor.draft.cancel')}
              </GlassButton>
              <GlassButton
                type="button"
                size="sm"
                onClick={handleGenerateDraft}
                disabled={draftLoading || !draftPrompt.trim()}
              >
                {draftLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {t('wiki.editor.draft.generate')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}

      {/* Confirm replace modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-lg">{t('wiki.editor.confirm.title')}</h3>
            <p className="text-sm text-foreground/60">{t('wiki.editor.confirm.description')}</p>
            <div className="flex gap-2 justify-end">
              <GlassButton
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setConfirmModalOpen(false)}
              >
                {t('wiki.editor.confirm.keepEditing')}
              </GlassButton>
              <GlassButton type="button" size="sm" onClick={handleApplyDraft}>
                {t('wiki.editor.confirm.replace')}
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
