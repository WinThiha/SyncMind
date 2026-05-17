'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, FileText } from 'lucide-react';
import { WikiPageSummary } from '@/lib/api/wiki';
import { useLocale } from '@/context/LocaleContext';

interface WikiPageListProps {
  pages: WikiPageSummary[];
  projectId: string;
  isAdmin: boolean;
}

export function WikiPageList({ pages, projectId, isAdmin }: WikiPageListProps) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-glow">
        <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('wiki.list.pages')}</span>
        {isAdmin && (
          <Link
            href={`/projects/${projectId}/wiki/new`}
            className="flex items-center gap-1 text-xs text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            <Plus size={12} />
            {t('wiki.list.new')}
          </Link>
        )}
      </div>

      <nav className="overflow-y-auto py-2 max-h-[220px] lg:max-h-none">
        {pages.length === 0 ? (
          <p className="px-3 py-2 text-xs text-foreground/40 italic">{t('wiki.list.noPagesYet')}</p>
        ) : (
          pages.map((page) => {
            const href = `/projects/${projectId}/wiki/${page.id}`;
            const isActive = pathname === href;

            return (
              <Link
                key={page.id}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg mx-1 transition-colors ${
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary font-medium'
                    : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'
                }`}
              >
                <FileText size={13} className="shrink-0 opacity-60" />
                <span className="truncate">{page.title}</span>
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
}
