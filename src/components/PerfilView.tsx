import React, { useState } from 'react';
import {
  ArrowLeft,
  User,
  Heart,
  ShieldAlert,
  Activity,
  Calendar,
  Phone,
  Printer,
  Sparkles,
  Edit2,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { Child } from '../types';
import { BabyAvatar } from './MascotIcons';
import { SafeDeleteChildModal } from './SafeDeleteChildModal';

interface PerfilViewProps {
  child: Child;
  consultasCount: number;
  examesCount: number;
  receitasCount: number;
  vacinasCount?: number;
  eventosCount?: number;
  documentosCount?: number;
  onBack: () => void;
  onEditChild: () => void;
  onDeleteChild?: (childId: string) => Promise<{ success: boolean; error?: string }> | void;
}

export const PerfilView: React.FC<PerfilViewProps> = ({
  child,
  consultasCount,
  examesCount,
  receitasCount,
  vacinasCount = 0,
  eventosCount = 0,
  documentosCount = 0,
  onBack,
  onEditChild,
  onDeleteChild,
}) => {
  const [showSafeDeleteModal, setShowSafeDeleteModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const formatAge = (birthDate?: string) => {
    if (!birthDate) return '';
    try {
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return '';
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years === 0) {
        return `${months} ${months === 1 ? 'mês' : 'meses'}`;
      }
      return `${years} ${years === 1 ? 'ano' : 'anos'}${months > 0 ? ` e ${months}m` : ''}`;
    } catch (e) {
      return '';
    }
  };

  const formatDateDisplay = (dateStr?: string): string => {
    if (!dateStr) return '';
    const clean = dateStr.trim();
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].substring(0, 2).padStart(2, '0');
        return `${d}/${m}/${y}`;
      }
    }
    return clean;
  };

  const ageStr = formatAge(child?.birthDate);

  return (
    <div className="flex-1 flex flex-col bg-[#F3F8FE] overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Perfil da Criança</span>
        </button>

        <button
          onClick={onEditChild}
          className="py-1.5 px-3 rounded-full bg-sky-50 text-blue-600 hover:bg-sky-100 text-xs font-bold border border-sky-200 flex items-center gap-1 cursor-pointer transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Editar</span>
        </button>
      </header>

      <div className="p-5 space-y-4">
        {/* Child Identity Card */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-xs text-center flex flex-col items-center relative overflow-hidden">
          {child.bloodType && (
            <div className="absolute top-3 right-3">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                Sangue {child.bloodType}
              </span>
            </div>
          )}

          <div className="mb-2">
            <BabyAvatar size={76} />
          </div>

          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {child.name || 'Filho(a)'}
          </h2>
          <p className="text-xs font-bold text-slate-400">
            {ageStr ? `${ageStr}` : 'Idade não informada'}{' '}
            {child.birthDate ? `• Nascido em ${formatDateDisplay(child.birthDate)}` : ''}
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4 pt-4 border-t border-slate-100">
            <div className="p-2 bg-sky-50/60 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Peso Atual
              </span>
              <span className="text-xs font-black text-slate-800">
                {child.weight || '--'}
              </span>
            </div>
            <div className="p-2 bg-sky-50/60 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Altura
              </span>
              <span className="text-xs font-black text-slate-800">
                {child.height || '--'}
              </span>
            </div>
            <div className="p-2 bg-sky-50/60 rounded-xl">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                Gênero
              </span>
              <span className="text-xs font-black text-slate-800">
                {child.gender === 'girl' ? 'Menina' : 'Menino'}
              </span>
            </div>
          </div>
        </div>

        {/* Critical Health Alerts (Allergies) */}
        <div className="bg-rose-50/90 rounded-2xl p-4 border border-rose-200">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Alergias e Intolerâncias Registradas</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {child.allergies && child.allergies.length > 0 ? (
              child.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full bg-white text-rose-700 font-bold text-xs border border-rose-200 shadow-2xs"
                >
                  ⚠ {allergy}
                </span>
              ))
            ) : (
              <span className="text-xs text-rose-600 font-medium">Nenhuma alergia registrada</span>
            )}
          </div>
        </div>

        {/* Pediatrician Info */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2 text-xs">
          <h3 className="font-bold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-blue-500" />
            <span>Médico de Referência</span>
          </h3>
          <div className="flex justify-between items-center pt-1">
            <div>
              <p className="font-black text-sm text-slate-800">
                {child.pediatricianName || 'Não informado'}
              </p>
              <p className="text-slate-400 text-xs">Pediatra da Criança</p>
            </div>
          </div>
        </div>

        {/* Historical Counts */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2 text-xs">
          <h3 className="font-bold text-slate-700 mb-2">Resumo do Prontuário no Supabase</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-base font-black text-blue-600">{consultasCount}</span>
              <span className="block text-[10px] text-slate-500 font-bold truncate">Consultas</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-base font-black text-amber-600">{examesCount}</span>
              <span className="block text-[10px] text-slate-500 font-bold truncate">Exames</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-base font-black text-emerald-600">{vacinasCount}</span>
              <span className="block text-[10px] text-slate-500 font-bold truncate">Vacinas</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
              <span className="text-base font-black text-purple-600">{receitasCount}</span>
              <span className="block text-[10px] text-slate-500 font-bold truncate">Receitas</span>
            </div>
          </div>
        </div>

        {/* Print / Export Button */}
        <button
          onClick={handlePrint}
          className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Imprimir / Gerar Resumo Pediátrico</span>
        </button>

        {/* Zona de Segurança / Exclusão Segura */}
        {onDeleteChild && child?.id && (
          <div className="bg-rose-50/70 rounded-3xl p-5 border border-rose-200/90 space-y-3 mt-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Gerenciamento & Exclusão Segura</span>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800">
                Excluir perfil e prontuário de {child.name || 'este filho'}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Ao excluir com segurança, todo o histórico de consultas, vacinas, exames, receitas e documentos anexados será removido definitivamente do Supabase.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSafeDeleteModal(true)}
              className="py-2.5 px-4 rounded-full bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Excluir Perfil com Segurança</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Exclusão Segura */}
      {showSafeDeleteModal && child && (
        <SafeDeleteChildModal
          child={child}
          isOpen={showSafeDeleteModal}
          onClose={() => setShowSafeDeleteModal(false)}
          onConfirmDelete={async (id) => {
            if (onDeleteChild) {
              const res = await onDeleteChild(id);
              setShowSafeDeleteModal(false);
              onBack();
              return res || { success: true };
            }
            return { success: true };
          }}
          consultasCount={consultasCount}
          examesCount={examesCount}
          vacinasCount={vacinasCount}
          receitasCount={receitasCount}
          eventosCount={eventosCount}
          documentosCount={documentosCount}
        />
      )}
    </div>
  );
};
