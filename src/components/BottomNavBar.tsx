import React from 'react';
import { Home, Calendar, FlaskConical, LayoutGrid } from 'lucide-react';

export type NavTab = 'inicio' | 'consultas' | 'exames' | 'mais';

interface BottomNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  badgeCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  badgeCount = 0,
}) => {
  return (
    <nav className="h-16 sm:h-17 bg-white border-t border-slate-100 flex items-center justify-around sm:justify-center sm:gap-14 md:gap-20 px-4 shrink-0 z-30 select-none shadow-sm">
      {/* 1. Início */}
      <button
        onClick={() => onSelectTab('inicio')}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition ${
          currentTab === 'inicio' ? 'text-[#3B82F6]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Home className={`w-5.5 h-5.5 ${currentTab === 'inicio' ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} />
        <span className={`text-xs ${currentTab === 'inicio' ? 'font-black' : 'font-bold'}`}>
          Início
        </span>
      </button>

      {/* 2. Consultas */}
      <button
        onClick={() => onSelectTab('consultas')}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition ${
          currentTab === 'consultas' ? 'text-[#3B82F6]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Calendar className={`w-5.5 h-5.5 ${currentTab === 'consultas' ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} />
        <span className={`text-xs ${currentTab === 'consultas' ? 'font-black' : 'font-bold'}`}>
          Consultas
        </span>
      </button>

      {/* 3. Exames */}
      <button
        onClick={() => onSelectTab('exames')}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition ${
          currentTab === 'exames' ? 'text-[#3B82F6]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <FlaskConical className={`w-5.5 h-5.5 ${currentTab === 'exames' ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} />
        <span className={`text-xs ${currentTab === 'exames' ? 'font-black' : 'font-bold'}`}>
          Exames
        </span>
      </button>

      {/* 4. Mais (Grid / Dots as in mockup) */}
      <button
        onClick={() => onSelectTab('mais')}
        className={`flex flex-col items-center justify-center gap-1 w-16 py-1 cursor-pointer transition relative ${
          currentTab === 'mais' ? 'text-[#3B82F6]' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <div className="relative">
          <LayoutGrid className={`w-5.5 h-5.5 ${currentTab === 'mais' ? 'stroke-[2.5]' : 'stroke-[1.9]'}`} />
          {badgeCount > 0 && (
            <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500" />
          )}
        </div>
        <span className={`text-xs ${currentTab === 'mais' ? 'font-black' : 'font-bold'}`}>
          Mais
        </span>
      </button>
    </nav>
  );
};
