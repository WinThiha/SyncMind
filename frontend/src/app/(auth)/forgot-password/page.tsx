'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { AppLogo } from '@/components/ui/AppLogo';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/forgot-password', { email });
            setSent(true);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(axiosError.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
                <AppLogo size="lg" />
                <p className="text-foreground/40 font-medium mt-3">Reset your password.</p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <GlassCard className="p-10 shadow-2xl border-border-glow/50">
                    {sent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={28} className="text-green-500" />
                            </div>
                            <h2 className="text-xl font-black mb-3">Check your inbox</h2>
                            <p className="text-foreground/50 text-sm font-medium mb-8">
                                If <strong className="text-foreground/70">{email}</strong> is registered,
                                you&apos;ll receive a reset link within a few minutes.
                            </p>
                            <Link
                                href="/login"
                                className="text-brand-primary text-sm font-bold underline underline-offset-4"
                            >
                                Back to login
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-black text-center mb-2 tracking-tight">Forgot password?</h2>
                            <p className="text-center text-foreground/40 text-sm font-medium mb-8">
                                Enter your email and we&apos;ll send a reset link.
                            </p>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                                        <Mail size={14} className="text-brand-primary" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium"
                                    />
                                </div>

                                <GlassButton type="submit" disabled={loading} className="w-full py-4">
                                    <Mail size={18} />
                                    {loading ? 'SENDING...' : 'SEND RESET LINK'}
                                </GlassButton>
                            </form>
                        </>
                    )}
                </GlassCard>

                {!sent && (
                    <div className="mt-8 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-sm font-bold text-foreground/40 hover:text-foreground transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Back to login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
