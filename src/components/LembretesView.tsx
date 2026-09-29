import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  FlaskConical,
  RotateCcw,
  Pill,
  Syringe,
  Heart,
  Plus,
  CheckCircle2,
  Trash2,
  ChevronRight,
  X,
  Bell,
  Clock,
  Volume2,
  VolumeX,
  Play,
  Sliders,
  Sparkles,
  Info,
  Check,
  Smartphone,
  Loader2,
} from 'lucide-react';
import { Lembrete } from '../types';
import {
  REMINDER_SOUND_OPTIONS,
  ReminderSoundId,
  playReminderSound,
} from '../utils/reminderSounds';

interface LembretesViewProps {
  lembretes: Lembrete[];
  childId: string;
  onBack: () => void;
  onAddLembrete: (lembrete: Omit<Lembrete, 'id'>) => void;
  onToggleComplete: (id: string) => void;
  onDeleteLembrete: (id: string) => void;
  onUpdateLembrete?: (id: string, updated: Partial<Lembrete>) => void;
}

export const LembretesView: React.FC<LembretesViewProps> = ({
  lembretes,
  childId,
  onBack,
  onAddLembrete,
  onToggleComplete,
  onDeleteLembrete,
  onUpdateLembrete,
}) => {
  const [filter, setFilter] = useState<'Todas' | 'Agendada' | 'Realizada'>('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLembrete, setEditingLembrete] = useState<Lembrete | null>(null);

  // Form state for new reminder
  const [type, setType] = useState<Lembrete['type']>('Consulta');
  const [subtitle, setSubtitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [newStatus, setNewStatus] = useState<'Agendada' | 'Realizada'>('Agendada');
  const [notifyHoursBefore, setNotifyHoursBefore] = useState<number>(24);
  const [soundId, setSoundId] = useState<ReminderSoundId>('gentle_bell');
  const [customHours, setCustomHours] = useState('');

  // Form state for editing existing reminder
  const [editHoursBefore, setEditHoursBefore] = useState<number>(24);
  const [editSoundId, setEditSoundId] = useState<ReminderSoundId>('gentle_bell');
  const [editCustomHours, setEditCustomHours] = useState('');
  const [editCompleted, setEditCompleted] = useState<boolean>(false);

  // Sound testing state
  const [currentlyPlayingSound, setCurrentlyPlayingSound] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Info modal for PWA / installation guidance
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  const toDisplayDate = (val?: string): string => {
    if (!val) return '';
    const clean = val.trim();
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        return `${parts[2].substring(0, 2).padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      }
    }
    return clean;
  };

  const handleTestSound = (sId: ReminderSoundId) => {
    setCurrentlyPlayingSound(sId);
    playReminderSound(sId);
    setTimeout(() => {
      setCurrentlyPlayingSound((current) => (current === sId ? null : current));
    }, 1600);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!subtitle.trim()) return;

    const formattedDate = toDisplayDate(date);

    // Prevenção contra salvamento duplo de lembrete
    const isDuplicate = lembretes.some(
      (l) =>
        l.childId === (childId || 'default') &&
        l.type === type &&
        l.date === formattedDate &&
        l.time === time &&
        l.subtitle.toLowerCase().includes(subtitle.trim().toLowerCase())
    );
    if (isDuplicate) {
      alert('Este lembrete já foi cadastrado para esta data e horário.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalHours = customHours ? Math.max(1, parseInt(customHours, 10) || 24) : notifyHoursBefore;

      await onAddLembrete({
        childId: childId || 'default',
        type,
        title: type === 'Consulta' ? 'Consulta Médica' : type === 'Exame' ? 'Exame Agendado' : type,
        subtitle: `${subtitle.trim()}\n${formattedDate} • ${time}`,
        date: formattedDate,
        time,
        completed: newStatus === 'Realizada',
        notifyHoursBefore: finalHours,
        soundId,
      });

      setSubtitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('09:00');
      setNewStatus('Agendada');
      setNotifyHoursBefore(24);
      setCustomHours('');
      setSoundId('gentle_bell');
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (lem: Lembrete) => {
    setEditingLembrete(lem);
    setEditHoursBefore(lem.notifyHoursBefore ?? 24);
    setEditSoundId((lem.soundId as ReminderSoundId) || 'gentle_bell');
    setEditCustomHours('');
    setEditCompleted(lem.completed ?? false);
  };

  const handleSaveEdit = () => {
    if (!editingLembrete || !onUpdateLembrete) return;
    const finalHours = editCustomHours ? Math.max(1, parseInt(editCustomHours, 10) || 24) : editHoursBefore;

    onUpdateLembrete(editingLembrete.id, {
      notifyHoursBefore: finalHours,
      soundId: editSoundId,
      completed: editCompleted,
    });
    setEditingLembrete(null);
  };

  const getLembreteIcon = (itemType: Lembrete['type']) => {
    switch (itemType) {
      case 'Consulta':
        return (
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'Exame':
        return (
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-blue-500 border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
            <FlaskConical className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'Retorno':
        return (
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
            <RotateCcw className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'Vacina':
        return (
          <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Syringe className="w-5 h-5 stroke-[2]" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Pill className="w-5 h-5 stroke-[2]" />
          </div>
        );
    }
  };

  const getSoundName = (sId?: string) => {
    const found = REMINDER_SOUND_OPTIONS.find((s) => s.id === sId);
    return found ? found.name : 'Sininho Suave (Padrão)';
  };

  const counts = {
    Todas: lembretes.length,
    Agendada: lembretes.filter((l) => !l.completed).length,
    Realizada: lembretes.filter((l) => l.completed).length,
  };

  // Helper to parse reminder date (DD/MM/YYYY or YYYY-MM-DD) and time (HH:MM) to timestamp for chronological ordering
  const parseReminderTimestamp = (dateStr?: string, timeStr?: string): number => {
    if (!dateStr) return 0;
    let day = 1;
    let month = 0;
    let year = 2026;

    const cleanDate = dateStr.trim();
    if (cleanDate.includes('/')) {
      const parts = cleanDate.split('/');
      if (parts.length >= 3) {
        day = parseInt(parts[0], 10) || 1;
        month = (parseInt(parts[1], 10) || 1) - 1;
        year = parseInt(parts[2], 10) || 2026;
      }
    } else if (cleanDate.includes('-')) {
      const parts = cleanDate.split('-');
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          year = parseInt(parts[0], 10) || 2026;
          month = (parseInt(parts[1], 10) || 1) - 1;
          day = parseInt(parts[2], 10) || 1;
        } else {
          day = parseInt(parts[0], 10) || 1;
          month = (parseInt(parts[1], 10) || 1) - 1;
          year = parseInt(parts[2], 10) || 2026;
        }
      }
    }

    let hours = 0;
    let minutes = 0;
    if (timeStr && timeStr.trim()) {
      const timeParts = timeStr.trim().split(':');
      if (timeParts.length >= 2) {
        hours = parseInt(timeParts[0], 10) || 0;
        minutes = parseInt(timeParts[1], 10) || 0;
      }
    }

    return new Date(year, month, day, hours, minutes, 0, 0).getTime();
  };

  const filteredLembretes = lembretes
    .filter((item) => {
      if (filter === 'Todas') return true;
      if (filter === 'Realizada') return item.completed === true;
      if (filter === 'Agendada') return !item.completed;
      return true;
    })
    .sort((a, b) => {
      const timeA = parseReminderTimestamp(a.date, a.time);
      const timeB = parseReminderTimestamp(b.date, b.time);
      return timeA - timeB;
    });

  return (
    <div className="flex-1 flex flex-col bg-[#F3F8FE] overflow-hidden">
      {/* Top Header */}
      <header className="px-5 pt-3.5 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-lg cursor-pointer"
        >
          <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          <span>Lembretes</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstallHelp(true)}
            className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
            title="Como receber no celular"
          >
            <Smartphone className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-2 px-3.5 rounded-full bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo</span>
          </button>
        </div>
      </header>

      {/* Reminders List */}
      <div className="p-3.5 sm:p-5 space-y-3 flex-1 overflow-y-auto no-scrollbar">
        {/* Filter Tabs matching ConsultasView (Todas | Agendadas | Realizadas - Corre com a tela) */}
        <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
          {(['Todas', 'Agendada', 'Realizada'] as const).map((tab) => {
            const count = counts[tab];
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  filter === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{tab === 'Todas' ? 'Todas' : tab === 'Agendada' ? 'Agendadas' : 'Realizadas'}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === tab
                      ? 'bg-white/25 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notice Banner: Sincronização e Alertas */}
        <div className="p-3 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 rounded-2xl border border-blue-100/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-bold text-slate-800">
              Alertas automáticos com som personalizável
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
              Consultas e exames criam lembretes automaticamente. Padrão: <strong>24h antes</strong> com pop-up e som no seu celular.
            </p>
          </div>
          <button
            onClick={() => setShowInstallHelp(true)}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 shrink-0 self-center underline cursor-pointer"
          >
            Ajuda
          </button>
        </div>
        {filteredLembretes.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-2xs my-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-7 h-7 stroke-[2]" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">
              {filter === 'Agendada'
                ? 'Nenhum lembrete agendado'
                : filter === 'Realizada'
                ? 'Nenhum lembrete realizado'
                : 'Nenhum lembrete cadastrado'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
              {filter === 'Agendada'
                ? 'Todos os lembretes já foram concluídos ou você ainda não possui novos agendamentos.'
                : filter === 'Realizada'
                ? 'Nenhum lembrete marcado como concluído ainda.'
                : 'Agende uma consulta ou exame para criar lembretes automáticos, ou crie um lembrete personalizado agora.'}
            </p>
            {filter !== 'Realizada' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Lembrete</span>
              </button>
            )}
          </div>
        ) : (
          filteredLembretes.map((item) => {
            const hoursBefore = item.notifyHoursBefore ?? 24;
            const itemSoundId = (item.soundId as ReminderSoundId) || 'gentle_bell';
            const isPlayingThis = currentlyPlayingSound === itemSoundId;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border transition flex flex-col gap-3 shadow-2xs ${
                  item.completed ? 'opacity-70 border-slate-200 bg-slate-50/40' : 'border-slate-100 hover:border-sky-300'
                }`}
              >
                {/* 1. Tipo, Status e Descrição ocupando 100% da largura do painel */}
                <div className="flex items-start gap-3 w-full">
                  <div className="shrink-0 mt-0.5">
                    {getLembreteIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                      {item.relatedId && (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Sincronizado
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-black text-slate-800 whitespace-pre-line leading-snug mt-1 break-words">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {/* 2. Barra inferior com Status reordenado, Configuração de Som e Ações */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Status Badge reordenado para liberar todo o espaço ao nome do médico/procedimento */}
                    {item.completed ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Realizada</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200/70 px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Agendada</span>
                      </span>
                    )}

                    {/* Antecedence pill */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-sky-800 text-[11px] font-bold">
                      <Clock className="w-3 h-3 text-sky-600" />
                      <span>Avisar {hoursBefore}h antes</span>
                    </span>

                    {/* Sound Pill with play button */}
                    <button
                      onClick={() => handleTestSound(itemSoundId)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition cursor-pointer active:scale-95 ${
                        isPlayingThis
                          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="Clique para testar o som do lembrete"
                    >
                      {isPlayingThis ? (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
                          <span>Tocando...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-slate-500 text-slate-500" />
                          <span>{REMINDER_SOUND_OPTIONS.find((s) => s.id === itemSoundId)?.name || 'Som'}</span>
                        </>
                      )}
                    </button>

                    {/* Edit settings button */}
                    {onUpdateLembrete && (
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-blue-600 hover:bg-blue-50 font-bold text-[11px] transition cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Configurar</span>
                      </button>
                    )}
                  </div>

                  {/* Actions: Complete & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                        item.completed
                          ? 'text-emerald-600 bg-emerald-100 hover:bg-emerald-200'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={item.completed ? 'Marcado como Realizada (clique para voltar para Agendada)' : 'Marcar como Realizada'}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDeleteLembrete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Excluir lembrete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Section "Próximos 7 dias" */}
        <div className="p-6 text-center border-t border-slate-200/50 bg-white/60 rounded-2xl mt-4 relative">
          <p className="text-sm font-black text-slate-700 mb-0.5">
            Prontuário Baby • Lembretes
          </p>
          <p className="text-xs font-medium text-slate-400">
            Você será avisado no horário previsto com o toque selecionado
          </p>

          <div className="absolute bottom-4 right-6 text-rose-300">
            <Heart className="w-4 h-4 text-rose-300 fill-rose-100" />
          </div>
        </div>
      </div>

      {/* Edit Reminder Sound / Hours Modal */}
      {editingLembrete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Personalização
                </span>
                <h3 className="text-base font-black text-slate-800 mt-1">
                  Configurar Lembrete & Alarme
                </h3>
              </div>
              <button
                onClick={() => setEditingLembrete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto no-scrollbar flex-1 pr-0.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Lembrete selecionado:</span>
                <p className="text-xs font-bold text-slate-800 whitespace-pre-line">
                  {editingLembrete.subtitle}
                </p>
              </div>

              {/* Status do Lembrete */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Status do Lembrete
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditCompleted(false)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      !editCompleted
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Agendada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditCompleted(true)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      editCompleted
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Realizada</span>
                  </button>
                </div>
              </div>

              {/* Hours before configuration */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Avisar quantas horas antes?
                  </span>
                  <span className="text-[11px] font-bold text-blue-600">
                    Padrão: 24 horas
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[
                    { label: '1 hora antes', value: 1 },
                    { label: '2 horas antes', value: 2 },
                    { label: '4 horas antes', value: 4 },
                    { label: '12 horas antes', value: 12 },
                    { label: '24 horas (Padrão)', value: 24 },
                    { label: '48 horas (2 dias)', value: 48 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setEditHoursBefore(opt.value);
                        setEditCustomHours('');
                      }}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center ${
                        editHoursBefore === opt.value && !editCustomHours
                          ? 'bg-blue-500 text-white border-blue-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Ou digite:</span>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    placeholder="Ex: 36"
                    value={editCustomHours}
                    onChange={(e) => {
                      setEditCustomHours(e.target.value);
                      if (e.target.value) {
                        setEditHoursBefore(parseInt(e.target.value, 10) || 24);
                      }
                    }}
                    className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500">horas antes do horário previsto</span>
                </div>
              </div>

              {/* 10 Sound Options */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                    Toque do Alerta (10 opções de personalização)
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold">
                    Web Audio Sintetizado
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Escolha o som suave que tocará junto com o pop-up na tela do celular:
                </p>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {REMINDER_SOUND_OPTIONS.map((snd) => {
                    const isSelected = editSoundId === snd.id;
                    const isPlaying = currentlyPlayingSound === snd.id;

                    return (
                      <div
                        key={snd.id}
                        onClick={() => setEditSoundId(snd.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 shadow-2xs'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 text-xs truncate">
                                {snd.name}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                                {snd.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate">
                              {snd.description}
                            </p>
                          </div>
                        </div>

                        {/* Play Test Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestSound(snd.id);
                          }}
                          className={`p-2 rounded-xl transition cursor-pointer shrink-0 ${
                            isPlaying
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600'
                          }`}
                          title="Ouvir toque"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingLembrete(null)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lembrete Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800">
                Novo Lembrete de Saúde
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tipo de Lembrete
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as Lembrete['type'];
                    setType(newType);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-semibold"
                >
                  <option value="Consulta">Consulta Médica</option>
                  <option value="Exame">Exame Agendado</option>
                  <option value="Retorno">Retorno Pediátrico</option>
                  <option value="Medicamento">Medicamento / Dose</option>
                </select>
              </div>

              {/* Descrição (Médico ou Procedimento) com prioridade e largura total */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descrição (Médico ou Procedimento) *
                </label>
                <input
                  type="text"
                  required
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Dr. Carlos Silva (Pediatra) ou Ultrassom Abdominal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onClick={(e) => {
                        try {
                          (e.currentTarget as HTMLInputElement).showPicker?.();
                        } catch {}
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 cursor-pointer min-h-[42px]"
                    />
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário Previsto</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 min-h-[42px]"
                  />
                </div>
              </div>

              {/* Status do Lembrete reordenado */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus('Agendada')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      newStatus === 'Agendada'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Agendada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus('Realizada')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      newStatus === 'Realizada'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Realizada</span>
                  </button>
                </div>
              </div>

              {/* Antecedence configuration */}
              <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100">
                <label className="block font-bold text-slate-800 text-xs mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Avisar quantas horas antes?
                  </span>
                  <span className="text-[11px] font-bold text-blue-600">
                    Padrão: 24h
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[
                    { label: '24 horas (Padrão)', value: 24 },
                    { label: '2 horas antes', value: 2 },
                    { label: '4 horas antes', value: 4 },
                    { label: '12 horas antes', value: 12 },
                    { label: '48 horas (2 dias)', value: 48 },
                    { label: '72 horas (3 dias)', value: 72 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setNotifyHoursBefore(opt.value);
                        setCustomHours('');
                      }}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition cursor-pointer text-center ${
                        notifyHoursBefore === opt.value && !customHours
                          ? 'bg-blue-500 text-white border-blue-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-semibold">Personalizar:</span>
                  <input
                    type="number"
                    min="1"
                    max="720"
                    placeholder="Ex: 36"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-center bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500">horas antes</span>
                </div>
              </div>

              {/* 10 Sound Selection Options */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                    Toque do Alerta (10 Opções)
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Clique no Play para ouvir
                  </span>
                </label>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {REMINDER_SOUND_OPTIONS.map((snd) => {
                    const isSelected = soundId === snd.id;
                    const isPlaying = currentlyPlayingSound === snd.id;

                    return (
                      <div
                        key={snd.id}
                        onClick={() => setSoundId(snd.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-400 shadow-2xs'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="font-bold text-slate-800 text-xs truncate">
                            {snd.name}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestSound(snd.id);
                          }}
                          className={`p-1.5 rounded-lg transition cursor-pointer shrink-0 ${
                            isPlaying
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600'
                          }`}
                          title="Ouvir som"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Criando Lembrete...</span>
                    </>
                  ) : (
                    <span>Criar Lembrete</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA / Mobile Notification Help Modal */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-55 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowInstallHelp(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-800">
                Como os lembretes funcionam no celular?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">
                Ao chegar no horário previsto, o Prontuário Baby exibe um <strong>pop-up na tela com o som selecionado</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                Precisa instalar o aplicativo?
              </p>
              <p>
                <strong>Não é obrigatório</strong> se você estiver com o navegador aberto.
              </p>
              <p>
                <strong>Porém, é altamente recomendado instalar</strong> o app Prontuário Baby na tela inicial do celular (PWA):
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700">
                <li>Permite receber notificações mesmo com o celular bloqueado ou navegador fechado.</li>
                <li>Habilita notificações nativas do sistema no iOS (Safari &gt; Compartilhar &gt; Adicionar à Tela de Início) e Android (Instalar Aplicativo).</li>
                <li>Funciona sem barra de navegação, como um app nativo da loja!</li>
              </ul>
            </div>

            <button
              onClick={() => setShowInstallHelp(false)}
              className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
