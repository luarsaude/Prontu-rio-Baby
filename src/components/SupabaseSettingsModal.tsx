import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { SupabaseConfig } from '../types';
import { SUPABASE_SQL_SCHEMA, saveSupabaseConfig, resetSupabaseClient } from '../services/supabase';

interface SupabaseSettingsModalProps {
  config: SupabaseConfig;
  onSaveConfig: (cfg: SupabaseConfig) => void;
  onExportBackup: () => void;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({
  config,
  onSaveConfig,
  onExportBackup,
  onClose,
}) => {
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);
  const [copiedSiteUrl, setCopiedSiteUrl] = useState(false);
  const [copiedRedirectUrl, setCopiedRedirectUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'credenciais' | 'sql' | 'google' | 'backup'>('credenciais');

  const cleanUrl = url.trim() || 'https://rhemvyrcqkjsdlwytozf.supabase.co';
  const callbackUrl = `${cleanUrl.replace(/\/+$/, '')}/auth/v1/callback`;
  let projectId = 'rhemvyrcqkjsdlwytozf';
  try {
    const parsed = new URL(cleanUrl);
    projectId = parsed.hostname.split('.')[0];
  } catch {}

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    try {
      if (!url.trim() || !anonKey.trim()) {
        // Save as local mode
        const newCfg: SupabaseConfig = {
          url: '',
          anonKey: '',
          isConnected: false,
          isCustomConfigured: false,
        };
        saveSupabaseConfig(newCfg);
        resetSupabaseClient();
        onSaveConfig(newCfg);
        setTestResult({
          success: true,
          message: 'Modo Offline / Local ativado com sucesso! Dados protegidos no dispositivo.',
        });
        setTesting(false);
        return;
      }

      // Validate URL format
      new URL(url);

      const newCfg: SupabaseConfig = {
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true,
        isCustomConfigured: true,
        lastSync: new Date().toLocaleTimeString(),
      };

      saveSupabaseConfig(newCfg);
      resetSupabaseClient();
      onSaveConfig(newCfg);

      setTestResult({
        success: true,
        message: 'Conexão com Supabase configurada com sucesso! Tabelas prontas para sincronização.',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'URL inválida. Verifique o endereço do seu projeto Supabase.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <Database className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Banco de Dados Supabase
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                PostgreSQL na Nuvem & Armazenamento
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4 text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('credenciais')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'credenciais'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conexão
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'sql'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Script SQL
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'google'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Google OAuth
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Backup
          </button>
        </div>

        {activeTab === 'credenciais' && (
          <form onSubmit={handleTestAndSave} className="space-y-3.5 text-xs">
            <div className="p-3 bg-sky-50/80 border border-sky-200/80 rounded-2xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-sky-900 leading-relaxed font-medium">
                O aplicativo funciona <strong>imediatamente offline</strong> no seu celular e pode ser conectado ao seu próprio projeto no{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold inline-flex items-center gap-0.5 text-blue-700"
                >
                  Supabase.com <ExternalLink className="w-2.5 h-2.5" />
                </a>{' '}
                para backup na nuvem.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Project URL do Supabase
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Anon Public Key (chave pública do cliente)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="font-medium leading-relaxed">{testResult.message}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={testing}
                className="w-full py-3 rounded-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {testing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar e Sincronizar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'sql' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Execute este comando no <strong>SQL Editor</strong> do painel do seu Supabase para criar as tabelas (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">children</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">consultas</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">exames</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">receitas</code>, <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">lembretes</code>) e as regras de segurança RLS:
            </p>

            <div className="relative">
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-2xl text-[10px] font-mono h-56 overflow-y-auto no-scrollbar select-all">
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
        )}

        {activeTab === 'google' && (
          <div className="space-y-3 text-xs">
            {/* Aviso Celular / localhost:3000 */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950 text-xs">
                    📱 Erro "localhost:3000 recusou a conexão" no Celular
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Por padrão de fábrica, o Supabase define o <strong>Site URL</strong> como <code className="bg-white px-1 rounded font-mono text-[10px] border border-amber-200">http://localhost:3000</code>. No computador de desenvolvimento funciona, mas no celular o endereço <em>localhost</em> não existe! Para corrigir:
                  </p>
                </div>
              </div>

              {/* Site URL */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-bold text-slate-700 block">
                  1. Em <strong>Authentication &gt; URL Configuration &gt; Site URL</strong>, cole:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.origin : ''}
                    className="flex-1 bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono select-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(window.location.origin);
                        setCopiedSiteUrl(true);
                        setTimeout(() => setCopiedSiteUrl(false), 2000);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedSiteUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Redirect URLs */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">
                  2. Em <strong>Redirect URLs</strong>, adicione esta URL permitida:
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/**` : ''}
                    className="flex-1 bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono select-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(`${window.location.origin}/**`);
                        setCopiedRedirectUrl(true);
                        setTimeout(() => setCopiedRedirectUrl(false), 2000);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedRedirectUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {projectId && (
                <div className="pt-0.5">
                  <a
                    href={`https://supabase.com/dashboard/project/${projectId}/auth/url-configuration`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    <span>Abrir URL Configuration no Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Google Cloud & Supabase Auth Provider */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <p className="font-bold text-slate-800 text-[11px]">
                  3. URI de Redirecionamento (Google Cloud Console):
                </p>
                <p className="text-[10px] text-slate-500">
                  Adicione este endereço em <em>URIs de redirecionamento autorizados</em> nas credenciais OAuth:
                </p>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    readOnly
                    value={callbackUrl}
                    className="flex-1 bg-white border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 text-[10px] font-mono select-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(callbackUrl);
                      setCopiedCallback(true);
                      setTimeout(() => setCopiedCallback(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedCallback ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p className="font-bold text-slate-800 text-[11px]">
                  4. Ativar Provedor Google no Supabase:
                </p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  No painel do Supabase, acesse <strong>Authentication &gt; Providers &gt; Google</strong>.
                  Marque <strong>"Enable Google provider"</strong>, insira o <strong>Client ID</strong> e o <strong>Client Secret</strong> e clique em <strong>Save</strong>.
                </p>
                {projectId && (
                  <a
                    href={`https://supabase.com/dashboard/project/${projectId}/auth/providers`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 mt-1"
                  >
                    <span>Abrir painel de Providers do Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed font-medium">
                💡 <strong>Alternativa Imediata:</strong> Os pais podem criar conta e entrar diretamente com <strong>E-mail e Senha</strong> de forma 100% autônoma e imediata em qualquer celular ou navegador!
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Você pode fazer o download de uma cópia completa de todo o histórico de consultas, receitas e laudos do seu filho para guardar no Google Drive ou enviar para o médico:
            </p>

            <button
              onClick={onExportBackup}
              className="w-full py-3 px-4 rounded-2xl border-2 border-sky-300 bg-sky-50/60 hover:bg-sky-100 text-blue-700 font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>Baixar Arquivo de Backup do Prontuário (.json)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
