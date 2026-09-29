import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Share2,
  Mail,
  ShieldCheck,
  Trash2,
  Heart,
  ExternalLink,
  MessageCircle,
  Key,
  UserCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Child, FamilyShare, FamilyRelationship } from '../types';
import {
  dbCreateFamilyShare,
  dbFetchFamilySharesForChild,
  dbDeleteFamilyShare,
} from '../services/supabase';

interface FamilyShareModalProps {
  child: Child;
  currentUser: { id: string; email: string; name?: string };
  onClose: () => void;
  onShareCreated?: (share: FamilyShare) => void;
}

export const FamilyShareModal: React.FC<FamilyShareModalProps> = ({
  child,
  currentUser,
  onClose,
  onShareCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'code' | 'members'>('invite');
  const [emailInput, setEmailInput] = useState('');
  const [relationship, setRelationship] = useState<FamilyRelationship>('Mãe');
  const [permission, setPermission] = useState<'full' | 'view'>('full');
  const [sharesList, setSharesList] = useState<FamilyShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeShare, setActiveShare] = useState<FamilyShare | null>(null);

  // Load existing shares for this child
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    dbFetchFamilySharesForChild(child.id).then((shares) => {
      if (!isMounted) return;
      setSharesList(shares);
      if (shares.length > 0) {
        setActiveShare(shares[0]);
      }
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, [child.id]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);

    const { data: newShare, error } = await dbCreateFamilyShare({
      childId: child.id,
      childName: child.name,
      ownerId: currentUser.id,
      ownerEmail: currentUser.email,
      ownerName: currentUser.name || currentUser.email,
      sharedWithEmail: emailInput.trim(),
      relationship,
      permission,
    });

    setIsSubmitting(false);

    if (newShare) {
      setSharesList((prev) => [newShare, ...prev.filter((s) => s.id !== newShare.id)]);
      setActiveShare(newShare);
      setEmailInput('');
      setSuccessMessage(
        `Convite criado com sucesso para ${newShare.sharedWithEmail}! Quando a conta Google fizer login, o prontuário de ${child.name} aparecerá automaticamente.`
      );
      if (onShareCreated) onShareCreated(newShare);
      setActiveTab('members');
    }
  };

  const handleCreateNewCode = async () => {
    setIsSubmitting(true);
    const { data: newShare } = await dbCreateFamilyShare({
      childId: child.id,
      childName: child.name,
      ownerId: currentUser.id,
      ownerEmail: currentUser.email,
      ownerName: currentUser.name || currentUser.email,
      relationship,
      permission: 'full',
    });
    setIsSubmitting(false);
    if (newShare) {
      setSharesList((prev) => [newShare, ...prev]);
      setActiveShare(newShare);
      if (onShareCreated) onShareCreated(newShare);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    if (confirm('Deseja realmente revogar este compartilhamento? O usuário não terá mais acesso a este prontuário.')) {
      await dbDeleteFamilyShare(shareId);
      setSharesList((prev) => prev.filter((s) => s.id !== shareId));
      if (activeShare?.id === shareId) {
        const remaining = sharesList.filter((s) => s.id !== shareId);
        setActiveShare(remaining.length > 0 ? remaining[0] : null);
      }
    }
  };

  // Determine current code to display
  const currentCode = activeShare?.inviteCode || `${child.name.split(' ')[0].toUpperCase()}-FAMILY`;

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Convidei você para acompanhar o prontuário de *${child.name}* no aplicativo Prontuário Baby 👶.\n\n` +
      `Para acessar todas as consultas, exames e receitas:\n` +
      `1. Acesse o aplicativo: ${window.location.origin}\n` +
      `2. Entre com sua conta Google ou clique em "Código Familiar"\n` +
      `3. Digite o código familiar: *${currentCode}*\n\n` +
      `Pronto! Você terá acesso completo aos mesmos registros em tempo real.`
  );

  return (
    <div
      id="family-share-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="family-share-modal-card"
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white p-5 sm:p-6 relative">
          <button
            id="close-family-share-modal-button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  Compartilhar Prontuário
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-400 text-emerald-950 text-[10px] font-black">
                  Família
                </span>
              </div>
              <h2 className="text-xl font-black text-white leading-tight">
                {child.name}
              </h2>
            </div>
          </div>

          <p className="text-xs text-blue-100 mt-2 font-medium">
            Permita que a mãe, pai ou outro cuidador veja e adicione consultas, exames e receitas no mesmo prontuário.
          </p>

          {/* Navigation Tabs */}
          <div className="flex bg-blue-900/30 p-1 rounded-2xl mt-4 text-xs font-bold">
            <button
              id="tab-invite-email"
              onClick={() => setActiveTab('invite')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'invite'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Por E-mail</span>
            </button>
            <button
              id="tab-invite-code"
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'code'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Código Familiar</span>
            </button>
            <button
              id="tab-members"
              onClick={() => setActiveTab('members')}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'members'
                  ? 'bg-white text-blue-950 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Membros ({sharesList.length + 1})</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* TAB 1: CONVIDAR POR E-MAIL GOOGLE */}
          {activeTab === 'invite' && (
            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 text-slate-700 text-xs leading-relaxed">
                <p className="font-bold text-sky-950 mb-1 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  Como funciona o compartilhamento:
                </p>
                Informe o e-mail Google que a mãe (ou familiar) usa para entrar. Assim que ela fizer login com essa conta, o prontuário de <span className="font-bold text-sky-900">{child.name}</span> aparecerá instantaneamente na tela dela!
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  E-mail Google do convidado (Mãe / Familiar) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-share-email"
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ex: mae@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Parentesco
                  </label>
                  <select
                    id="select-share-relationship"
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as FamilyRelationship)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs font-semibold bg-white"
                  >
                    <option value="Mãe">Mãe</option>
                    <option value="Pai">Pai</option>
                    <option value="Avó / Avô">Avó / Avô</option>
                    <option value="Cuidador(a) / Babá">Cuidador(a) / Babá</option>
                    <option value="Familiar">Familiar</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Nível de Acesso
                  </label>
                  <select
                    id="select-share-permission"
                    value={permission}
                    onChange={(e) => setPermission(e.target.value as 'full' | 'view')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs font-semibold bg-white"
                  >
                    <option value="full">Acesso Completo (Ver e Editar)</option>
                    <option value="view">Apenas Leitura (Somente Ver)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="button-submit-invite"
                  type="submit"
                  disabled={isSubmitting || !emailInput.trim()}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  <span>{isSubmitting ? 'Gerando convite...' : 'Enviar Convite e Liberar Acesso'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CÓDIGO FAMILIAR (PIN) */}
          {activeTab === 'code' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-xs">
                  <Key className="w-4 h-4 text-amber-600" />
                  Código Familiar Instantâneo
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  A mãe ou qualquer familiar pode entrar no aplicativo e digitar este código para ter acesso imediato a todas as informações de {child.name}.
                </p>
              </div>

              {/* Code Box */}
              <div className="bg-slate-50 border-2 border-dashed border-blue-300 rounded-3xl p-5 text-center space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 block">
                  Código de Acesso
                </span>
                <div className="font-mono text-3xl font-black tracking-wider text-blue-700 select-all">
                  {currentCode}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Válido para acesso sincronizado aos registros de {child.name}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  id="button-copy-family-code"
                  type="button"
                  onClick={() => copyToClipboard(currentCode, 'code')}
                  className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center justify-center gap-2"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>

                <a
                  id="link-share-whatsapp"
                  href={`https://wa.me/?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Enviar WhatsApp</span>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-center">
                <button
                  id="button-generate-new-code"
                  type="button"
                  onClick={handleCreateNewCode}
                  disabled={isSubmitting}
                  className="text-blue-600 hover:text-blue-800 text-xs font-bold underline transition"
                >
                  + Gerar novo código de acesso
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MEMBROS ATUAIS COM ACESSO */}
          {activeTab === 'members' && (
            <div className="space-y-3 text-xs">
              <div className="font-bold text-slate-700 text-xs mb-1 flex items-center justify-between">
                <span>Pessoas com acesso ao prontuário</span>
                <span className="text-slate-400 font-normal">
                  Total: {sharesList.length + 1}
                </span>
              </div>

              {/* Owner card */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                    P
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 text-xs">
                        {currentUser.email}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                        Proprietário
                      </span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      Criador do registro • Acesso Total
                    </span>
                  </div>
                </div>
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
              </div>

              {/* Shared members list */}
              {isLoading ? (
                <div className="py-6 text-center text-slate-400">
                  Carregando membros...
                </div>
              ) : sharesList.length === 0 ? (
                <div className="py-6 text-center space-y-2">
                  <p className="text-slate-500 font-medium">
                    Nenhum outro responsável conectado ainda.
                  </p>
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    + Convidar a Mãe ou outro responsável agora
                  </button>
                </div>
              ) : (
                sharesList.map((share) => (
                  <div
                    key={share.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                        {share.relationship ? share.relationship[0] : 'F'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {share.sharedWithEmail || `Código: ${share.inviteCode}`}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-bold">
                            {share.relationship}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {share.status === 'accepted' ? (
                              <span className="text-emerald-600 font-bold">
                                Conectado(a)
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">
                                Convite Pendente
                              </span>
                            )}
                          </span>
                          <span>•</span>
                          <span>
                            {share.permission === 'full'
                              ? 'Ver e Editar'
                              : 'Somente Leitura'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`button-revoke-share-${share.id}`}
                      onClick={() => handleDeleteShare(share.id)}
                      title="Revogar acesso"
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            id="button-close-family-share-modal"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
