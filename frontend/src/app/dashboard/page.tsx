'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProjectList from '@/components/projects/ProjectList';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { BASE_SPRING } from '@/lib/animations';
import { useLocale } from '@/context/LocaleContext';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useLocale();

    if (!user) return null;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl mb-1">{t('dashboard.welcome', { name: user.name.split(' ')[0] })}</h1>
                    <p className="text-foreground/55 text-sm sm:text-base">{t('dashboard.subtitle')}</p>
                </div>

                <GlassButton
                    onClick={() => router.push('/projects/new')}
                    className="self-start sm:self-auto shrink-0"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">{t('dashboard.createProject')}</span>
                    <span className="sm:hidden">{t('dashboard.newProject')}</span>
                </GlassButton>
            </div>
            
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">{t('dashboard.yourProjects')}</h2>
                <ProjectList />
            </div>
        </div>
    );
}
