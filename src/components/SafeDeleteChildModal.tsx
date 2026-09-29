import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  X,
  Loader2,
  Calendar,
  FileText,
  Activity,
  Syringe,
  FolderClosed,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { Child } from '../types';
import { BabyAvatar } from './MascotIcons';

interface SafeDeleteChildModalProps {
  child: Child | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (childId: string) => Promise<{ success: boolean; error?: string }>;
  consultasCount?: number;
  examesCount?: number;
  vacinasCount?: number;
  receitasCount?: number;
  documentosCount?: number;
  eventosCount?: number;
}

export const SafeDeleteChildModal: React.FC<SafeDeleteChildModalProps> = ({
  child,
  isOpen,
  onClose,
  onConfirmDelete,
  consultasCount = 0,
  examesCount = 0,
  vacinasCount = 0,
  receitasCount = 0,
  documentosCount = 0,
  eventosCount = 0,
}) => {
  const [typedName, setTypedName] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !child) return null;

  const targetName = child.name ? child.name.trim() : 'EXCLUIR';
  const isNameMatch =
    typedName.trim().toLowerCase() === targetName.toLowerCase() ||
    (child.name.trim().length === 0 && typedName.trim().toUpperCase() === 'EXCLUIR');

  const canDelete = isNameMatch && acknowledged && !isDeleting;

  const handleClose = () => {
    if (isDeleting) return;
    setTypedName('');
    setAcknowledged(false);
    setErrorMessage(null);
    onClose();
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await onConfirmDelete(child.id);
      if (res && !res.success) {
        setErrorMessage(res.error || 'Erro ao excluir o perfil. Tente novamente.');
        setIsDeleting(false);
      } else {
        handleClose();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro inesperado ao excluir.');
      setIsDeleting(false);
    }
  };

  const totalRecords =
    consultasCount + examesCount + vacinasCount + receitasCount + documentosCount + eventosCount;

  return (
    <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-rose-100 flex flex-col my-auto max-h-[94vh] overflow-y-auto no-scrollbar">
        {/* Header with Danger Warning */}
        <div className="flex items-start justify-between pb-4 border-b border-rose-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
                Zona de Segurança
              </span>
              <h3 className="text-xl font-black text-slate-900 leading-tight mt-1">
                Exclusão Segura do Perfil
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="mt-4 p-3.5 bg-rose-50/90 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1.5">
          <div className="flex items-center gap-1.5 font-black text-rose-700 text-sm">
            <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
            <span>Ação Permanente e Irreversível</span>
          </div>
          <p className="leading-relaxed font-medium">
            Você está prestes a excluir o perfil de{' '}
            <strong className="font-bold underline">{child.name || 'este filho'}</strong>. Todo o histórico
            médico, consultas, receitas, exames e vacinas vinculados serão excluídos permanentemente do banco de dados.
          </p>
        </div>

        {/* Child Profile Card Summary */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
          <div className="shrink-0">
            <BabyAvatar size={50} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-black text-slate-800 break-words leading-snug">
              {child.name || 'Filho(a)'}
            </h4>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mt-0.5 flex-wrap">
              {child.birthDate && <span>Nasc.: {child.birthDate}</span>}
              {child.bloodType && <span>• Sangue: {child.bloodType}</span>}
              {child.gender && <span>• {child.gender === 'girl' ? 'Menina' : 'Menino'}</span>}
            </div>
          </div>
        </div>

        {/* Linked Medical Records Summary */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Prontuário que será apagado:</span>
            <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {totalRecords} registro(s) no total
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <span className="block font-black text-slate-800 text-sm">{consultasCount}</span>
                <span className="text-[11px] text-slate-500 truncate block">Consultas</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <span className="block font-black text-slate-800 text-sm">{examesCount}</span>
                <span className="text-[11px] text-slate-500 truncate block">Exames</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <Syringe className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="block font-black text-slate-800 text-sm">{vacinasCount}</span>
                <span className="text-[11px] text-slate-500 truncate block">Vacinas</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <span className="block font-black text-slate-800 text-sm">{receitasCount}</span>
                <span className="text-[11px] text-slate-500 truncate block">Receitas</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <FolderClosed className="w-4 h-4 text-sky-500 shrink-0" />
              <div className="min-w-0">
                <span className="block font-black text-slate-800 text-sm">{documentosCount}</span>
                <span className="text-[11px] text-slate-500 truncate block">Documentos</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500 shrink-0" />
              <div className="min-w-0">
                <span className="block font-black text-slate-800 text-sm">{eventosCount}</span>
                <span className="text-[11px] text-slate-500 truncate block">Eventos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Confirmation Form */}
        <form onSubmit={handleDelete} className="mt-5 space-y-4 text-xs">
          {/* Verification Text Prompt */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-2">
            <label className="block text-slate-800 font-bold leading-relaxed">
              Para confirmar a exclusão com segurança, digite{' '}
              <strong className="font-black text-rose-700 underline font-mono">{targetName}</strong> no campo
              abaixo:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="off"
                disabled={isDeleting}
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder={`Digite "${targetName}" para confirmar`}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold outline-none transition ${
                  isNameMatch
                    ? 'border-emerald-500 bg-white text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500'
                }`}
              />
              {isNameMatch && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
          </div>

          {/* Explicit Checkbox Acknowledgement */}
          <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              disabled={isDeleting}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer border-slate-300"
            />
            <span className="text-slate-700 font-medium leading-snug">
              Compreendo que todos os dados médicos e fotos deste prontuário serão apagados permanentemente e não poderão ser recuperados.
            </span>
          </label>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              Cancelar e Manter Perfil
            </button>

            <button
              type="submit"
              disabled={!canDelete}
              className={`flex-1 py-3 rounded-full font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                canDelete
                  ? 'bg-rose-600 hover:bg-rose-700 active:scale-98 text-white cursor-pointer shadow-rose-600/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Excluindo com Segurança...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Perfil Definitivamente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
