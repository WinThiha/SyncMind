'use client';

import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

function RegisterFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Social registration state
    const [isSocial, setIsSocial] = useState(false);
    const [socialProvider, setSocialProvider] = useState('');
    const [socialId, setSocialId] = useState('');

    useEffect(() => {
        const socialEmail = searchParams.get('social_email');
        const socialName = searchParams.get('social_name');
        const provider = searchParams.get('social_provider');
        const id = searchParams.get('social_id');
        const inviteToken = searchParams.get('invite');

        if (socialEmail) {
            setEmail(socialEmail);
            setName(socialName || '');
            setSocialProvider(provider || '');
            setSocialId(id || '');
            setIsSocial(true);
        }

        if (inviteToken) {
            sessionStorage.setItem('pendingInviteToken', inviteToken);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage('');

        try {
            await api.get('/sanctum/csrf-cookie');
            const payload: any = { name, email, password, password_confirmation: passwordConfirmation };
            if (isSocial) { payload.social_provider = socialProvider; payload.social_id = socialId; }
            const response = await api.post('/api/auth/register', payload);
            await refreshUser();
            setMessage(response.data.message);
            const pendingToken = sessionStorage.getItem('pendingInviteToken');
            router.push(pendingToken ? `/invitations/${pendingToken}` : '/dashboard');
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
            <h2 className="text-2xl font-black text-center mb-8 tracking-tight">
                {isSocial ? 'Complete Registration' : 'Create an account'}
            </h2>

            {!isSocial && (
                <>
                    <GoogleLoginButton />
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-glow"></div></div>
                        <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                            <span className="px-4 bg-background text-foreground/30">Or join with email</span>
                        </div>
                    </div>
                </>
            )}

            {isSocial && (
                <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-xl text-sm font-bold mb-8">
                    Almost there! We've got your info from Google. Just set a password to finish.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {message && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-sm font-bold border ${message.includes('error') ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                        {message}
                    </motion.div>
                )}

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                        <User size={14} className="text-brand-primary" />Full Name
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium" />
                    {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.name[0]}</p>}
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                        <Mail size={14} className="text-brand-primary" />Email Address
                    </label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={isSocial} disabled={isSocial} required placeholder="you@example.com" className={`w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none transition-all font-medium ${isSocial ? 'opacity-50 cursor-not-allowed' : 'focus:ring-4 focus:ring-brand-primary/10'}`} />
                    {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email[0]}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                            <Lock size={14} className="text-brand-primary" />Password
                        </label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium" />
                        {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.password[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                            <Lock size={14} className="text-brand-primary" />Confirm
                        </label>
                        <input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} required placeholder="••••••••" className="w-full bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all font-medium" />
                    </div>
                </div>

                <GlassButton type="submit" disabled={loading} className="w-full py-4 mt-4">
                    <UserPlus size={18} />{loading ? 'CREATING ACCOUNT...' : (isSocial ? 'FINISH REGISTRATION' : 'JOIN SYNCMIND')}
                </GlassButton>
                
                {isSocial && (
                    <button type="button" onClick={() => router.push('/register')} className="w-full text-center text-xs font-bold text-foreground/40 hover:text-foreground transition-colors mt-2 uppercase tracking-widest">
                        Cancel and use different email
                    </button>
                )}
            </form>
        </GlassCard>
    );
}

export default function RegisterForm() {
    return (
        <Suspense fallback={<div className="text-center p-10 bg-background/50 rounded-2xl animate-pulse font-bold text-foreground/30">LOADING FORM...</div>}>
            <RegisterFormContent />
        </Suspense>
    );
}
