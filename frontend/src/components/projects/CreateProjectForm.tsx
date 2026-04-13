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

export default function CreateProjectForm() {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [icon, setIcon] = useState('');
  const [issueTypes, setIssueTypes] = useState('Task, Bug, Story');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        setError(axiosError.response?.data?.message || 'Failed to create project.');
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
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-foreground/60 text-sm mt-1">Define your workspace and start tracking issues.</p>
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
                Project Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SyncMind Pro"
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <Key size={16} className="text-brand-primary" />
                Project Key
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={10}
                pattern="[A-Za-z]+"
                placeholder="e.g. SYNC"
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium uppercase"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <p className="text-[10px] text-foreground/40 font-medium ml-1">2-10 letters, used as issue prefix.</p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <ImageIcon size={16} className="text-brand-primary" />
                Icon URL (Optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground/60 uppercase tracking-wider ml-1">
                <ListChecks size={16} className="text-brand-primary" />
                Issue Types
              </label>
              <input
                type="text"
                required
                placeholder="Task, Bug, Story"
                className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-medium"
                value={issueTypes}
                onChange={(e) => setIssueTypes(e.target.value)}
              />
              <p className="text-[10px] text-foreground/40 font-medium ml-1">Comma separated list of types.</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-glow flex justify-end gap-4">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="px-8"
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              disabled={loading}
              className="px-10"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
