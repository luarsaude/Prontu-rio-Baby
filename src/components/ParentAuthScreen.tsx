import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  X,
  Check,
} from 'lucide-react';
import { MascotBear } from './MascotIcons';
import {
  supabaseAuthSignIn,
  supabaseAuthSignUp,
  supabaseAuthSignInWithGoogle,
  supabaseAuthResetPassword,
} from '../services/supabase';
import { ParentUser } from '../types';

interface ParentAuthScreenProps {
  onAuthSuccess: (user: ParentUser) => void;
  onOpenAdminLogin: () => void;
}

export const ParentAuthScreen: React.FC<ParentAuthScreenProps> = ({
  onAuthSuccess,
  onOpenAdminLogin,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States for submission
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Reset Modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Secret tap counter for mascot (5 taps triggers admin login)
  const [secretTaps, setSecretTaps] = useState(0);

  const handleMascotTap = () => {
    const next = secretTaps + 1;
    if (next >= 5) {
      setSecretTaps(0);
      onOpenAdminLogin();
    } else {
      setSecretTaps(next);
      setTimeout(() => setSecretTaps(0), 3000);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setGoogleLoading(true);
    try {
      const result = await supabaseAuthSignInWithGoogle();
      if (result.error) {
        if (result.notEnabled) {
          setErrorMessage(
            'O login com Google está em fase de ativação. Por favor, utilize seu e-mail e senha para entrar.'
          );
        } else {
          setErrorMessage(`Falha no login com Google: ${result.error}`);
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Erro ao conectar com Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Email / Password Authentication
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha.');
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe o seu nome.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem. Digite novamente.');
        return;
      }

      setLoading(true);
      const { user, error } = await supabaseAuthSignUp(cleanEmail, password, name);
      setLoading(false);

      if (error) {
        if (error.includes('already registered')) {
          setErrorMessage('Este e-mail já está cadastrado. Tente entrar ou recuperar sua senha.');
        } else {
          setErrorMessage(error);
        }
        return;
      }

      if (user) {
        // If confirmation email not required or session active
        const parent: ParentUser = {
          id: user.id,
          email: user.email || cleanEmail,
          name: name.trim() || user.user_metadata?.name || 'Responsável',
          role: 'parent',
        };
        onAuthSuccess(parent);
      } else {
        setSuccessMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
      }
    } else {
      // Login
      setLoading(true);
      const { user, error } = await supabaseAuthSignIn(cleanEmail, password);
      setLoading(false);

      if (error) {
        if (error.includes('Invalid login credentials')) {
          setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else if (error.includes('Email not confirmed')) {
          setErrorMessage('E-mail ainda não confirmado. Verifique a caixa de entrada do seu e-mail.');
        } else {
          setErrorMessage(error);
        }
        return;
      }

      if (user) {
        const parent: ParentUser = {
          id: user.id,
          email: user.email || cleanEmail,
          name: user.user_metadata?.name || user.user_metadata?.full_name || cleanEmail.split('@')[0] || 'Responsável',
          role: 'parent',
        };
        onAuthSuccess(parent);
      }
    }
  };

  // Password Reset Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(false);

    const clean = resetEmail.trim();
    if (!clean) {
      setResetError('Por favor, digite seu e-mail de cadastro.');
      return;
    }

    setResetLoading(true);
    const { error } = await supabaseAuthResetPassword(clean);
    setResetLoading(false);

    if (error) {
      setResetError(error);
    } else {
      setResetSuccess(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-linear-to-b from-[#EBF5FF] via-[#F4F9FF] to-white p-5 overflow-y-auto no-scrollbar justify-between relative">
      {/* Decorative stars */}
      <div className="absolute top-4 left-6 text-amber-300 pointer-events-none opacity-80">
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
      <div className="absolute top-12 right-6 text-blue-200 pointer-events-none">
        <Sparkles className="w-4 h-4 text-sky-400" />
      </div>

      <div className="pt-2">
        {/* Mascot & Title */}
        <div className="flex flex-col items-center text-center mb-4">
          <div
            onClick={handleMascotTap}
            className="cursor-pointer select-none relative transform transition-transform active:scale-95"
            title="Toque no urso para interagir"
          >
            <MascotBear size={90} />
            {secretTaps > 1 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-white rounded-full text-xs font-black flex items-center justify-center animate-ping">
                {5 - secretTaps}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-amber-400 text-base">✦</span>
            <h1 className="text-2xl sm:text-[26px] font-black text-blue-600 tracking-tight">
              Meu Prontuário Infantil
            </h1>
            <span className="text-amber-400 text-base">✦</span>
          </div>
          <p className="text-sm sm:text-base text-slate-500 font-bold mt-1">
            Área dos Pais e Responsáveis
          </p>
        </div>

        {/* Tab Switcher: Entrar / Cadastrar */}
        <div className="flex bg-slate-200/70 p-1.5 rounded-2xl mb-4 w-full max-w-[360px] mx-auto text-sm sm:text-base font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Google OAuth Login Button */}
        <div className="w-full max-w-[360px] mx-auto mb-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-sm sm:text-base shadow-xs flex items-center justify-center gap-3 transition cursor-pointer disabled:opacity-60"
          >
            {googleLoading ? (
              <span className="text-sm text-slate-500">Conectando ao Google...</span>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com o Google</span>
              </>
            )}
          </button>

          <div className="flex items-center my-3.5">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-xs uppercase font-bold text-slate-400 tracking-wider">
              ou com e-mail
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="w-full max-w-[360px] mx-auto mb-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="w-full max-w-[360px] mx-auto mb-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-[360px] mx-auto space-y-3.5">
          {authMode === 'signup' && (
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-700 mb-1.5">
                Nome do Responsável
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mariana Silva"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base placeholder:text-slate-400 placeholder:text-sm outline-hidden transition shadow-2xs pr-11"
                  required
                />
                <User className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 sm:top-4 pointer-events-none" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm sm:text-base font-bold text-slate-700 mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base placeholder:text-slate-400 placeholder:text-sm outline-hidden transition shadow-2xs pr-11"
                required
              />
              <Mail className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 sm:top-4 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm sm:text-base font-bold text-slate-700">
                Senha
              </label>
              {authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetError(null);
                    setResetSuccess(false);
                    setShowResetModal(true);
                  }}
                  className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={authMode === 'signup' ? 'Mínimo de 6 caracteres' : 'Sua senha segura'}
                className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base placeholder:text-slate-400 placeholder:text-sm outline-hidden transition shadow-2xs pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 sm:top-3.5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {authMode === 'signup' && (
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-700 mb-1.5">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 rounded-xl px-4 py-3 sm:py-3.5 text-sm sm:text-base placeholder:text-slate-400 placeholder:text-sm outline-hidden transition shadow-2xs pr-11"
                  required
                />
                <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 sm:top-4 pointer-events-none" />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base sm:text-lg shadow-md shadow-blue-500/25 flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="text-base">Aguarde...</span>
              ) : authMode === 'login' ? (
                <>
                  <span>Entrar no Prontuário</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <span>Cadastrar Responsável</span>
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Discreet Footer with Secret Admin Entrance */}
      <div className="pt-6 pb-2 text-center border-t border-slate-200/60 mt-4">
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Prontuário Infantil Seguro • Dados em Tempo Real no Supabase
        </p>
        <p className="text-[11px] text-blue-600 font-semibold mt-1">
          Recebeu convite familiar? Entre com sua conta Google ou crie seu acesso para sincronizar o prontuário.
        </p>

        {/* Discreet secret admin login button */}
        <button
          onClick={onOpenAdminLogin}
          type="button"
          className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
          title="Acesso Secreto do Administrador"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Acesso do Administrador</span>
        </button>
      </div>

      {/* Password Recovery Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-800">
                Recuperar Senha
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Informe o seu e-mail de cadastro. Enviaremos um link seguro para redefinir sua senha.
              </p>
            </div>

            {resetError && (
              <div className="mb-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <span className="font-medium">{resetError}</span>
              </div>
            )}

            {resetSuccess ? (
              <div className="text-center py-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-emerald-800 mb-1">
                  E-mail de Recuperação Enviado!
                </h4>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                  Confira a sua caixa de entrada (e a pasta de spam) para o link de redefinição de senha.
                </p>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base cursor-pointer"
                >
                  Voltar para o Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    E-mail Cadastrado
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 rounded-xl px-4 py-3 text-sm sm:text-base outline-hidden transition shadow-2xs"
                    required
                    autoFocus
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {resetLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
