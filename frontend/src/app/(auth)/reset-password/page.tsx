'use client';

import { useState, Suspense } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { AppLogo } from '@/components/ui/AppLogo';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Lock, CheckCircle, ShieldAlert } from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const email = searchParams.get('email') ?? '';

    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [message, setMessage] = useState('');
    const { t } = useLocale();

    if (!token || !email) {
        return (
            <GlassCard className="p-10 text-center">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert size={28} className="text-red-500" />
                </div>
                <h2 className="text-xl font-black mb-3">{t('auth.resetPassword.invalidTitle')}</h2>
                <p className="text-foreground/50 text-sm font-medium mb-8">
                    {t('auth.resetPassword.invalidDescription')}
                </p>
                <Link href="/forgot-password" className="text-brand-primary text-sm font-bold underline underline-offset-4">
                    {t('auth.resetPassword.requestNew')}
                </Link>
            </GlassCard>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage('');
        try {
            await api.post('/api/auth/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            setSuccess(true);
            setTimeout(() => router.push('/login'), 2500);
        } catch (err: unknown) {
            const axiosError = err as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } } };
            if (axiosError.response?.status === 422) {
                setErrors(axiosError.response.data?.errors ?? {});
                setMessage(axiosError.response.data?.message ?? '');
            } else {
                setMessage(t('auth.resetPassword.errorFallback'));
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <GlassCard className="p-10 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
                >
                    <CheckCircle size={28} className="text-green-500" />
                </motion.div>
                <h2 className="text-xl font-black mb-2">{t('auth.resetPassword.successTitle')}</h2>
                <p className="text-foreground/50 text-sm font-medium">{t('auth.resetPassword.successDescription')}</p>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-10 shadow-2xl border-border-glow/50">
            <h2 className="text-2xl font-black text-center mb-2 tracking-tight">{t('auth.resetPassword.heading')}</h2>
            <p className="text-center text-foreground/40 text-sm font-medium mb-8">
                {t('auth.resetPassword.description').replace('{email}', email)}
            </p>

            {message && !Object.keys(errors).length && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium"
                >
                    {message}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                        <Lock size={14} className="text-brand-primary" />
                        {t('auth.resetPassword.newPasswordLabel')}
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder={t('auth.resetPassword.passwordPlaceholder')}
                        className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium"
                    />
                    {errors.password && (
                        <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.password[0]}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                        <Lock size={14} className="text-brand-primary" />
                        {t('auth.resetPassword.confirmPasswordLabel')}
                    </label>
                    <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                        placeholder={t('auth.resetPassword.passwordPlaceholder')}
                        className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium"
                    />
                </div>

                <GlassButton type="submit" disabled={loading} className="w-full py-4">
                    <Lock size={18} />
                    {loading ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submit')}
                </GlassButton>
            </form>
        </GlassCard>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
                <AppLogo size="lg" />
                <p className="text-foreground/40 font-medium mt-3">Create a new password.</p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <Suspense fallback={<div className="text-center p-10 bg-background/50 rounded-2xl animate-pulse font-bold text-foreground/30">LOADING...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
