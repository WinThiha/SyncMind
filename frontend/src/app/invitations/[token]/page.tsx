'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getInvitation, acceptInvitation, InvitationInfo } from '@/lib/api/invitations';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { useLocale } from '@/context/LocaleContext';
import { AxiosError } from 'axios';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ShieldAlert, LogIn, UserPlus } from 'lucide-react';

const INVITE_TOKEN_KEY = 'pendingInviteToken';

export default function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = React.use(params);
  const router = useRouter();
  const { t } = useLocale();
  const { user, loading: authLoading } = useAuth();

  const [invite, setInvite] = useState<InvitationInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchStatus, setFetchStatus] = useState<number | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function loadInvite() {
      try {
        const data = await getInvitation(token);
        setInvite(data);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setFetchStatus(axiosError.response?.status ?? 0);
        setFetchError(axiosError.response?.data?.message || t('invitations.invite.invalidLink'));
      }
    }
    loadInvite();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const result = await acceptInvitation(token);
      sessionStorage.removeItem(INVITE_TOKEN_KEY);
      setAccepted(true);
      setTimeout(() => router.push(`/projects/${result.project_id}`), 1500);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setFetchError(axiosError.response?.data?.message || t('invitations.action.acceptFailed'));
    } finally {
      setAccepting(false);
    }
  };

  const handleAuthRedirect = (path: 'login' | 'register') => {
    sessionStorage.setItem(INVITE_TOKEN_KEY, token);
    if (path === 'register') {
      router.push(`/register?invite=${token}`);
    } else {
      router.push(`/login?redirect=/invitations/${token}`);
    }
  };

  if (authLoading || (!invite && !fetchError)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground/30 font-bold animate-pulse uppercase tracking-widest text-sm">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
        <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-brand-primary/20">
          S
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">SyncMind</h1>
      </div>

      <div className="w-full sm:max-w-md">
        {/* Error states */}
        {fetchError && (
          <GlassCard className="p-10 text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-black mb-3">
              {fetchStatus === 410 ? t('invitations.error.expired') : t('invitations.error.invalid')}
            </h2>
            <p className="text-foreground/50 text-sm font-medium mb-8">{fetchError}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-brand-primary text-sm font-bold underline underline-offset-4"
            >
              {t('invitations.page.goToDashboard')}
            </button>
          </GlassCard>
        )}

        {/* Accepted success */}
        {accepted && (
          <GlassCard className="p-10 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={28} className="text-green-500" />
            </motion.div>
            <h2 className="text-xl font-black mb-2">{t('invitations.success.title')}</h2>
            <p className="text-foreground/50 text-sm font-medium">{t('invitations.success.description')}</p>
          </GlassCard>
        )}

        {/* Valid invite */}
        {invite && !accepted && (
          <GlassCard className="p-10">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserPlus size={28} className="text-brand-primary" />
              </div>
              <h2 className="text-2xl font-black mb-1">{t('invitations.invite.title')}</h2>
              <p className="text-foreground/50 text-sm font-medium">
                {invite.inviter_name ? (
                  <>{t('invitations.invite.invitedBy', { inviter: invite.inviter_name })}</>
                ) : (
                  <>{t('invitations.invite.invitedGeneric')}</>
                )}
              </p>
            </div>

            <div className="bg-foreground/5 rounded-2xl border border-border-glow/30 p-6 mb-8 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('invitations.invite.fieldProject')}</span>
                <span className="font-bold text-sm">{invite.project_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('invitations.invite.fieldRole')}</span>
                <span className="text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  {invite.role}
                </span>
              </div>
              {invite.position && (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('invitations.invite.fieldPosition')}</span>
                  <span className="text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider bg-foreground/10 text-foreground/60 border border-border-glow/30">
                    {invite.position}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-foreground/40 uppercase tracking-wider">{t('invitations.invite.fieldExpires')}</span>
                <span className="text-xs font-medium text-foreground/50 flex items-center gap-1.5">
                  <Clock size={12} />
                  {new Date(invite.expires_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            </div>

            {user ? (
              /* Authenticated — show accept button */
              <GlassButton
                onClick={handleAccept}
                disabled={accepting}
                className="w-full py-4"
              >
                <CheckCircle size={18} />
                {accepting ? t('invitations.action.accepting') : t('invitations.action.join', { project: invite.project_name.toUpperCase() })}
              </GlassButton>
            ) : (
              /* Unauthenticated — offer login / register */
              <div className="space-y-3">
                <p className="text-center text-xs text-foreground/40 font-medium uppercase tracking-wider mb-4">
                  {t('invitations.action.signInPrompt')}
                </p>
                <GlassButton onClick={() => handleAuthRedirect('login')} className="w-full py-4">
                  <LogIn size={18} />
                  {t('invitations.action.loginToAccept')}
                </GlassButton>
                <button
                  onClick={() => handleAuthRedirect('register')}
                  className="w-full py-3 border border-border-glow rounded-xl text-xs font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus size={16} />
                  {t('invitations.action.createAccount')}
                </button>
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
