import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Server,
} from 'lucide-react';
import { MascotBear } from './MascotIcons';
import {
  SUPABASE_SQL_SCHEMA,
  testSupabaseConnection,
  persistSupabaseCredentials,
  normalizeSupabaseUrl,
  extractRefFromJwt,
} from '../services/supabase';

interface SupabaseConnectScreenProps {
  onConnected: (url: string, anonKey: string) => void;
  initialUrl?: string;
  initialKey?: string;
}

export const SupabaseConnectScreen: React.FC<SupabaseConnectScreenProps> = ({
  onConnected,
  initialUrl = '',
  initialKey = '',
}) => {
  const [url, setUrl] = useState(() => normalizeSupabaseUrl(initialUrl, initialKey));
  const [anonKey, setAnonKey] = useState(initialKey);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [showSQLModal, setShowSQLModal] = useState(false);

  const handleAnonKeyChange = (val: string) => {
    setAnonKey(val);
    if (!url.trim() || !url.includes('.')) {
      const extractedRef = extractRefFromJwt(val);
      if (extractedRef) {
        setUrl(`https://${extractedRef}.supabase.co`);
      }
    }
  };

  const handleUrlBlur = () => {
    if (url.trim()) {
      setUrl(normalizeSupabaseUrl(url, anonKey));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanKey = anonKey.trim();
    const cleanUrl = normalizeSupabaseUrl(url, cleanKey);

    if (!cleanUrl || !cleanKey) {
      setErrorMessage('Por favor, preencha o Project URL e a Anon Key do seu Supabase.');
      return;
    }

    setUrl(cleanUrl);
    setLoading(true);
    const result = await testSupabaseConnection(cleanUrl, cleanKey);
    setLoading(false);

    if (result.success) {
      persistSupabaseCredentials(result.normalizedUrl, cleanKey);
      onConnected(result.normalizedUrl, cleanKey);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-linear-to-b from-[#EBF5FF] via-[#F5F9FF] to-white p-6 overflow-y-auto no-scrollbar justify-between">
      {/* Top mascot badge */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="relative mb-3">
          <MascotBear size={84} />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white">
            <Database className="w-3.5 h-3.5" />
          </div>
        </div>

        <h1 className="text-xl font-black text-slate-800 tracking-tight">
          Meu Prontuário Infantil
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Conexão direta com banco de dados Supabase
        </p>

        <div className="mt-3 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>100% Nuvem • Sem dados locais ou fictícios</span>
        </div>
      </div>

      {/* Form */}
      <div className="my-5 bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3.5">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Project URL do Supabase *
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://seu-projeto.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Anon Public Key do Supabase *
            </label>
            <input
              type="password"
              required
              value={anonKey}
              onChange={(e) => handleAnonKeyChange(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-full bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white font-black text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Conectando ao banco...</span>
            ) : (
              <>
                <span>Conectar ao Supabase</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Action to view / copy SQL tables */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-semibold">Tabelas necessárias:</span>
          <button
            type="button"
            onClick={() => setShowSQLModal(true)}
            className="text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer inline-flex items-center gap-1"
          >
            <Server className="w-3 h-3" />
            <span>Ver Script SQL das Tabelas</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-slate-400 font-medium">
        Crie seu projeto gratuito em{' '}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline font-bold inline-flex items-center gap-0.5"
        >
          supabase.com <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* SQL Script Modal */}
      {showSQLModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-black text-slate-800">
                Script SQL para o Supabase
              </h3>
              <button
                onClick={() => setShowSQLModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                Fechar
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Abra o <strong>SQL Editor</strong> no Supabase, cole o código abaixo e clique em <strong>Run</strong>:
            </p>

            <div className="relative flex-1 overflow-hidden rounded-2xl bg-slate-900 border border-slate-800">
              <pre className="p-3 text-[10px] text-slate-100 font-mono h-64 overflow-y-auto no-scrollbar select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>

              <button
                type="button"
                onClick={handleCopySQL}
                className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md transition cursor-pointer"
              >
                {copiedSQL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSQL ? 'Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
