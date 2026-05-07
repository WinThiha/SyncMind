'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { AppLogo } from '@/components/ui/AppLogo';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const verifyUrl = searchParams.get('verify_url');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    useEffect(() => {
        if (!verifyUrl) {
            setStatus('error');
            setMessage('Invalid verification link. Please request a new one.');
            return;
        }

        const verify = async () => {
            try {
                const response = await api.get(verifyUrl);
                await refreshUser();
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                setTimeout(() => router.push('/dashboard'), 3000);
            } catch (err: unknown) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setStatus('error');
                setMessage(
                    axiosError.response?.data?.message ||
                    'Verification failed. The link may have expired.',
                );
            }
        };

        verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [verifyUrl]);

    const handleResend = async () => {
        setResending(true);
        try {
            await api.post('/api/auth/email/verification-notification');
            setResent(true);
        } catch {
            // ignore — user may not be authenticated; they can log in and retry
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
                <AppLogo size="lg" />
                <p className="text-foreground/40 font-medium mt-3">Email Verification</p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <GlassCard className="p-10 text-center">
                    {status === 'loading' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center">
                                <Loader2 size={28} className="text-brand-primary animate-spin" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black mb-2">Verifying...</h2>
                                <p className="text-foreground/50 text-sm font-medium">{message}</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
                                <CheckCircle size={28} className="text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black mb-2">Email verified!</h2>
                                <p className="text-foreground/50 text-sm font-medium mb-1">{message}</p>
                                <p className="text-foreground/35 text-xs font-medium">Redirecting you to dashboard...</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center gap-5"
                        >
                            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                <XCircle size={28} className="text-red-500" />
                            </div>

                            <div>
                                <h2 className="text-xl font-black mb-2">Verification failed</h2>
                                <p className="text-foreground/50 text-sm font-medium mb-1">
                                    This link is invalid or has expired.
                                </p>
                                <p className="text-foreground/35 text-xs">
                                    Request a new verification email below.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                {/* Resend button — only shown when the user is logged in */}
                                {user && !resent && (
                                    <button
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
                                        {resending ? 'Sending...' : 'Resend verification email'}
                                    </button>
                                )}

                                {resent && (
                                    <div className="w-full py-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                                        <CheckCircle size={16} />
                                        New link sent — check your inbox
                                    </div>
                                )}

                                {!user && (
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-brand-primary/90 transition-colors"
                                    >
                                        Log in to resend
                                    </button>
                                )}

                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full py-3 bg-foreground/5 text-foreground/60 rounded-xl font-bold text-sm hover:bg-foreground/10 transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground/30 font-bold animate-pulse uppercase tracking-widest text-sm">Loading...</div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
