import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Share2, PlusSquare, Cloud, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      setJustInstalled(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300"
        id="pwa-install-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 p-1 shadow-md shadow-blue-200 flex items-center justify-center shrink-0">
              <img 
                src="/pwa-192x192.png" 
                alt="Ícone do Meu Prontuário Infantil" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 font-quicksand">
                Instalar no Celular
              </h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Meu Prontuário Infantil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            title="Fechar"
            id="close-pwa-modal-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cloud Guarantee Highlight */}
        <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500 text-white shrink-0 mt-0.5 shadow-xs">
            <Cloud size={18} />
          </div>
          <div className="text-xs">
            <span className="font-bold text-blue-900 block mb-0.5">
              100% Salvo na Nuvem (Supabase)
            </span>
            <p className="text-blue-700 leading-relaxed">
              O ícone no seu celular funciona como um aplicativo de verdade, sem ocupar espaço, e continua conectado ao seu banco de dados Supabase na nuvem.
            </p>
          </div>
        </div>

        {/* Content depending on state */}
        {justInstalled || isInstalled ? (
          <div className="my-6 text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-md shadow-emerald-200">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-bold text-emerald-900 text-sm">Aplicativo Instalado!</h3>
            <p className="text-xs text-emerald-700 mt-1 px-4">
              O ícone já está disponível na tela inicial do seu celular. Você já pode abri-lo direto de lá!
            </p>
          </div>
        ) : isInstallable ? (
          /* Android / Chrome Native 1-Click Install */
          <div className="mt-5 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Smartphone size={16} className="text-blue-500" />
                Vantagens do App Instalado:
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-slate-600">
                <li>Abre em tela cheia (sem barra do navegador)</li>
                <li>Acesso rápido em 1 toque na tela inicial</li>
                <li>Carregamento instantâneo</li>
                <li>Câmera e upload direto para laudos e receitas</li>
              </ul>
            </div>

            <button
              onClick={handleInstallClick}
              disabled={installing}
              id="confirm-install-pwa-btn"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm transition-all transform active:scale-98 cursor-pointer"
            >
              <Download size={18} />
              {installing ? 'Instalando...' : 'Adicionar à Tela Inicial'}
            </button>
          </div>
        ) : isIOS ? (
          /* iOS Safari Guide */
          <div className="mt-5 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium">
              📱 No iPhone/iPad, siga 2 passos rápidos no Safari:
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div className="flex-1">
                  Toque no botão <strong className="text-slate-800">Compartilhar</strong> na barra do Safari (ícone do quadrado com seta para cima).
                </div>
                <Share2 size={20} className="text-blue-600 shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div className="flex-1">
                  Role a lista e selecione <strong className="text-slate-800">"Adicionar à Tela de Início"</strong>.
                </div>
                <PlusSquare size={20} className="text-blue-600 shrink-0" />
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        ) : (
          /* Other Browsers / Desktop / In-frame instructions */
          <div className="mt-5 space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="font-semibold text-slate-800 flex items-center gap-2">
                <Smartphone size={16} className="text-blue-500" />
                Como instalar no seu celular:
              </div>
              <ol className="space-y-2 pl-4 list-decimal text-slate-600 leading-relaxed">
                <li>
                  Abra este link no navegador do seu celular (<strong>Chrome</strong> no Android ou <strong>Safari</strong> no iPhone).
                </li>
                <li>
                  Toque nos <strong>3 pontinhos</strong> do navegador (ou ícone de compartilhar) e escolha <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                </li>
              </ol>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-2.5 text-emerald-800">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <span>
                Pronto! O app terá seu próprio ícone e continuará salvando tudo na nuvem Supabase.
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-colors"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Security / Cloud footnote */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>PWA Oficial • Supabase PostgreSQL</span>
          <span className="text-blue-600 font-medium">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
