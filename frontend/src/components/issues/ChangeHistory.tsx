'use client';

import { useLocale } from '@/context/LocaleContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { ArrowRight, History } from 'lucide-react';

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

interface HistoryEntry {
  id: number;
  field: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
  user: { name: string };
}

interface ChangeHistoryProps {
  history: HistoryEntry[];
}

function groupHistory(history: HistoryEntry[]) {
  const groups: Record<string, HistoryEntry[]> = {};
  history.forEach((entry) => {
    const d = new Date(entry.created_at);
    const key = `${entry.user.name}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}_${d.getHours()}:${d.getMinutes()}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return Object.values(groups).sort(
    (a, b) => new Date(b[0].created_at).getTime() - new Date(a[0].created_at).getTime(),
  );
}

function formatValue(field: string, value: string | null): string {
  if (!value) return t('issues.history.none');
  if (field === 'description' && value.length > 50) return t('issues.history.updated');
  return value;
}

function formatField(field: string): string {
  return field.replace(/_/g, ' ');
}

export default function ChangeHistory({ history }: ChangeHistoryProps) {
  const { t } = useLocale();
  if (!history || history.length === 0) return null;

  const groups = groupHistory(history);

  return (
    <GlassCard className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-brand-primary mb-5">
        <History size={15} />
        <h2 className="text-[10px] font-bold uppercase tracking-widest">
          {t('issues.history.title')}
          <span className="ml-1 text-foreground/30">({history.length})</span>
        </h2>
      </div>

      <div className="space-y-4">
        {groups.map((group, idx) => (
          <div key={idx} className="flex gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-foreground/8 border border-border-glow flex items-center justify-center shrink-0 font-bold text-xs text-foreground/50">
              {group[0].user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              {/* Meta */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-bold">{group[0].user.name}</span>
                <span
                  className="text-[10px] text-foreground/35"
                  title={new Date(group[0].created_at).toLocaleString()}
                >
                  {relativeTime(group[0].created_at)}
                </span>
              </div>

              {/* Changes */}
              <div className="bg-foreground/[0.03] border border-border-glow/40 rounded-xl p-3.5 space-y-2">
                {group.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-xs flex-wrap">
                    <span className="text-foreground/40 capitalize font-semibold shrink-0">
                      {formatField(entry.field)}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="line-through text-foreground/30">
                        {formatValue(entry.field, entry.old_value)}
                      </span>
                      <ArrowRight size={10} className="text-brand-primary/40 shrink-0" />
                      <span className="font-bold text-brand-primary">
                        {formatValue(entry.field, entry.new_value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
