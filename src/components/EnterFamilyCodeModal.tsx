import React, { useState } from 'react';
import { X, Key, Check, AlertCircle, HeartHandshake, Sparkles, ArrowRight } from 'lucide-react';
import { Child, FamilyShare } from '../types';
import { dbAcceptFamilyShareByCode } from '../services/supabase';

interface EnterFamilyCodeModalProps {
  currentUser: { id: string; email: string; name?: string };
  onClose: () => void;
  onSuccess: (share: FamilyShare) => void;
}

export const EnterFamilyCodeModal: React.FC<EnterFamilyCodeModalProps> = ({
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await dbAcceptFamilyShareByCode(cleanCode, currentUser);

    setIsSubmitting(false);

    if (result.success && result.share) {
      onSuccess(result.share);
      onClose();
    } else {
      setErrorMessage(
        result.error ||
          'Código familiar não encontrado. Verifique com o pai ou responsável que enviou o código.'
      );
    }
  };

  return (
    <div
      id="enter-family-code-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="enter-family-code-modal-card"
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 text-white p-5 relative">
          <button
            id="close-enter-family-code-modal"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                Vincular à Família
              </span>
              <h2 className="text-lg font-black text-white">
                Código Familiar
              </h2>
            </div>
          </div>
          <p className="text-xs text-blue-100 mt-2 font-medium">
            Digite o código de acesso que o pai ou responsável compartilhou com você para ver todas as informações do bebê.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium text-xs leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Código de Acesso Familiar (ex: LUCAS-8X4)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="input-family-invite-code"
                type="text"
                required
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="LUCAS-..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:outline-none text-blue-900 font-mono text-base font-black tracking-wider uppercase placeholder:text-slate-300 placeholder:font-normal"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              O que acontece ao vincular?
            </span>
            <p className="text-[11px] leading-relaxed">
              O prontuário da criança será adicionado à sua conta com todas as consultas, exames, vacinas e receitas já cadastradas.
            </p>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              id="button-cancel-family-code"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              id="button-submit-family-code"
              type="submit"
              disabled={isSubmitting || !code.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Vinculando...' : 'Vincular'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
