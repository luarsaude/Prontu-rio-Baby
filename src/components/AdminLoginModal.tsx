import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { verifyAdminCredentials, DEFAULT_ADMIN_PASSCODE } from '../services/supabase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onAdminSuccess,
}) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cred = credential.trim();
    if (!cred) {
      setError('Por favor, informe a Chave Mestra ou Senha do Administrador.');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyAdminCredentials(cred, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onAdminSuccess();
        }, 500);
      } else {
        setError(result.message || 'Chave de segurança ou senha incorreta.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao validar credenciais do administrador.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center pt-2 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/40 mb-3 border border-emerald-400/30">
            <Shield className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <Key className="w-2.5 h-2.5" />
            <span>Área Restrita</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Login do Administrador
          </h2>
          <p className="text-xs text-slate-400 font-medium max-w-[260px] mt-1">
            Acesso exclusivo para configuração de infraestrutura e conexão do banco de dados Supabase.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-700/50 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Autenticado como Administrador! Abrindo conexão...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Chave Mestra ou E-mail Admin
            </label>
            <div className="relative">
              <input
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                placeholder={`Chave mestra (ex: ${DEFAULT_ADMIN_PASSCODE})`}
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl px-3.5 py-2.5 text-xs placeholder:text-slate-500 outline-hidden transition"
                autoFocus
                required
              />
              <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Senha Adicional (Opcional)
              </label>
              <span className="text-[10px] text-slate-400">se usar e-mail Supabase</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de administrador"
                className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl px-3.5 py-2.5 text-xs placeholder:text-slate-500 outline-hidden transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Validando acesso...</span>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  <span>Acessar Conexão Supabase</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security hint footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Chave mestra padrão: <code className="text-emerald-400 font-mono font-bold bg-slate-800 px-1 py-0.5 rounded">{DEFAULT_ADMIN_PASSCODE}</code>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Permite configurar a URL, Anon Key e rodar scripts SQL do Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};
