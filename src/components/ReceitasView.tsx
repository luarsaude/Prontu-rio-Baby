import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Clock,
  Pill,
  Trash2,
  X,
  Plus,
  CheckCircle2,
  Bell,
  Volume2,
  Play,
  Check,
  Calendar,
  Sparkles,
  AlertCircle,
  ZoomIn,
  Image as ImageIcon,
  User,
} from 'lucide-react';
import { Receita, Lembrete } from '../types';
import {
  REMINDER_SOUND_OPTIONS,
  ReminderSoundId,
  playReminderSound,
} from '../utils/reminderSounds';
import { sortByDateAscending } from '../utils/dateOrder';
import { ImageViewerModal } from './ImageViewerModal';

interface ReceitasViewProps {
  receitas: Receita[];
  lembretes?: Lembrete[];
  childId: string;
  onBack: () => void;
  onNavigateToLembretes?: () => void;
  onAddReceita: (
    rec: Omit<Receita, 'id'>,
    remindersToCreate?: Array<Omit<Lembrete, 'id'>>
  ) => Promise<void> | void;
  onUpdateReceita: (id: string, updated: Partial<Receita>) => void;
  onDeleteReceita: (id: string) => void;
}

export const ReceitasView: React.FC<ReceitasViewProps> = ({
  receitas,
  lembretes = [],
  childId,
  onBack,
  onNavigateToLembretes,
  onAddReceita,
  onUpdateReceita,
  onDeleteReceita,
}) => {
  const [activeTab, setActiveTab] = useState<'Todas' | 'Ativas' | 'Antigas'>('Todas');
  const [selectedReceita, setSelectedReceita] = useState<Receita | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for manual new prescription
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [date, setDate] = useState(() => new Date().toLocaleDateString('pt-BR'));
  const [doctorName, setDoctorName] = useState('');
  const [category, setCategory] = useState('Uso Oral');

  // Medication Reminder states
  const [createReminders, setCreateReminders] = useState<boolean>(true);
  const [intervalHours, setIntervalHours] = useState<number>(8); // 8h default (3x / day)
  const [customInterval, setCustomInterval] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(7); // 7 days default
  const [customDuration, setCustomDuration] = useState<string>('');
  const [firstDoseTime, setFirstDoseTime] = useState<string>(() => {
    const now = new Date();
    const nextHour = (now.getHours() + 1) % 24;
    return `${String(nextHour).padStart(2, '0')}:00`;
  });
  const [selectedSoundId, setSelectedSoundId] = useState<ReminderSoundId>('gentle_bell');
  const [notifyMinutesBefore, setNotifyMinutesBefore] = useState<number>(0); // 0 = Na hora exata
  const [currentlyPlayingSound, setCurrentlyPlayingSound] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Deduplicate identical records (same childId, medicineName, dosage, date) to prevent double display
  const deduplicatedReceitas = receitas.filter((item, index, self) => {
    return (
      index ===
      self.findIndex(
        (other) =>
          other.id === item.id ||
          (other.childId === item.childId &&
            other.medicineName.trim().toLowerCase() === item.medicineName.trim().toLowerCase() &&
            other.dosage.trim().toLowerCase() === item.dosage.trim().toLowerCase() &&
            other.date === item.date)
      )
    );
  });

  const filteredReceitas = deduplicatedReceitas
    .filter((r) => {
      if (activeTab === 'Todas') return true;
      if (activeTab === 'Ativas') return r.status === 'Ativa';
      if (activeTab === 'Antigas') return r.status === 'Antiga';
      return true;
    })
    .sort(sortByDateAscending);

  // Calculate effective interval and duration
  const effectiveInterval = customInterval
    ? Math.max(1, parseInt(customInterval, 10) || 8)
    : intervalHours;
  const effectiveDuration = customDuration
    ? Math.max(1, parseInt(customDuration, 10) || 7)
    : durationDays;

  // Calculate doses cycle per day
  const calculateDailyDoseTimes = (firstTime: string, interval: number): string[] => {
    const times: string[] = [];
    const [firstH, firstM] = firstTime.split(':').map((s) => parseInt(s, 10) || 0);
    const dosesPerDay = Math.min(Math.floor(24 / Math.max(1, interval)), 24);

    for (let i = 0; i < dosesPerDay; i++) {
      const totalMinutes = (firstH * 60 + firstM + i * interval * 60) % (24 * 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
    return times;
  };

  const dailyDoseTimes = calculateDailyDoseTimes(firstDoseTime, effectiveInterval);
  const totalDosesPlanned = Math.min(
    Math.max(1, Math.round((effectiveDuration * 24) / effectiveInterval)),
    60
  );

  // Auto-detect interval and duration when posologia is typed or pasted
  const handleDosageChange = (val: string) => {
    setDosage(val);

    // 1. Detect interval in hours: "a cada X horas", "X em X horas", "de X em X h", "a cada Xh"
    const intervalMatch =
      val.match(/(?:a\s*cada|de)\s*(\d{1,2})\s*(?:em\s*\d{1,2}\s*)?(?:h(?:oras?)?|\b)/i) ||
      val.match(/(\d{1,2})\s*(?:em\s*|\/)\s*(\d{1,2})\s*h(?:oras?)?/i);
    if (intervalMatch) {
      const h = parseInt(intervalMatch[1], 10);
      if (h > 0 && h <= 48) {
        if ([4, 6, 8, 12, 24].includes(h)) {
          setIntervalHours(h);
          setCustomInterval('');
        } else {
          setIntervalHours(h);
          setCustomInterval(String(h));
        }
      }
    }

    // 2. Detect duration in days: "por X dias", "durante X dias", "X dias"
    const durationMatch = val.match(/(?:por|durante)\s*(\d{1,2})\s*dias?/i);
    if (durationMatch) {
      const d = parseInt(durationMatch[1], 10);
      if (d > 0 && d <= 90) {
        if ([3, 5, 7, 10, 14].includes(d)) {
          setDurationDays(d);
          setCustomDuration('');
        } else {
          setDurationDays(d);
          setCustomDuration(String(d));
        }
      }
    }
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
    if (!medicineName.trim()) return;

    // Prevenção contra salvamento duplo de receita idêntica
    const normalizedName = medicineName.trim().toLowerCase();
    const normalizedDosage = (dosage.trim() || 'conforme orientação médica').toLowerCase();
    const isDuplicate = receitas.some(
      (r) =>
        r.childId === (childId || 'default') &&
        r.medicineName.trim().toLowerCase() === normalizedName &&
        (r.dosage || '').trim().toLowerCase() === normalizedDosage &&
        r.date === date
    );

    if (isDuplicate) {
      alert('Esta receita com o mesmo medicamento, posologia e data já está cadastrada!');
      return;
    }

    setIsSubmitting(true);

    try {
      let remindersToCreate: Array<Omit<Lembrete, 'id'>> = [];

      if (createReminders) {
        let startDay = new Date().getDate();
        let startMonth = new Date().getMonth();
        let startYear = new Date().getFullYear();

        if (date && date.includes('/')) {
          const parts = date.split('/');
          if (parts.length === 3) {
            startDay = parseInt(parts[0], 10) || startDay;
            startMonth = (parseInt(parts[1], 10) - 1) || startMonth;
            startYear = parseInt(parts[2], 10) || startYear;
          }
        } else if (date && date.includes('-')) {
          const parts = date.split('-');
          if (parts.length === 3) {
            startYear = parseInt(parts[0], 10) || startYear;
            startMonth = (parseInt(parts[1], 10) - 1) || startMonth;
            startDay = parseInt(parts[2], 10) || startDay;
          }
        }

        const [firstH, firstM] = firstDoseTime.split(':').map((s) => parseInt(s, 10) || 0);
        const firstDoseTimestamp = new Date(startYear, startMonth, startDay, firstH, firstM, 0, 0).getTime();

        for (let i = 0; i < totalDosesPlanned; i++) {
          const doseDateObj = new Date(firstDoseTimestamp + i * effectiveInterval * 3600 * 1000);
          const dd = String(doseDateObj.getDate()).padStart(2, '0');
          const mm = String(doseDateObj.getMonth() + 1).padStart(2, '0');
          const yyyy = doseDateObj.getFullYear();
          const hh = String(doseDateObj.getHours()).padStart(2, '0');
          const min = String(doseDateObj.getMinutes()).padStart(2, '0');

          const doseDateStr = `${dd}/${mm}/${yyyy}`;
          const doseTimeStr = `${hh}:${min}`;
          const doseIndex = i + 1;

          remindersToCreate.push({
            childId: childId || 'default',
            type: 'Medicamento',
            title: `Remédio: ${medicineName.trim()}`,
            subtitle: `${dosage.trim() ? `Dose: ${dosage.trim()} • ` : ''}${category || 'Uso Oral'}\n${doseDateStr} às ${doseTimeStr} (${doseIndex}ª de ${totalDosesPlanned} doses)`,
            date: doseDateStr,
            time: doseTimeStr,
            completed: false,
            notifyHoursBefore: notifyMinutesBefore / 60,
            soundId: selectedSoundId,
          });
        }
      }

      await onAddReceita(
        {
          childId: childId || 'default',
          medicineName: medicineName.trim(),
          dosage: dosage.trim() || 'Conforme orientação médica',
          instructions: instructions.trim(),
          date,
          status: 'Ativa',
          doctorName: doctorName.trim(),
          category,
          intervalHours: createReminders ? effectiveInterval : undefined,
          durationDays: createReminders ? effectiveDuration : undefined,
          firstDoseTime: createReminders ? firstDoseTime : undefined,
        },
        remindersToCreate
      );

      // Reset form
      setMedicineName('');
      setDosage('');
      setDoctorName('');
      setInstructions('');
      setCustomInterval('');
      setCustomDuration('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Erro ao salvar receita:', err);
      alert('Ocorreu um erro ao salvar a receita. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to parse reminder date and time to timestamp for chronological ordering
  const parseDateTimeToTimestamp = (dateStr?: string, timeStr?: string): number => {
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

  // Helper to count reminders for a given prescription, sorted chronologically ascending
  const getPrescriptionReminders = (recId: string) => {
    return lembretes
      .filter((l) => l.relatedId === recId)
      .sort((a, b) => parseDateTimeToTimestamp(a.date, a.time) - parseDateTimeToTimestamp(b.date, b.time));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F3F8FE] overflow-hidden relative">
      {/* Top Header matching mockup Screen 5 */}
      <header className="px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-lg cursor-pointer"
        >
          <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          <span>Receitas</span>
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 rounded-full bg-sky-50 text-blue-600 hover:bg-sky-100 text-xs font-bold border border-sky-200 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Digitar</span>
        </button>
      </header>

      {/* List of Prescriptions */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-5 space-y-3 pb-24">
        {/* 3 Tabs: Todas | Ativas | Antigas (Corre com a tela) */}
        <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
          {(['Todas', 'Ativas', 'Antigas'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {filteredReceitas.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300 my-6">
            <Pill className="w-11 h-11 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-bold text-slate-600">Nenhuma receita nesta categoria</p>
            <p className="text-xs text-slate-400 mt-1">
              Use o botão 'Digitar' acima para cadastrar uma nova receita e programar lembretes.
            </p>
          </div>
        ) : (
          filteredReceitas.map((item) => {
            const linkedLembretes = getPrescriptionReminders(item.id);
            const pendingCount = linkedLembretes.filter((l) => !l.completed).length;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedReceita(item)}
                className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md hover:border-amber-300 transition flex flex-col gap-2.5 cursor-pointer group"
              >
                {/* 1. Nome do Medicamento ocupando 100% do espaço do painel */}
                <div className="flex items-start gap-3 w-full">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-6 h-6 stroke-[2]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-slate-800 leading-snug group-hover:text-blue-600 transition break-words">
                      {item.medicineName}
                    </h3>
                    {(() => {
                      const doctor = item.doctorName || (item as any).doctor;
                      return (
                        <>
                          {doctor && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mt-1 break-words w-full">
                              <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              <span className="text-slate-500 font-semibold">Médico Prescritor:</span>
                              <span className="text-slate-800 font-bold">{doctor}</span>
                            </div>
                          )}
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">
                            Receita de {item.date}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Posologia destacada com largura total */}
                {item.dosage && (
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 font-medium">
                    <span className="font-bold text-slate-800">Posologia:</span> {item.dosage}
                  </div>
                )}

                {/* 2. Campo Status reordenado + Data, Lembretes e Ação na barra inferior */}
                <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    {/* Status Badge reordenado para a linha inferior */}
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                        item.status === 'Ativa'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      <span>{item.date}</span>
                    </span>

                    {linkedLembretes.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                        <Bell className="w-3 h-3 text-amber-500" />
                        <span>{pendingCount > 0 ? `${pendingCount} doses pendentes` : 'Todas doses tomadas'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-blue-600 font-bold text-xs group-hover:translate-x-0.5 transition ml-auto">
                    <span>Ver receita</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Receita Modal */}
      {selectedReceita && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">
                  {selectedReceita.medicineName}
                </h3>
                {/* Campo Status reordenado logo abaixo com data da receita */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                      selectedReceita.status === 'Ativa'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {selectedReceita.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Prescrito em: {selectedReceita.date}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedReceita(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer shrink-0"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Médico prescritor com destaque ocupando toda a largura */}
            {(() => {
              const doc = selectedReceita.doctorName || (selectedReceita as any).doctor;
              if (!doc) return null;
              return (
                <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-100 mb-4 w-full">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Médico Prescritor</span>
                    <span className="text-sm font-black text-slate-800 break-words">{doc}</span>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 mb-4 border border-slate-100">
              <div>
                <span className="font-bold text-slate-800 block text-xs mb-0.5">
                  Posologia e Dosagem:
                </span>
                <p className="text-blue-700 font-bold text-sm bg-blue-50/70 p-2 rounded-xl border border-blue-100">
                  {selectedReceita.dosage}
                </p>
              </div>

              {selectedReceita.instructions && (
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">
                    Instruções de Uso:
                  </span>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {selectedReceita.instructions}
                  </p>
                </div>
              )}

              {selectedReceita.doctorName && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Médico prescritor: {selectedReceita.doctorName}</span>
                </div>
              )}

              {selectedReceita.fileUrl && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="font-bold text-slate-800 block text-xs mb-1.5 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                    Foto da Receita Médica Anexa:
                  </span>
                  <div
                    onClick={() => setPreviewImage(selectedReceita.fileUrl!)}
                    className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-48 cursor-pointer group hover:border-blue-400 transition shadow-2xs flex items-center justify-center"
                    title="Clique para dar zoom na receita médica"
                  >
                    <img
                      src={selectedReceita.fileUrl}
                      alt="Foto da receita médica"
                      className="max-h-48 w-full object-contain group-hover:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition flex items-center justify-center gap-1.5 text-white font-bold text-xs">
                      <ZoomIn className="w-5 h-5 drop-shadow" />
                      <span className="drop-shadow">Toque para dar Zoom</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Linked Reminders details if present */}
            {(() => {
              const linked = getPrescriptionReminders(selectedReceita.id);
              if (linked.length === 0) return null;
              const pendingDoses = linked.filter((l) => !l.completed);
              const doneDoses = linked.filter((l) => l.completed);

              return (
                <div className="mb-4 bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-amber-600" />
                      Lembretes de Doses ({linked.length})
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {pendingDoses.length} pendentes • {doneDoses.length} tomadas
                    </span>
                  </div>

                  <p className="text-amber-800 text-[11px] mb-2 leading-relaxed">
                    Os horários programados foram adicionados à sua agenda de Lembretes com alarme.
                  </p>

                  {/* List first 4 upcoming doses */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {linked.slice(0, 5).map((lem) => (
                      <div
                        key={lem.id}
                        className={`flex items-center justify-between p-2 rounded-xl text-[11px] border ${
                          lem.completed
                            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                            : 'bg-white border-amber-200 text-slate-700 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              lem.completed ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span className="font-bold">{lem.date} às {lem.time}</span>
                          <span className="text-slate-400 text-[10px] truncate">
                            {lem.completed ? '(Tomado)' : '(Pendente)'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {linked.length > 5 && (
                      <p className="text-[10px] text-center text-amber-700 pt-1">
                        + {linked.length - 5} outras doses programadas
                      </p>
                    )}
                  </div>

                  {onNavigateToLembretes && (
                    <button
                      onClick={() => {
                        setSelectedReceita(null);
                        onNavigateToLembretes();
                      }}
                      className="w-full mt-2.5 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Ver e Gerenciar na Tela de Lembretes</span>
                    </button>
                  )}
                </div>
              );
            })()}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const nextStatus = selectedReceita.status === 'Ativa' ? 'Antiga' : 'Ativa';
                  onUpdateReceita(selectedReceita.id, { status: nextStatus });
                  setSelectedReceita({ ...selectedReceita, status: nextStatus });
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-sky-50 text-blue-600 hover:bg-sky-100 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  Mudar para {selectedReceita.status === 'Ativa' ? 'Antiga' : 'Ativa'}
                </span>
              </button>

              <button
                onClick={() => {
                  onDeleteReceita(selectedReceita.id);
                  setSelectedReceita(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                title="Excluir receita e lembretes vinculados"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Prescription Modal with Reminder Fields */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Nova Receita Médica
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Com programação automática de horários
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              {/* Nome do Medicamento */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Medicamento *
                </label>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="Ex: Amoxicilina 250mg ou Dipirona Gotas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Posologia / Dosagem */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    Posologia / Dosagem *
                  </label>
                  <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    Auto-detecta horários
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={dosage}
                  onChange={(e) => handleDosageChange(e.target.value)}
                  placeholder="Ex: 5ml a cada 8 horas por 7 dias"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Data e Via / Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Início</label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Via / Tipo</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Uso Oral">Uso Oral</option>
                    <option value="Gotas">Gotas</option>
                    <option value="Xarope">Xarope</option>
                    <option value="Uso Tópico / Pomada">Uso Tópico</option>
                    <option value="Nasal">Nasal</option>
                    <option value="Inalação">Inalação</option>
                    <option value="Ocular">Ocular</option>
                  </select>
                </div>
              </div>

              {/* ========================================================= */}
              {/* SEÇÃO DE LEMBRETES DE MEDICAÇÃO (POSOLOGIA E HORÁRIOS) */}
              {/* ========================================================= */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-sky-50/60 to-indigo-50/40 border border-blue-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-xs">
                        Lembretes de Medicação
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Criar um lembrete para cada horário da dose
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={createReminders}
                      onChange={(e) => setCreateReminders(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {createReminders && (
                  <div className="space-y-3 pt-1 border-t border-blue-100">
                    {/* Intervalo entre Doses */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1.5">
                        Intervalo entre doses (Posologia)
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { hours: 4, label: '4 em 4h', sub: '6x/dia' },
                          { hours: 6, label: '6 em 6h', sub: '4x/dia' },
                          { hours: 8, label: '8 em 8h', sub: '3x/dia' },
                          { hours: 12, label: '12 em 12h', sub: '2x/dia' },
                          { hours: 24, label: '1x ao dia', sub: '24h' },
                        ].map((opt) => (
                          <button
                            key={opt.hours}
                            type="button"
                            onClick={() => {
                              setIntervalHours(opt.hours);
                              setCustomInterval('');
                            }}
                            className={`py-1.5 px-2 rounded-xl text-center border transition cursor-pointer flex flex-col items-center justify-center ${
                              intervalHours === opt.hours && !customInterval
                                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50/50'
                            }`}
                          >
                            <span className="font-bold text-[11px] leading-tight">
                              {opt.label}
                            </span>
                            <span
                              className={`text-[9px] ${
                                intervalHours === opt.hours && !customInterval
                                  ? 'text-blue-100'
                                  : 'text-slate-400'
                              }`}
                            >
                              {opt.sub}
                            </span>
                          </button>
                        ))}

                        {/* Personalizado */}
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="48"
                            value={customInterval}
                            onChange={(e) => {
                              setCustomInterval(e.target.value);
                            }}
                            placeholder="Outro (h)"
                            className={`w-full h-full py-1.5 px-2 rounded-xl text-center border text-[11px] font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                              customInterval
                                ? 'bg-blue-600 text-white placeholder-blue-200 border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Horário da 1ª Dose e Duração */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Horário da 1ª Dose
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            required={createReminders}
                            value={firstDoseTime}
                            onChange={(e) => setFirstDoseTime(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 text-xs mb-1">
                          Duração (dias)
                        </label>
                        <div className="flex gap-1">
                          {[3, 5, 7, 10].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setDurationDays(d);
                                setCustomDuration('');
                              }}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                durationDays === d && !customDuration
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-600 border-slate-200'
                              }`}
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Live Preview of Calculated Daily Hours */}
                    <div className="bg-white/95 rounded-xl p-2.5 border border-blue-100 shadow-2xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          Horários diários calculados:
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          {dailyDoseTimes.length} doses / dia
                        </span>
                      </div>

                      {/* Badges dos horários do dia */}
                      <div className="flex flex-wrap gap-1.5">
                        {dailyDoseTimes.map((tm, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 py-1 px-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {tm}
                          </span>
                        ))}
                      </div>

                      <p className="text-[10px] text-slate-500 mt-2 font-medium">
                        Total de <strong className="text-slate-800">{totalDosesPlanned} lembretes</strong> programados com alarme para o tratamento de {effectiveDuration} dias.
                      </p>
                    </div>

                    {/* Som do Alarme / Notificação */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-700 text-xs flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                          Toque do Alarme
                        </label>
                        <button
                          type="button"
                          onClick={() => handleTestSound(selectedSoundId)}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Play
                            className={`w-3 h-3 ${
                              currentlyPlayingSound === selectedSoundId ? 'text-emerald-500 animate-pulse' : ''
                            }`}
                          />
                          Ouvir toque
                        </button>
                      </div>

                      <select
                        value={selectedSoundId}
                        onChange={(e) => {
                          const val = e.target.value as ReminderSoundId;
                          setSelectedSoundId(val);
                          handleTestSound(val);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {REMINDER_SOUND_OPTIONS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name} ({opt.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notificar com antecedência */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">
                        Avisar com antecedência:
                      </label>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { val: 0, label: 'Na hora' },
                          { val: 5, label: '5 min' },
                          { val: 10, label: '10 min' },
                          { val: 15, label: '15 min' },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setNotifyMinutesBefore(item.val)}
                            className={`py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                              notifyMinutesBefore === item.val
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Médico Prescritor */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Médico Prescritor (opcional)
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Ex: Dr. Carlos Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Instruções Adicionais */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Instruções Adicionais (opcional)
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Ex: Tomar após as refeições, manter refrigerado..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-full font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-blue-400 text-white cursor-not-allowed opacity-80'
                      : 'bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white cursor-pointer'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando receita e lembretes...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>
                        Salvar Receita {createReminders ? `(${totalDosesPlanned} Lembretes)` : ''}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal with Zoom */}
      {previewImage && (
        <ImageViewerModal
          imageUrl={previewImage}
          title="Foto da Receita Médica"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
