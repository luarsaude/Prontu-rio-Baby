import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'icon';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = ''
}) => {
  const { isInstalled } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className={`p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors ${className}`}
          title="Instalar aplicativo no celular"
          id="pwa-install-icon-btn"
        >
          <Download size={18} />
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  if (variant === 'full') {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className={`w-full py-3 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-blue-200/60 ${className}`}
          id="pwa-install-full-btn"
        >
          <Smartphone size={16} />
          <span>Instalar App no Celular</span>
          <span className="text-[10px] bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded-full font-medium ml-auto">
            Nuvem
          </span>
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all ${className}`}
        id="pwa-install-compact-btn"
      >
        <Download size={14} />
        <span>Instalar App</span>
      </button>
      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
