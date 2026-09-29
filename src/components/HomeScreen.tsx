import React from 'react';
import {
  Settings,
  Plus,
  ChevronRight,
  Calendar,
  FlaskConical,
  FileText,
  FolderClosed,
  Bell,
  User,
  AlertCircle,
  Clock,
  Download,
  Database,
  ShieldCheck,
  Users,
  Key,
  HeartHandshake,
  Share2,
  Activity,
  Syringe,
} from 'lucide-react';
import { Child, Consulta, Exame, Receita, Lembrete, Documento, FamilyShare, Evento, VacinaRegistro } from '../types';
import { BabyAvatar, BabyGiraffe } from './MascotIcons';
import { PWAInstallBanner } from './PWAInstallBanner';

interface HomeScreenProps {
  parentName: string;
  activeChild: Child;
  consultas: Consulta[];
  eventos?: Evento[];
  vacinas?: VacinaRegistro[];
  exames: Exame[];
  receitas: Receita[];
  lembretes: Lembrete[];
  documentos: Documento[];
  isAdmin?: boolean;
  onNavigate: (tab: 'inicio' | 'consultas' | 'exames' | 'eventos' | 'vacinas' | 'receitas' | 'documentos' | 'lembretes' | 'perfil') => void;
  onOpenChildModal: () => void;
  onOpenSettings: () => void;
  onOpenInstallModal: () => void;
  onAddChild: () => void;
  onOpenFamilyShare?: () => void;
  onOpenEnterCode?: () => void;
  pendingShares?: FamilyShare[];
  onAcceptPendingShare?: (share: FamilyShare) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  parentName,
  activeChild,
  consultas,
  eventos = [],
  vacinas = [],
  exames,
  receitas,
  lembretes,
  documentos,
  isAdmin = false,
  onNavigate,
  onOpenChildModal,
  onOpenSettings,
  onOpenInstallModal,
  onAddChild,
  onOpenFamilyShare,
  onOpenEnterCode,
  pendingShares,
  onAcceptPendingShare,
}) => {
  // Count alterations in exams to gently highlight
  const alterationExams = exames.filter((e) => e.hasAlteration && e.status === 'Realizado');
  const pendingReminders = lembretes.filter((l) => !l.completed);
  const activeReceitas = receitas.filter((r) => r.status === 'Ativa');
  const nextConsultas = consultas.filter((c) => c.status === 'Agendada');
  const observingEvents = eventos.filter((e) => e.status === 'Em observação');
  const appliedVacinas = vacinas.filter((v) => v.childId === activeChild?.id && v.vacinado);

  // Helper to parse date string (DD/MM/YYYY, YYYY-MM-DD, or ISO) to timestamp
  const parseDateToTimestamp = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const clean = dateStr.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      }
    }
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2].substring(0, 2), 10);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      }
    }
    const d = new Date(clean);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  };

  // Helper to format date string nicely as DD/MM/YYYY
  const formatDateDisplay = (dateStr?: string): string => {
    if (!dateStr) return '';
    const clean = dateStr.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${day}/${month}/${year}`;
      }
    }
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].substring(0, 2).padStart(2, '0');
        return `${day}/${month}/${year}`;
      }
    }
    return clean;
  };

  // Find next real upcoming event (consulta, exame or lembrete)
  interface NextEventInfo {
    label: string;
    timestamp: number;
    view: 'consultas' | 'exames' | 'lembretes';
  }

  const upcomingEvents: NextEventInfo[] = [];

  // 1. Scheduled Consultas
  consultas.forEach((c) => {
    if (c.status === 'Agendada' && c.date && c.date.trim()) {
      upcomingEvents.push({
        label: `Próxima consulta: ${formatDateDisplay(c.date)}${c.doctorName ? ` • ${c.doctorName}` : ''}`,
        timestamp: parseDateToTimestamp(c.date),
        view: 'consultas',
      });
    }
  });

  // 2. Scheduled / Requested Exams
  exames.forEach((e) => {
    const isScheduled = e.status === 'Agendado' || e.status === 'Solicitado';
    const examDate = e.expectedDate || (isScheduled ? e.date : '');
    if (isScheduled && examDate && examDate.trim()) {
      upcomingEvents.push({
        label: `Próximo exame: ${formatDateDisplay(examDate)}`,
        timestamp: parseDateToTimestamp(examDate),
        view: 'exames',
      });
    }
  });

  // 3. Pending Reminders
  lembretes.forEach((l) => {
    if (!l.completed && l.date && l.date.trim()) {
      let label = `Próximo lembrete: ${formatDateDisplay(l.date)}`;
      if (l.type === 'Consulta') {
        label = `Próxima consulta: ${formatDateDisplay(l.date)}`;
      } else if (l.type === 'Exame') {
        label = `Próximo exame: ${formatDateDisplay(l.date)}`;
      }
      upcomingEvents.push({
        label,
        timestamp: parseDateToTimestamp(l.date),
        view: 'lembretes',
      });
    }
  });

  // Sort: prioritize upcoming events closest to today/future
  let nextRealEvent: NextEventInfo | null = null;
  if (upcomingEvents.length > 0) {
    const todayTs = new Date().setHours(0, 0, 0, 0);
    upcomingEvents.sort((a, b) => {
      const aUpcoming = a.timestamp >= todayTs;
      const bUpcoming = b.timestamp >= todayTs;
      if (aUpcoming && bUpcoming) return a.timestamp - b.timestamp;
      if (aUpcoming && !bUpcoming) return -1;
      if (!aUpcoming && bUpcoming) return 1;
      return a.timestamp - b.timestamp;
    });
    nextRealEvent = upcomingEvents[0];
  }

  // Helper to format age from birthDate
  const formatAge = (birthDate?: string) => {
    if (!birthDate) return '';
    try {
      const parts = birthDate.split('-').map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return '';
      const birth = new Date(parts[0], parts[1] - 1, parts[2]);
      if (isNaN(birth.getTime())) return '';
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();
      if (days < 0) {
        months--;
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years === 0) {
        if (months === 0) {
          return days > 0 ? `${days} ${days === 1 ? 'dia' : 'dias'}` : 'Recém-nascido';
        }
        return `${months} ${months === 1 ? 'mês' : 'meses'}`;
      }
      return `${years} ${years === 1 ? 'ano' : 'anos'}${months > 0 ? ` e ${months} ${months === 1 ? 'mês' : 'meses'}` : ''}`;
    } catch (e) {
      return '';
    }
  };

  // Helper to format friendly parent display name so email addresses never stretch the screen
  const getFriendlyParentName = (rawName?: string): string => {
    if (!rawName) return 'Responsável';
    const trimmed = rawName.trim();
    if (trimmed.includes('@')) {
      const userPart = trimmed.split('@')[0];
      const cleaned = userPart.replace(/[._-]/g, ' ').trim();
      if (!cleaned) return 'Responsável';
      // Format as title case (e.g. "michaelconceicaorj" -> "Michaelconceicaorj")
      return cleaned
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return trimmed;
  };

  const friendlyParentName = getFriendlyParentName(parentName);
  const hasChild = activeChild && activeChild.id;
  const childAgeStr = formatAge(activeChild?.birthDate);

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar p-3.5 sm:p-5 bg-[#F3F8FE] relative w-full max-w-full">
      <div className="w-full min-w-0">
        {/* Header with zero horizontal overflow */}
        <div className="flex items-center justify-between gap-3 mb-4 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight break-words leading-tight">
              Olá, {friendlyParentName}!
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
              Prontuário e saúde pediátrica
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/25 active:scale-95 transition cursor-pointer"
              title="Instalar aplicativo no celular"
              id="header-pwa-install-btn"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>Instalar</span>
            </button>

            {isAdmin && (
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                title="Conexão do Banco de Dados Supabase (Exclusivo Administrador)"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="text-[11px]">Banco Supabase</span>
              </button>
            )}
          </div>
        </div>

        {/* PWA Install Banner (Dismissible, guides phone installation) */}
        <PWAInstallBanner onOpenModal={onOpenInstallModal} />

        {/* Pending Family Invites Banner */}
        {pendingShares && pendingShares.length > 0 && (
          <div className="mb-4 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-xs space-y-2 animate-in fade-in">
            {pendingShares.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-blue-950 truncate">
                        Convite de {invite.ownerEmail}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-900 text-[9px] font-bold">
                        {invite.relationship}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 font-medium truncate">
                      Acesso ao prontuário de <strong>{invite.childName || 'Bebê'}</strong>
                    </p>
                  </div>
                </div>
                <button
                  id={`btn-accept-invite-${invite.id}`}
                  onClick={() => onAcceptPendingShare && onAcceptPendingShare(invite)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition shrink-0 cursor-pointer"
                >
                  Aceitar
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Child Selector section */}
        <div className="mb-4">
          <p className="text-sm font-bold text-slate-600 mb-2">
            {hasChild ? 'Filho(a) selecionado:' : 'Cadastre seu filho:'}
          </p>

          {hasChild ? (
            /* Child Card matching mockup with multiline baby name */
            <div
              onClick={onOpenChildModal}
              className="w-full bg-white rounded-2xl p-4 border border-sky-100 shadow-xs flex items-center justify-between hover:shadow-md hover:border-sky-300 transition cursor-pointer group gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="shrink-0">
                  <BabyAvatar size={52} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-800 group-hover:text-blue-600 transition break-words leading-snug">
                      {activeChild.name}
                    </h2>
                    {activeChild.isShared && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Users className="w-3 h-3" />
                        <span>{activeChild.sharedRole || 'Mãe'}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-500">
                      {childAgeStr || 'Idade não informada'} {activeChild.bloodType ? `• Sangue ${activeChild.bloodType}` : ''}
                    </span>
                  </div>
                  {activeChild.ownerEmail && (
                    <span className="text-[11px] text-slate-400 font-medium block truncate max-w-full">
                      Responsável: {activeChild.ownerEmail}
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
            </div>
          ) : (
            <div
              onClick={onAddChild}
              className="w-full bg-white rounded-2xl p-4 border-2 border-dashed border-sky-300 shadow-xs flex items-center justify-between hover:bg-sky-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-sky-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Cadastrar dados do filho
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold">
                    Inicie o prontuário no Supabase
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </div>
          )}

          {/* Family Sharing & Child Action Bar */}
          {hasChild ? (
            <div className="mt-2.5 flex items-center gap-2 flex-wrap sm:flex-nowrap w-full">
              <button
                id="home-share-family-btn"
                type="button"
                onClick={onOpenFamilyShare}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition cursor-pointer min-w-0"
                title="Compartilhar prontuário"
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="truncate">Compartilhar prontuário</span>
              </button>

              <button
                id="home-enter-family-code-btn"
                type="button"
                onClick={onOpenEnterCode}
                className="py-2.5 px-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
                title="Entrar com Código Familiar fornecido pelo outro responsável"
              >
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>Código</span>
              </button>

              <button
                type="button"
                onClick={onAddChild}
                className="py-2.5 px-3 rounded-xl border border-sky-200/80 bg-white hover:bg-sky-50 text-sky-600 text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition cursor-pointer shrink-0"
                title="Cadastrar outro filho"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Outro filho</span>
              </button>
            </div>
          ) : (
            <div className="mt-2.5">
              <button
                id="home-enter-family-code-btn-empty"
                type="button"
                onClick={onOpenEnterCode}
                className="w-full py-2.5 px-3 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100/80 text-indigo-800 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
              >
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Já recebeu um convite? Entrar com Código Familiar</span>
              </button>
            </div>
          )}
        </div>

        {/* Highlight notification bar if there are alterations or upcoming appointment */}
        {alterationExams.length > 0 && (
          <div
            onClick={() => onNavigate('exames')}
            className="mb-4 p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-2 shadow-2xs cursor-pointer hover:bg-amber-100/80 transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                <AlertCircle className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-amber-950 truncate">
                  {alterationExams.length} exame(s) com alterações registradas
                </p>
                <p className="text-xs font-semibold text-amber-800 truncate">
                  Toque para revisar Raio-X ou Hemograma
                </p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-amber-500 shrink-0" />
          </div>
        )}

        {/* 6 Main Action Cards (2 Columns on mobile, 3 Columns on tablet/panel) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-6">
          {/* 1. Consultas */}
          <button
            onClick={() => onNavigate('consultas')}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition duration-200">
              <Calendar className="w-7.5 h-7.5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-blue-600 transition">
                Consultas
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {consultas.length} registros
              </span>
            </div>
          </button>

          {/* 2. Exames */}
          <button
            onClick={() => onNavigate('exames')}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition duration-200">
              <FlaskConical className="w-7.5 h-7.5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-blue-600 transition">
                Exames
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {exames.length} exames ({alterationExams.length} alterados)
              </span>
            </div>
          </button>

          {/* 3. Vacinas */}
          <button
            onClick={() => onNavigate('vacinas')}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-emerald-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-200 relative">
              <Syringe className="w-7.5 h-7.5 stroke-[2]" />
              {appliedVacinas.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              )}
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-emerald-600 transition">
                Vacinas
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {appliedVacinas.length} aplicadas • SUS & Priv.
              </span>
            </div>
          </button>

          {/* 4. Eventos */}
          <button
            onClick={() => onNavigate('eventos')}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-amber-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition duration-200 relative">
              <Activity className="w-7.5 h-7.5 stroke-[2]" />
              {observingEvents.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
              )}
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-amber-600 transition">
                Eventos
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {eventos.length} {eventos.length === 1 ? 'registro' : 'registros'}
                {observingEvents.length > 0 ? ` (${observingEvents.length} em obs.)` : ''}
              </span>
            </div>
          </button>

          {/* 4. Receitas */}
          <button
            onClick={() => onNavigate('receitas')}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-amber-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition duration-200">
              <FileText className="w-7.5 h-7.5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-amber-600 transition">
                Receitas
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {activeReceitas.length} ativas de {receitas.length}
              </span>
            </div>
          </button>

          {/* 5. Documentos */}
          <button
            onClick={() => onNavigate('documentos')}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition duration-200">
              <FolderClosed className="w-7.5 h-7.5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-blue-600 transition">
                Documentos
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {documentos.length} arquivados
              </span>
            </div>
          </button>

          {/* 6. Lembretes */}
          <button
            onClick={() => onNavigate('lembretes')}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-orange-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition duration-200 relative">
              <Bell className="w-7.5 h-7.5 stroke-[2]" />
              {pendingReminders.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-orange-600 transition">
                Lembretes
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {pendingReminders.length} pendentes
              </span>
            </div>
          </button>

          {/* 7. Perfil */}
          <button
            onClick={() => onNavigate('perfil')}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-blue-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition duration-200">
              <User className="w-7.5 h-7.5 stroke-[2]" />
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-blue-600 transition">
                Perfil
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Dados & vacinas
              </span>
            </div>
          </button>

          {/* 8. Família / Compartilhar */}
          <button
            onClick={() => {
              if (onOpenFamilyShare) onOpenFamilyShare();
              else onNavigate('perfil');
            }}
            className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs hover:shadow-md hover:border-rose-300 transition text-center flex flex-col items-center justify-center gap-2.5 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition duration-200 relative">
              <HeartHandshake className="w-7.5 h-7.5 stroke-[2]" />
              {pendingShares && pendingShares.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </div>
            <div>
              <span className="block text-base font-black text-slate-800 group-hover:text-rose-600 transition">
                Família
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Compartilhar acesso
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom section with baby giraffe illustration peeking out as in mockup */}
      <div
        className={`relative pt-6 flex items-end ${
          nextRealEvent ? 'justify-between' : 'justify-end'
        } select-none`}
      >
        {nextRealEvent && (
          <button
            onClick={() => onNavigate(nextRealEvent.view)}
            className="text-[11px] font-bold text-sky-800 bg-sky-100/90 hover:bg-sky-200/90 active:scale-95 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-sky-200/70 shadow-2xs transition cursor-pointer max-w-[calc(100%-85px)]"
            title="Ir para o agendamento"
            id="next-event-badge-btn"
          >
            <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">{nextRealEvent.label}</span>
          </button>
        )}

        {/* Baby Giraffe peaking from bottom right exactly like in Ideia.png Screen 2 */}
        <div className="relative -mb-5 -mr-2 shrink-0">
          <BabyGiraffe size={75} />
        </div>
      </div>
    </div>
  );
};
