'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/lib/api/projects';
import { AxiosError } from 'axios';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion } from 'framer-motion';
import { Folder, Key, Image as ImageIcon, ListChecks, ChevronLeft } from 'lucide-react';
import { BASE_SPRING } from '@/lib/animations';
import { useLocale } from '@/context/LocaleContext';

export default function CreateProjectForm() {
  const { t } = useLocale();
  const defaultIssueTypes = t('projects.create.typesDefault');
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [icon, setIcon] = useState('');
  const [issueTypes, setIssueTypes] = useState(defaultIssueTypes);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const setFieldValidityMessage = (target: HTMLInputElement, type: 'text' | 'key' | 'url') => {
    if (target.validity.valueMissing) {
      target.setCustomValidity(t('projects.create.validation.required'));
      return;
    }

    if (type === 'key') {
      if (target.validity.tooShort || target.validity.tooLong) {
        target.setCustomValidity(t('projects.create.validation.keyLength'));
        return;
      }
      if (target.validity.patternMismatch) {
        target.setCustomValidity(t('projects.create.validation.keyPattern'));
        return;
      }
    }

    if (type === 'url' && target.validity.typeMismatch) {
      target.setCustomValidity(t('projects.create.validation.url'));
      return;
    }

    target.setCustomValidity('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const typesArray = issueTypes.split(',').map((t) => t.trim()).filter((t) => t !== '');
      const project = await createProject({
        name,
        key: key.toUpperCase(),
        icon: icon || undefined,
        issue_types: typesArray,
      });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string, errors?: Record<string, string[]> }>;
      if (axiosError.response?.data?.errors) {
        const firstError = Object.values(axiosError.response.data.errors)[0][0];
        setError(firstError);
      } else {
        setError(axiosError.response?.data?.message || t('projects.create.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <motion.button 
          whileHover={{ x: -4 }}
          onClick={() => router.back()} 
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('projects.create.heading')}</h1>
          <p className="text-foreground/60 text-sm mt-1">{t('projects.create.subtitle')}</p>
        </div>
      </div>

      <GlassCard className="p-10">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <Folder size={16} className="text-brand-primary" />
                {t('projects.create.nameLabel')}
              </label>
              <input
                type="text"
                required
                placeholder={t('projects.create.namePlaceholder')}
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onInvalid={(e) => setFieldValidityMessage(e.currentTarget, 'text')}
                onInput={(e) => e.currentTarget.setCustomValidity('')}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <Key size={16} className="text-brand-primary" />
                {t('projects.create.keyLabel')}
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={10}
                pattern="[A-Za-z]+"
                placeholder={t('projects.create.keyPlaceholder')}
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium uppercase"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                onInvalid={(e) => setFieldValidityMessage(e.currentTarget, 'key')}
                onInput={(e) => e.currentTarget.setCustomValidity('')}
              />
              <p className="text-[10px] text-foreground/40 font-medium ml-1">{t('projects.create.keyHint')}</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <ImageIcon size={16} className="text-brand-primary" />
                {t('projects.create.iconLabel')}
              </label>
              <input
                type="url"
                placeholder={t('projects.create.iconPlaceholder')}
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                onInvalid={(e) => setFieldValidityMessage(e.currentTarget, 'url')}
                onInput={(e) => e.currentTarget.setCustomValidity('')}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <ListChecks size={16} className="text-brand-primary" />
                {t('projects.create.typesLabel')}
              </label>
              <input
                type="text"
                required
                placeholder={t('projects.create.typesPlaceholder')}
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                value={issueTypes}
                onChange={(e) => setIssueTypes(e.target.value)}
                onInvalid={(e) => setFieldValidityMessage(e.currentTarget, 'text')}
                onInput={(e) => e.currentTarget.setCustomValidity('')}
              />
              <p className="text-[10px] text-foreground/40 font-medium ml-1">{t('projects.create.typesHint')}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-glow flex justify-end gap-4">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="px-8"
            >
              {t('common.cancel')}
            </GlassButton>
            <GlassButton
              type="submit"
              disabled={loading}
              className="px-10"
            >
              {loading ? t('projects.create.submitting') : t('projects.create.title')}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
