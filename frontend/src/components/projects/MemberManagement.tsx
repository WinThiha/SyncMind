'use client';

import { useState, useEffect } from 'react';
import {
  getProjectMembers,
  removeProjectMember,
  updateProjectMember,
  getProjectInvitations,
  cancelProjectInvitation,
  ProjectMember,
  ProjectInvitation,
  addProjectMember,
} from '@/lib/api/projects';
import { AxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from '@/context/LocaleContext';
import { confirmAction } from '@/lib/alert';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Users, Mail, Shield, UserMinus, UserPlus, ShieldAlert, Clock, X, CheckCircle, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MemberManagementProps {
  projectId: number;
  creatorId: number;
  userRole: string;
}

export default function MemberManagement({ projectId, creatorId, userRole }: MemberManagementProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('normal');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editingCreatorPositionId, setEditingCreatorPositionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLocale();

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    async function loadData() {
      try {
        const membersData = await getProjectMembers(projectId);
        setMembers(membersData);
        if (isAdmin) {
          const invitesData = await getProjectInvitations(projectId);
          setInvitations(invitesData);
        }
      } catch {
        setError(t('projects.members.loadError'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [projectId, isAdmin]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await addProjectMember(projectId, {
        email,
        role,
        position: position.trim() || null,
      });
      if (result.type === 'invited') {
        setInvitations(prev => [...prev, result.data]);
        setSuccessMessage(t('projects.members.inviteSent', { email }));
      } else {
        const data = await getProjectMembers(projectId);
        setMembers(data);
        setSuccessMessage(t('projects.members.addedSuccess', { name: result.data?.name || email }));
      }
      setEmail('');
      setPosition('');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || t('projects.members.addError'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    const ok = await confirmAction({
      title: t('common.areYouSure'),
      text: t('projects.members.confirmRemove'),
      confirmText: t('common.yesRemove'),
      cancelText: t('common.cancel'),
      danger: true,
    });
    if (!ok) return;
    setError(null);
    try {
      await removeProjectMember(projectId, userId);
      setMembers(members.filter(m => m.id !== userId));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || t('projects.members.removeError'));
    }
  };

  const handleUpdateMember = async (userId: number, updates: { role: string; position?: string | null }) => {
    setUpdatingId(userId);
    setError(null);
    try {
      await updateProjectMember(projectId, userId, updates);
      setMembers(members.map(member => {
        if (member.id !== userId) return member;

        return {
          ...member,
          pivot: {
            role: updates.role,
            position: updates.position ?? null,
          },
        };
      }));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || t('projects.members.updateError'));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelInvitation = async (invitationId: number) => {
    setError(null);
    try {
      await cancelProjectInvitation(projectId, invitationId);
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || t('projects.members.cancelInviteError'));
    }
  };

  if (loading) return null;

  return (
    <GlassCard className="p-5 sm:p-8">
      <div className="flex items-center gap-2 mb-6 sm:mb-8 text-brand-primary">
        <Users size={20} />
        <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest">{t('projects.members.title')}</h2>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2"
          >
            <CheckCircle size={16} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="space-y-3 mb-6 sm:mb-8">
        {members.map(member => {
          const mRole = member.pivot?.role || 'Member';
          const mPosition = member.pivot?.position ?? '';
          const isCreatorMember = member.id === creatorId;
          const canManageRole = isAdmin && member.id !== user?.id && mRole !== 'creator';
          const canManagePosition = isAdmin;
          const canEditCreatorPosition = canManagePosition && isCreatorMember;
          const isPositionEditable = canManagePosition && (!isCreatorMember || editingCreatorPositionId === member.id);

          return (
            <li
              key={member.id}
              className="p-3 sm:p-4 bg-foreground/5 rounded-2xl border border-border-glow/30 flex flex-wrap justify-between items-center gap-3 group transition-all hover:bg-foreground/[0.07]"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold text-sm shrink-0">
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate text-sm">{member.name}</p>
                  <p className="text-xs text-foreground/40 font-medium truncate">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {canManageRole ? (
                  <div className="relative">
                    <select
                      className="appearance-none bg-background border border-border-glow rounded-xl px-4 py-1.5 pr-8 text-[10px] font-black outline-none cursor-pointer hover:border-brand-primary/30 transition-colors"
                      value={mRole}
                      disabled={updatingId === member.id}
                      onChange={(e) => handleUpdateMember(member.id, {
                        role: e.target.value,
                        position: mPosition || null,
                      })}
                    >
                      <option value="normal">{t('projects.members.roleNormal')}</option>
                      <option value="admin">{t('projects.members.roleAdmin')}</option>
                    </select>
                    <Shield size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                  </div>
                ) : (
                  <span className={`text-[10px] px-3 py-1 rounded-lg font-bold uppercase tracking-wider ${
                    mRole === 'creator' ? 'bg-brand-primary/10 text-brand-primary' : 'bg-foreground/10 text-foreground/60'
                  }`}>
                    {mRole}
                  </span>
                )}

                {canManagePosition ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder={t('projects.members.positionFieldPlaceholder')}
                      className="bg-background border border-border-glow rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none w-36"
                      defaultValue={mPosition}
                      readOnly={!isPositionEditable}
                      disabled={updatingId === member.id || (isCreatorMember && editingCreatorPositionId !== member.id)}
                      onBlur={(e) => {
                        if (!isPositionEditable) return;
                        const nextPosition = e.target.value.trim();
                        if (nextPosition !== mPosition) {
                          void handleUpdateMember(member.id, {
                            role: mRole,
                            position: nextPosition || null,
                          });
                        }
                        if (isCreatorMember) {
                          setEditingCreatorPositionId(null);
                        }
                      }}
                    />
                    {canEditCreatorPosition && editingCreatorPositionId !== member.id && (
                      <button
                        type="button"
                        onClick={() => setEditingCreatorPositionId(member.id)}
                        className="p-1.5 text-foreground/40 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all"
                        title={t('projects.members.editCreatorTitle')}
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                    {mPosition || t('projects.members.noPosition')}
                  </span>
                )}

                {canManageRole && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title={t('projects.members.removeTitle')}
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {isAdmin && invitations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 text-foreground/40 mb-4">
            <Clock size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">{t('projects.members.pendingTitle')}</h3>
          </div>
          <ul className="space-y-3">
            {invitations.map(inv => (
              <li
                key={inv.id}
                className="p-3 bg-foreground/3 rounded-xl border border-border-glow/20 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-foreground/5 rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={14} className="text-foreground/30" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate text-foreground/70">{inv.email}</p>
                    <p className="text-[10px] text-foreground/30 font-medium">
                      {t('invitations.invite.fieldExpires')} {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    {inv.role}
                  </span>
                  {inv.position && (
                    <span className="text-[10px] px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                      {inv.position}
                    </span>
                  )}
                  <button
                    onClick={() => handleCancelInvitation(inv.id)}
                    className="p-1.5 text-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    title={t('projects.members.cancelTitle')}
                  >
                    <X size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isAdmin && (
        <form onSubmit={handleAddMember} className="space-y-6 pt-8 border-t border-border-glow/50">
          <div className="flex items-center gap-2 text-foreground/40 mb-4">
            <UserPlus size={16} />
            <h3 className="text-xs font-bold uppercase tracking-widest">{t('projects.members.addTitle')}</h3>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" />
              <input
                type="email"
                placeholder={t('projects.members.emailPlaceholder')}
                required
                className="w-full bg-foreground/5 border border-border-glow rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-brand-primary/10 transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <select
                  className="w-full h-full appearance-none bg-background text-foreground border border-border-glow rounded-xl px-4 pr-10 py-3 text-xs font-black outline-none cursor-pointer hover:bg-foreground/10 transition-colors"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="normal" className="bg-background text-foreground">{t('projects.members.roleOptionNormal')}</option>
                  <option value="admin" className="bg-background text-foreground">{t('projects.members.roleOptionAdmin')}</option>
                </select>
                <ShieldAlert size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
              </div>

              <input
                type="text"
                placeholder={t('projects.members.positionPlaceholder')}
                className="bg-foreground/5 border border-border-glow rounded-xl px-4 py-3 text-xs font-bold outline-none min-w-[200px] flex-1"
                value={position}
                onChange={e => setPosition(e.target.value)}
              />

              <GlassButton type="submit" disabled={adding} className="px-10">
                {adding ? t('projects.members.sending') : t('projects.members.addButton')}
              </GlassButton>
            </div>
          </div>
        </form>
      )}
    </GlassCard>
  );
}
