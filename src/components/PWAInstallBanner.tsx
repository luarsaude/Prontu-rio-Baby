import React, { useState } from 'react';
import { Download, Smartphone, Cloud, Sparkles, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenModal }) => {
  const { isInstalled } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // If already running in standalone mode (installed as PWA) or dismissed in this session
  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <div 
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500 p-4 text-white shadow-lg shadow-blue-500/20 mb-4"
      id="pwa-install-banner"
    >
      {/* Background glow & decorations */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/15 rounded-full blur-xl pointer-events-none" />

      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2.5 right-2.5 p-1 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        title="Dispensar aviso"
        id="dismiss-pwa-banner"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-3.5 pr-6">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs p-1 shadow-inner flex items-center justify-center shrink-0 border border-white/30">
          <img 
            src="/pwa-192x192.png" 
            alt="Ícone do Aplicativo" 
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1">
              <Sparkles size={12} /> App no Celular
            </span>
          </div>
          <h3 className="font-bold text-sm leading-tight text-white mt-0.5 truncate">
            Instalar Meu Prontuário
          </h3>
          <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
            <Cloud size={12} className="shrink-0" />
            Ícone na tela inicial • Salva no Supabase
          </p>
        </div>

        <button
          onClick={onOpenModal}
          id="open-pwa-modal-btn"
          className="px-3.5 py-2 rounded-xl bg-white text-blue-600 font-bold text-xs shadow-md hover:bg-blue-50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
        >
          <Download size={14} />
          Instalar
        </button>
      </div>
    </div>
  );
};
