import React, { useState } from 'react';
import { Smartphone, Maximize2, Sparkles, Heart } from 'lucide-react';
import { MascotBear } from './MascotIcons';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  // Default to full panel mode on desktop/tablet so all modules use the available screen space
  const [isFullWidth, setIsFullWidth] = useState(true);

  return (
    <div className="min-h-screen bg-slate-900/95 flex flex-col items-center justify-center p-0 sm:p-2 md:p-3 transition-all duration-300 overflow-x-hidden w-full max-w-full">
      {/* Top utility bar on desktop */}
      <header className={`hidden sm:flex items-center justify-between w-full mb-2 px-2 text-xs text-sky-200/80 transition-all duration-300 ${
        isFullWidth ? 'max-w-5xl' : 'max-w-md'
      }`}>
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="font-bold">Prontuário baby</span>
          <span className="text-[11px] text-sky-300/60 hidden md:inline">• Painel Pediátrico</span>
        </div>
        <button
          onClick={() => setIsFullWidth(!isFullWidth)}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition text-xs font-semibold cursor-pointer shadow-xs"
          title={isFullWidth ? 'Alternar para Modo Celular (412px)' : 'Alternar para Painel Completo'}
        >
          {isFullWidth ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-sky-300" />
              <span>Simular Celular (412px)</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Painel Amplo (Completo)</span>
            </>
          )}
        </button>
      </header>

      {/* Main Container: Full panel on desktop or mobile phone simulator */}
      <div
        className={`w-full max-w-full bg-[#F3F8FE] text-slate-800 transition-all duration-300 flex flex-col relative overflow-hidden overflow-x-hidden shadow-2xl ${
          isFullWidth
            ? 'max-w-5xl h-[100dvh] sm:h-[95vh] rounded-none sm:rounded-3xl border-0 sm:border sm:border-slate-700/60'
            : 'max-w-[412px] h-[100dvh] sm:h-[min(880px,calc(100vh-2.5rem))] sm:rounded-[42px] sm:border-[8px] sm:border-slate-800'
        }`}
      >
        {/* Top Header: Logo e nome Prontuário baby */}
        <div className="bg-white border-b border-slate-100 px-4 py-2.5 shrink-0 flex items-center justify-between select-none z-30 shadow-2xs w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/90 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
              <MascotBear size={28} />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-black text-slate-800 text-base tracking-tight truncate">
                Prontuário baby
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center gap-0.5 shrink-0">
                <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
              </span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden overflow-x-hidden relative w-full max-w-full">
          {children}
        </main>

        {/* Android bottom gesture pill bar */}
        <div className="h-4 bg-white/90 shrink-0 flex items-center justify-center z-30">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
