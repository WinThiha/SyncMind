'use client';

import { useState } from 'react';
import { Project, updateProject, deleteProject, transferOwnership, getProjectMembers, ProjectMember } from '@/lib/api/projects';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Settings, Trash2, UserPlus, AlertTriangle, Save, FolderEdit, ListTree, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '@/context/LocaleContext';

interface ProjectSettingsProps {
  project: Project;
  onUpdate: (project: Project) => void;
  isOwner: boolean;
}

export default function ProjectSettings({ project, onUpdate, isOwner }: ProjectSettingsProps) {
  const { t } = useLocale();
  const [name, setName] = useState(project.name);
  const [issueTypes, setIssueTypes] = useState(project.issue_types.join(', '));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [transferUserId, setTransferUserId] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const typesArray = issueTypes.split(',').map((t) => t.trim()).filter((t) => t !== '');
      const updated = await updateProject(project.id, { 
        name,
        issue_types: typesArray,
      });
      onUpdate(updated);
      setError(null);
    } catch (err) {
      setError(t('projects.settings.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(t('projects.settings.confirmDelete'))) {
      try {
        await deleteProject(project.id);
        router.push('/dashboard');
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || t('projects.settings.deleteError'));
      }
    }
  };

  const loadMembers = async () => {
    if (members.length === 0) {
      try {
        const data = await getProjectMembers(project.id);
        setMembers(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTransfer = async () => {
    if (!transferUserId) return;
    if (confirm(t('projects.settings.confirmTransfer'))) {
      try {
        await transferOwnership(project.id, transferUserId);
        router.push('/dashboard');
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setTransferError(axiosError.response?.data?.message || t('projects.settings.transferError'));
      }
    }
  };

  return (
    <div className="space-y-8">
      <GlassCard className="p-8">
        <div className="flex items-center gap-2 mb-8 text-brand-primary">
          <Settings size={20} />
          <h2 className="text-xl font-bold uppercase tracking-widest">{t('projects.settings.title')}</h2>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">
                <FolderEdit size={14} />
                {t('projects.settings.nameLabel')}
              </label>
            <input
              type="text"
              required
              className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">
                <ListTree size={14} />
                {t('projects.settings.typesLabel')}
              </label>
            <input
              type="text"
              required
              className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
              value={issueTypes}
              onChange={(e) => setIssueTypes(e.target.value)}
            />
            <p className="text-[10px] text-foreground/30 font-medium ml-1">{t('projects.settings.typesHint')}</p>
          </div>

          <div className="pt-4 border-t border-border-glow/50 flex justify-end">
            <GlassButton
              type="submit"
              disabled={loading}
              className="px-8"
            >
              <Save size={16} />
              {loading ? t('projects.settings.saving') : t('projects.settings.saveChanges')}
            </GlassButton>
          </div>
        </form>
      </GlassCard>

      {isOwner && (
        <GlassCard className="p-8 border-red-500/20">
          <div className="flex items-center gap-2 mb-8 text-red-500">
            <AlertTriangle size={20} />
            <h2 className="text-xl font-bold uppercase tracking-widest">{t('projects.settings.dangerZone')}</h2>
          </div>
          
          <div className="space-y-10">
            <div className="p-6 bg-red-500/[0.02] border border-red-500/10 rounded-2xl space-y-6">
              <div>
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-1">
                    <UserPlus size={16} className="text-orange-500" />
                    {t('projects.settings.transferTitle')}
                  </h3>
                  <p className="text-xs text-foreground/40 font-medium">{t('projects.settings.transferDesc')}</p>
              </div>
              
              {transferError && <div className="text-red-500 text-xs font-bold">{transferError}</div>}
              
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <select
                    className="w-full h-full appearance-none bg-background border border-border-glow rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer hover:border-brand-primary/30 transition-colors"
                    value={transferUserId}
                    onFocus={loadMembers}
                    onChange={(e) => setTransferUserId(e.target.value)}
                  >
                    <option value="">{t('projects.settings.transferPlaceholder')}</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name.toUpperCase()} ({m.email})</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                </div>
                <GlassButton
                  onClick={handleTransfer}
                  disabled={!transferUserId}
                  className="bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
                >
                  {t('projects.settings.transferButton')}
                </GlassButton>
              </div>
            </div>

            <div className="p-6 bg-red-500/[0.02] border border-red-500/10 rounded-2xl flex items-center justify-between gap-6">
              <div>
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-1 text-red-500">
                    <Trash2 size={16} />
                    {t('projects.settings.delete')}
                  </h3>
                  <p className="text-xs text-foreground/40 font-medium">{t('projects.settings.deleteDesc')}</p>
              </div>
              <GlassButton
                onClick={handleDelete}
                variant="danger"
                className="px-6"
              >
                {t('projects.settings.deleteButton')}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
