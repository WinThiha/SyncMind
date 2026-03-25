'use client';

import { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Mail, Lock, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginForm() {
    const router = useRouter();
    const { refreshUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage('');

        try {
            await api.get('/sanctum/csrf-cookie');
            const response = await api.post('/api/auth/login', { email, password, remember });
            await refreshUser();
            setMessage(response.data.message);
            router.push('/dashboard');
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setMessage('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-10 shadow-2xl border-border-glow/50">
            <h2 className="text-2xl font-black text-center mb-8 tracking-tight">Login to your account</h2>

            <GoogleLoginButton />

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border-glow"></div>
                </div>
                <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                    <span className="px-4 bg-background text-foreground/30">Or email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl text-sm font-bold border ${message.includes('error') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}
                    >
                        {message}
                    </motion.div>
                )}

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
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email[0]}</p>}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                        <Lock size={14} className="text-brand-primary" />
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium"
                    />
                    {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.password[0]}</p>}
                </div>

                <div className="flex items-center ml-1">
                    <input
                        id="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 text-brand-primary border-border-glow rounded transition-colors bg-foreground/5"
                    />
                    <label htmlFor="remember" className="ml-2 block text-xs font-bold text-foreground/40 uppercase tracking-wider cursor-pointer">
                        Keep me logged in
                    </label>
                </div>

                <GlassButton
                    type="submit"
                    disabled={loading}
                    className="w-full py-4"
                >
                    <LogIn size={18} />
                    {loading ? 'AUTHENTICATING...' : 'LOG IN'}
                </GlassButton>
            </form>
        </GlassCard>
    );
}
