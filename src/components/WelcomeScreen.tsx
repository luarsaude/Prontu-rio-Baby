import React, { useState } from 'react';
import { MascotBear } from './MascotIcons';
import { Sparkles, Heart, ShieldCheck, Database, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onLogin: (name: string) => void;
  onOpenSupabase: () => void;
  supabaseConnected: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onLogin,
  onOpenSupabase,
  supabaseConnected,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('mariana.mae@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [parentName, setParentName] = useState('Mariana');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(parentName || 'Mariana');
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-sky-50 via-white to-sky-100/60 p-6 relative overflow-hidden">
      {/* Decorative floating clouds and stars */}
      <div className="absolute top-6 left-6 text-sky-200 pointer-events-none">
        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
      </div>
      <div className="absolute top-16 right-8 text-sky-200 pointer-events-none">
        <Sparkles className="w-4 h-4 text-sky-300" />
      </div>
      <div className="absolute top-28 left-10 text-sky-200 pointer-events-none opacity-60">
        <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300" />
      </div>
      <div className="absolute top-36 right-12 text-sky-200 pointer-events-none opacity-60">
        <Sparkles className="w-3 h-3 text-amber-300" />
      </div>

      {/* Top Supabase status pill */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onOpenSupabase}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition shadow-xs ${
            supabaseConnected
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
              : 'bg-white/80 text-sky-700 hover:bg-sky-100 border border-sky-200'
          }`}
          title="Configurações do Supabase"
        >
          <Database className="w-3 h-3" />
          <span>{supabaseConnected ? 'Supabase Conectado' : 'Supabase (Configurar)'}</span>
        </button>
      </div>

      {/* Center Mascot and Title from Mockup Screen 1 */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto z-10 px-2">
        {/* Mascot Bear */}
        <div className="relative mb-3 transform hover:scale-105 transition-transform">
          <MascotBear size={150} />
          {/* Subtle glow behind bear */}
          <div className="absolute -inset-2 bg-sky-200/40 rounded-full blur-xl -z-10" />
        </div>

        {/* Title */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-amber-400 text-lg">✦</span>
          <h1 className="text-3xl font-black tracking-tight text-[#3B82F6] font-sans">
            Meu Prontuário
          </h1>
          <span className="text-amber-400 text-lg">✦</span>
        </div>

        {/* Subtitle */}
        <h2 className="text-lg font-bold text-sky-600/90 mb-3 tracking-wide">
          Saúde do meu filho
        </h2>

        {/* Description matching mockup */}
        <p className="text-slate-600 text-sm font-medium max-w-[260px] leading-relaxed mx-auto mb-6">
          Tudo sobre a saúde do seu filho, em um só lugar!
        </p>

        {/* Action Buttons matching mockup */}
        <div className="w-full max-w-[280px] space-y-3">
          <button
            onClick={() => {
              setAuthMode('login');
              setShowAuthModal(true);
            }}
            className="w-full py-3.5 px-6 rounded-full bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-300/50 transition duration-200 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setAuthMode('signup');
              setShowAuthModal(true);
            }}
            className="w-full py-3 px-6 rounded-full bg-white hover:bg-sky-50 active:bg-sky-100 text-[#3B82F6] font-bold text-base border-2 border-sky-200 shadow-sm transition duration-200 transform active:scale-98 cursor-pointer"
          >
            Criar conta
          </button>
        </div>
      </div>

      {/* Bottom wave decoration with little baby heart */}
      <div className="relative pt-4 flex flex-col items-center select-none">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Prontuário protegido e privativo</span>
        </div>

        <div className="w-full flex justify-center items-end opacity-70">
          <div className="w-16 h-8 bg-sky-200/50 rounded-t-full flex items-center justify-center">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
          </div>
        </div>
      </div>

      {/* Auth Modal Sheet */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                {authMode === 'login' ? 'Entrar no Prontuário' : 'Criar Nova Conta'}
              </h3>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              {authMode === 'login'
                ? 'Acesse os dados e histórico médico do seu filho com segurança.'
                : 'Cadastre-se para gerenciar consultas, exames e receitas.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Ex: Mariana Silva"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition"
                >
                  {authMode === 'login' ? 'Entrar agora' : 'Cadastrar e Acessar'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {authMode === 'login'
                  ? 'Não tem conta? Cadastre-se'
                  : 'Já possui cadastro? Fazer login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
