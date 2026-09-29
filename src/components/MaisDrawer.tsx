import React from 'react';
import {
  FileText,
  FolderClosed,
  Bell,
  User,
  Database,
  Users,
  Key,
  HeartHandshake,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles,
  Smartphone,
  Download,
  Activity,
  Syringe,
} from 'lucide-react';
import { MascotBear } from './MascotIcons';

interface MaisDrawerProps {
  onClose: () => void;
  onNavigate: (view: 'receitas' | 'documentos' | 'lembretes' | 'perfil' | 'eventos' | 'vacinas') => void;
  onOpenSupabase: () => void;
  onOpenChildModal: () => void;
  onOpenInstallModal: () => void;
  onOpenFamilyShare?: () => void;
  onOpenEnterCode?: () => void;
  onLogout: () => void;
  supabaseConnected: boolean;
  isAdmin?: boolean;
}

export const MaisDrawer: React.FC<MaisDrawerProps> = ({
  onClose,
  onNavigate,
  onOpenSupabase,
  onOpenChildModal,
  onOpenInstallModal,
  onOpenFamilyShare,
  onOpenEnterCode,
  onLogout,
  supabaseConnected,
  isAdmin = false,
}) => {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-slate-800">Mais Opções</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {/* Vacinas */}
          <button
            onClick={() => {
              onClose();
              onNavigate('vacinas');
            }}
            className="w-full p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Syringe className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-emerald-950 text-sm block group-hover:text-emerald-800">
                    Vacinas do Bebê
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-600 text-white font-bold">
                    Novo
                  </span>
                </div>
                <span className="text-emerald-800/80 font-semibold">
                  Calendário SUS & Particular com comprovantes
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:text-emerald-700" />
          </button>

          {/* Eventos */}
          <button
            onClick={() => {
              onClose();
              onNavigate('eventos');
            }}
            className="w-full p-3.5 rounded-2xl bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/80 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-amber-950 text-sm block group-hover:text-amber-800">
                    Eventos & Sintomas
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-600 text-white font-bold">
                    Novo
                  </span>
                </div>
                <span className="text-amber-800/80 font-semibold">
                  Ocorrências, remédios, medidas e fotos
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:text-amber-700" />
          </button>
          {/* Receitas */}
          <button
            onClick={() => {
              onClose();
              onNavigate('receitas');
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-black text-slate-800 text-sm block group-hover:text-blue-600">
                  Receitas Médicas
                </span>
                <span className="text-slate-400 font-semibold">
                  Medicamentos, dosagens e antibióticos
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
          </button>

          {/* Documentos */}
          <button
            onClick={() => {
              onClose();
              onNavigate('documentos');
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FolderClosed className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-black text-slate-800 text-sm block group-hover:text-blue-600">
                  Documentos & Vacinas
                </span>
                <span className="text-slate-400 font-semibold">
                  Caderneta, certidão e plano
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
          </button>

          {/* Lembretes */}
          <button
            onClick={() => {
              onClose();
              onNavigate('lembretes');
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-black text-slate-800 text-sm block group-hover:text-blue-600">
                  Lembretes & Alertas
                </span>
                <span className="text-slate-400 font-semibold">
                  Notificações de consultas e exames
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
          </button>

          {/* Perfil */}
          <button
            onClick={() => {
              onClose();
              onNavigate('perfil');
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-black text-slate-800 text-sm block group-hover:text-blue-600">
                  Perfil da Criança
                </span>
                <span className="text-slate-400 font-semibold">
                  Alergias, tipo sanguíneo, medidas
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
          </button>

          {/* Compartilhar com a Mãe / Família */}
          <button
            id="drawer-share-family-btn"
            onClick={() => {
              onClose();
              if (onOpenFamilyShare) onOpenFamilyShare();
            }}
            className="w-full p-3.5 rounded-2xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/80 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-blue-950 text-sm">
                    Compartilhar Prontuário
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-600 text-white font-bold">
                    Família
                  </span>
                </div>
                <span className="text-blue-700 font-medium">
                  Convidar a Mãe, Pai ou cuidadores
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-600" />
          </button>

          {/* Digitar Código Familiar */}
          <button
            id="drawer-enter-family-code-btn"
            onClick={() => {
              onClose();
              if (onOpenEnterCode) onOpenEnterCode();
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-black text-slate-800 text-sm block group-hover:text-blue-600">
                  Digitar Código Familiar
                </span>
                <span className="text-slate-400 font-semibold">
                  Vincular acesso compartilhado recebido
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600" />
          </button>

          {/* Instalar App no Celular */}
          <button
            onClick={() => {
              onClose();
              onOpenInstallModal();
            }}
            className="w-full p-3.5 rounded-2xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 flex items-center justify-between transition cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-blue-950 text-sm">
                    Instalar App no Celular
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-600 text-white font-bold">
                    Ícone PWA
                  </span>
                </div>
                <span className="text-blue-700 font-medium">
                  Acesso rápido na tela inicial (salva na nuvem)
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-600" />
          </button>

          {/* Supabase Database Settings (Visível APENAS para o Administrador) */}
          {isAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenSupabase();
              }}
              className="w-full p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/80 flex items-center justify-between transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-emerald-950 text-sm">
                      Supabase PostgreSQL
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-600 text-white font-bold">
                      {supabaseConnected ? 'Conectado' : 'Configurar'}
                    </span>
                  </div>
                  <span className="text-emerald-700 font-medium">
                    Sincronização na nuvem & Scripts SQL (Admin)
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </button>
          )}

          {/* Sair */}
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full p-3 rounded-2xl text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-2 font-bold transition cursor-pointer mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Prontuário</span>
          </button>
        </div>
      </div>
    </div>
  );
};
