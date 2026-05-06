'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProjectList from '@/components/projects/ProjectList';
import { GlassButton } from '@/components/ui/GlassButton';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { BASE_SPRING } from '@/lib/animations';

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) return null;

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {user.name.split(' ')[0]}</h1>
                    <p className="text-foreground/55">Here&apos;s what&apos;s happening with your projects today.</p>
                </div>
                
                <GlassButton
                    onClick={() => router.push('/projects/new')}
                >
                    <Plus size={18} />
                    Create New Project
                </GlassButton>
            </div>
            
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4">Your Projects</h2>
                <ProjectList />
            </div>
        </div>
    );
}
