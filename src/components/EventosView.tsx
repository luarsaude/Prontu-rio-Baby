import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Edit2,
  X,
  Camera,
  Image as ImageIcon,
  Paperclip,
  ZoomIn,
  Loader2,
  Pill,
  Stethoscope,
  ShieldAlert,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Evento } from '../types';
import { uploadMedicalPhotoToSupabase } from '../services/supabase';
import { sortByDateAscending } from '../utils/dateOrder';
import { ImageViewerModal } from './ImageViewerModal';

interface EventosViewProps {
  eventos: Evento[];
  childId: string;
  onBack: () => void;
  onAddEvento: (evento: Omit<Evento, 'id'>) => Promise<void> | void;
  onUpdateEvento: (id: string, updated: Partial<Evento>) => Promise<{ error: string | null } | void> | void;
  onDeleteEvento: (id: string) => Promise<void> | void;
}

export const EventosView: React.FC<EventosViewProps> = ({
  eventos,
  childId,
  onBack,
  onAddEvento,
  onUpdateEvento,
  onDeleteEvento,
}) => {
  const [filter, setFilter] = useState<'Todos' | 'Em observação' | 'Resolvido'>('Todos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);

  // Form State - Novo Evento
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [time, setTime] = useState(() => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [status, setStatus] = useState<'Em observação' | 'Resolvido'>('Em observação');
  const [usingMedication, setUsingMedication] = useState(false);
  const [medicationDetails, setMedicationDetails] = useState('');
  const [undergoingTreatment, setUndergoingTreatment] = useState(false);
  const [treatmentDetails, setTreatmentDetails] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [referredToDoctor, setReferredToDoctor] = useState(false);
  const [doctorReferralDetails, setDoctorReferralDetails] = useState('');
  const [addAttachments, setAddAttachments] = useState<string[]>([]);
  const [isUploadingAdd, setIsUploadingAdd] = useState(false);
  const [uploadAddError, setUploadAddError] = useState<string | null>(null);
  const [isSavingAdd, setIsSavingAdd] = useState(false);

  const addCameraInputRef = useRef<HTMLInputElement>(null);
  const addGalleryInputRef = useRef<HTMLInputElement>(null);

  // Form State - Edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEventoId, setEditingEventoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('09:00');
  const [editStatus, setEditStatus] = useState<'Em observação' | 'Resolvido'>('Em observação');
  const [editUsingMedication, setEditUsingMedication] = useState(false);
  const [editMedicationDetails, setEditMedicationDetails] = useState('');
  const [editUndergoingTreatment, setEditUndergoingTreatment] = useState(false);
  const [editTreatmentDetails, setEditTreatmentDetails] = useState('');
  const [editActionTaken, setEditActionTaken] = useState('');
  const [editReferredToDoctor, setEditReferredToDoctor] = useState(false);
  const [editDoctorReferralDetails, setEditDoctorReferralDetails] = useState('');
  const [editAttachments, setEditAttachments] = useState<string[]>([]);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
  const [uploadEditError, setUploadEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [saveEditError, setSaveEditError] = useState<string | null>(null);

  const editCameraInputRef = useRef<HTMLInputElement>(null);
  const editGalleryInputRef = useRef<HTMLInputElement>(null);

  // Lightbox
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const toDisplayDate = (val?: string): string => {
    if (!val) return '';
    const clean = val.trim();
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          return `${parts[2].substring(0, 2).padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
        }
      }
    }
    return clean;
  };

  const toInputDate = (val?: string): string => {
    if (!val) {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    const clean = val.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length >= 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].substring(0, 4);
        return `${year}-${month}-${day}`;
      }
    }
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].substring(0, 2).padStart(2, '0')}`;
        } else if (parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
    }
    return clean;
  };

  const handleOpenEditModal = (ev: Evento) => {
    setEditingEventoId(ev.id);
    setEditTitle(ev.title || '');
    setEditDate(toInputDate(ev.date));
    setEditTime(ev.time || '09:00');
    setEditStatus(ev.status || 'Em observação');
    setEditUsingMedication(!!ev.usingMedication);
    setEditMedicationDetails(ev.medicationDetails || '');
    setEditUndergoingTreatment(!!ev.undergoingTreatment);
    setEditTreatmentDetails(ev.treatmentDetails || '');
    setEditActionTaken(ev.actionTaken || '');
    setEditReferredToDoctor(!!ev.referredToDoctor);
    setEditDoctorReferralDetails(ev.doctorReferralDetails || '');
    setEditAttachments(
      ev.attachments && ev.attachments.length > 0
        ? [...ev.attachments]
        : ev.fileUrl
        ? [ev.fileUrl]
        : []
    );
    setUploadEditError(null);
    setSaveEditError(null);
    setShowEditModal(true);
  };

  // Upload handlers
  const handleAddPhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAdd(true);
    setUploadAddError(null);

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      const { url, error } = await uploadMedicalPhotoToSupabase(file, 'eventos');
      if (error) {
        setUploadAddError(error);
      } else if (url) {
        setAddAttachments((prev) => [...prev, url]);
      }
    }

    setIsUploadingAdd(false);
    if (e.target) e.target.value = '';
  };

  const handleEditPhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingEdit(true);
    setUploadEditError(null);

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      const { url, error } = await uploadMedicalPhotoToSupabase(file, 'eventos');
      if (error) {
        setUploadEditError(error);
      } else if (url) {
        setEditAttachments((prev) => [...prev, url]);
      }
    }

    setIsUploadingEdit(false);
    if (e.target) e.target.value = '';
  };

  const handleSaveNewEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedDate = toDisplayDate(date);
    const eventTime = time || '09:00';

    // Prevenção contra salvamento duplo de evento
    const isDuplicate = eventos.some(
      (ev) =>
        ev.childId === childId &&
        ev.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        ev.date === formattedDate &&
        ev.time === eventTime
    );
    if (isDuplicate) {
      alert('Esta ocorrência médica já foi cadastrada para esta data e horário.');
      return;
    }

    setIsSavingAdd(true);
    try {
      await onAddEvento({
        childId,
        title: title.trim(),
        date: formattedDate,
        time: eventTime,
        status,
        usingMedication,
        medicationDetails: usingMedication ? medicationDetails.trim() : '',
        undergoingTreatment,
        treatmentDetails: undergoingTreatment ? treatmentDetails.trim() : '',
        actionTaken: actionTaken.trim(),
        referredToDoctor,
        doctorReferralDetails: referredToDoctor ? doctorReferralDetails.trim() : '',
        attachments: addAttachments,
        fileUrl: addAttachments.length > 0 ? addAttachments[0] : undefined,
      });

      // Reset
      setTitle('');
      setActionTaken('');
      setUsingMedication(false);
      setMedicationDetails('');
      setUndergoingTreatment(false);
      setTreatmentDetails('');
      setReferredToDoctor(false);
      setDoctorReferralDetails('');
      setAddAttachments([]);
      setShowAddModal(false);
    } finally {
      setIsSavingAdd(false);
    }
  };

  const handleSaveEditEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventoId || !editTitle.trim()) return;

    setIsSavingEdit(true);
    setSaveEditError(null);

    const updatedData: Partial<Evento> = {
      title: editTitle.trim(),
      date: toDisplayDate(editDate),
      time: editTime || '09:00',
      status: editStatus,
      usingMedication: editUsingMedication,
      medicationDetails: editUsingMedication ? editMedicationDetails.trim() : '',
      undergoingTreatment: editUndergoingTreatment,
      treatmentDetails: editUndergoingTreatment ? editTreatmentDetails.trim() : '',
      actionTaken: editActionTaken.trim(),
      referredToDoctor: editReferredToDoctor,
      doctorReferralDetails: editReferredToDoctor ? editDoctorReferralDetails.trim() : '',
      attachments: editAttachments,
      fileUrl: editAttachments.length > 0 ? editAttachments[0] : undefined,
    };

    try {
      const res = await onUpdateEvento(editingEventoId, updatedData);
      if (res && res.error) {
        setSaveEditError(res.error);
        setIsSavingEdit(false);
        return;
      }

      if (selectedEvento && selectedEvento.id === editingEventoId) {
        setSelectedEvento({
          ...selectedEvento,
          ...updatedData,
        });
      }

      setShowEditModal(false);
      setEditingEventoId(null);
    } catch (err: any) {
      setSaveEditError(err.message || 'Erro ao salvar alterações');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleToggleStatusQuick = async (ev: Evento) => {
    const nextStatus = ev.status === 'Resolvido' ? 'Em observação' : 'Resolvido';
    await onUpdateEvento(ev.id, { status: nextStatus });
    if (selectedEvento && selectedEvento.id === ev.id) {
      setSelectedEvento({ ...selectedEvento, status: nextStatus });
    }
  };

  // Filtered and Sorted List (ordem crescente por data e hora)
  const filteredEventos = eventos
    .filter((ev) => {
      if (filter === 'Todos') return true;
      return ev.status === filter;
    })
    .sort(sortByDateAscending);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>Eventos</span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            setDate(`${year}-${month}-${day}`);
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            setTime(`${hours}:${minutes}`);
            setStatus('Em observação');
            setUsingMedication(false);
            setMedicationDetails('');
            setUndergoingTreatment(false);
            setTreatmentDetails('');
            setActionTaken('');
            setReferredToDoctor(false);
            setDoctorReferralDetails('');
            setAddAttachments([]);
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Novo evento</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-5 w-full pb-24">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {(['Todos', 'Em observação', 'Resolvido'] as const).map((tab) => {
            const active = filter === tab;
            const count = tab === 'Todos' ? eventos.length : eventos.filter((e) => e.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEventos.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs my-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 stroke-[2]" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">
              {filter === 'Todos' ? 'Nenhum evento registrado' : `Nenhum evento "${filter}"`}
            </h3>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mb-5 leading-relaxed">
              Registre febres, quedas, sintomas, reações ou qualquer ocorrência de saúde para manter o histórico sempre seguro.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Cadastrar Primeiro Evento</span>
            </button>
          </div>
        )}

        {/* Eventos List */}
        <div className="space-y-3">
          {filteredEventos.map((ev) => {
            const hasPhotos = (ev.attachments && ev.attachments.length > 0) || !!ev.fileUrl;
            const photoCount = ev.attachments?.length || (ev.fileUrl ? 1 : 0);
            const isResolved = ev.status === 'Resolvido';

            return (
              <div
                key={ev.id}
                className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-blue-200 transition relative cursor-pointer flex flex-col gap-2.5 group"
                onClick={() => setSelectedEvento(ev)}
              >
                {/* 1. Ícone e Título do Evento ocupando 100% do espaço do painel */}
                <div className="flex items-start gap-3 w-full">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isResolved ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <Activity className="w-5.5 h-5.5 stroke-[2.2]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-slate-800 leading-snug group-hover:text-blue-600 transition break-words">
                      {ev.title}
                    </h3>
                    {ev.referredToDoctor && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mt-1 break-words w-full">
                        <Stethoscope className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="text-slate-500 font-semibold">Encaminhado ao médico:</span>
                        <span className="text-rose-800 font-bold">{ev.doctorReferralDetails || 'Sim'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-500">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span>{ev.date}</span>
                      </span>
                      {ev.time && (
                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{ev.time}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Campo Status reordenado + Summary Chips e Ação na barra inferior */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap text-[11px] min-w-0">
                    {/* Status Badge reordenado para a linha inferior */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                        isResolved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                      }`}
                    >
                      {ev.status}
                    </span>

                    {ev.usingMedication && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold flex items-center gap-1 border border-purple-100">
                        <Pill className="w-3 h-3" />
                        Medicado
                      </span>
                    )}
                    {ev.undergoingTreatment && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                        Tratamento
                      </span>
                    )}
                    {ev.referredToDoctor && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold flex items-center gap-1 border border-rose-100">
                        <Stethoscope className="w-3 h-3" />
                        Médico
                      </span>
                    )}
                    {hasPhotos && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-semibold flex items-center gap-1 border border-sky-100">
                        <Paperclip className="w-3 h-3" />
                        {photoCount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(ev);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="Editar evento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 text-blue-600 font-bold text-xs group-hover:translate-x-0.5 transition">
                      <span>Ver detalhes</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* MODAL 1: NOVO EVENTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800">Novo Evento</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewEvento} className="space-y-4 text-xs">
              {/* 1. Evento (o que ocorreu?) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Evento (o que ocorreu?) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Febre alta repentina, queda com hematoma, vômito..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status da Ocorrência</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Em observação')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === 'Em observação'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Em observação</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Resolvido')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      status === 'Resolvido'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolvido</span>
                  </button>
                </div>
              </div>

              {/* 2. Está fazendo uso de algum medicamento? */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-purple-600" />
                    <span>Está fazendo uso de algum medicamento?</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setUsingMedication(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        !usingMedication ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsingMedication(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        usingMedication ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                {usingMedication && (
                  <div className="animate-in fade-in duration-150 pt-1">
                    <input
                      type="text"
                      placeholder="Qual medicamento e dosagem? Ex: Paracetamol 15 gotas de 6 em 6h"
                      value={medicationDetails}
                      onChange={(e) => setMedicationDetails(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 3. Está fazendo algum tratamento? */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Está fazendo algum tratamento?</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setUndergoingTreatment(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        !undergoingTreatment ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setUndergoingTreatment(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        undergoingTreatment ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                {undergoingTreatment && (
                  <div className="animate-in fade-in duration-150 pt-1">
                    <input
                      type="text"
                      placeholder="Qual tratamento? Ex: Inalação com soro, repouso absoluto, curativo diário..."
                      value={treatmentDetails}
                      onChange={(e) => setTreatmentDetails(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* 4. Qual foi a medida tomada? */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qual foi a medida tomada?
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Lavagem com água e sabão, compressa morna, hidratação oral com soro..."
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* 5. Foi encaminhado para um médico? */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-rose-600" />
                    <span>Foi encaminhado para um médico?</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setReferredToDoctor(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        !referredToDoctor ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setReferredToDoctor(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        referredToDoctor ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                {referredToDoctor && (
                  <div className="animate-in fade-in duration-150 pt-1">
                    <input
                      type="text"
                      placeholder="Onde ou com quem? Ex: Pronto-Socorro Infantil, Dra. Camila..."
                      value={doctorReferralDetails}
                      onChange={(e) => setDoctorReferralDetails(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-rose-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Fotos ou Imagens */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    Fotos ou Imagens
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {addAttachments.length} {addAttachments.length === 1 ? 'foto' : 'fotos'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Tire fotos de manchas, ferimentos, exames rápidos ou receitas do evento.
                </p>

                {/* Upload Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isUploadingAdd}
                    onClick={() => addCameraInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-60"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Tirar Foto</span>
                  </button>
                  <button
                    type="button"
                    disabled={isUploadingAdd}
                    onClick={() => addGalleryInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-60"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Galeria / Arquivo</span>
                  </button>
                </div>

                <input
                  ref={addCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleAddPhotoCapture}
                />
                <input
                  ref={addGalleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleAddPhotoCapture}
                />

                {isUploadingAdd && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-blue-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando foto para o Supabase...</span>
                  </div>
                )}

                {uploadAddError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{uploadAddError}</p>
                )}

                {/* Thumbnail list */}
                {addAttachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {addAttachments.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                        <img
                          src={url}
                          alt="Foto do evento"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewImage(url)}
                        />
                        <button
                          type="button"
                          onClick={() => setAddAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSavingAdd || isUploadingAdd}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSavingAdd ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando Evento...</span>
                  </>
                ) : (
                  <span>Salvar Evento</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETALHES DO EVENTO */}
      {selectedEvento && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    selectedEvento.status === 'Resolvido' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Activity className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-800 leading-tight">
                    {selectedEvento.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedEvento.date}
                    </span>
                    {selectedEvento.time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {selectedEvento.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvento(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-3.5 text-xs">
              {/* Status Badge & Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedEvento.status === 'Resolvido'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedEvento.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleStatusQuick(selectedEvento)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                >
                  {selectedEvento.status === 'Resolvido' ? 'Marcar em observação' : 'Marcar como Resolvido'}
                </button>
              </div>

              {/* Medida Tomada */}
              {selectedEvento.actionTaken && (
                <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100">
                  <span className="font-bold text-sky-950 block mb-1">Medida tomada:</span>
                  <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                    {selectedEvento.actionTaken}
                  </p>
                </div>
              )}

              {/* Medicamento */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Pill className="w-4 h-4 text-purple-600" />
                  Está fazendo uso de algum medicamento?
                </span>
                <p className="font-semibold text-slate-700">
                  {selectedEvento.usingMedication ? (
                    <span className="text-purple-700">
                      Sim {selectedEvento.medicationDetails ? `— ${selectedEvento.medicationDetails}` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400">Não</span>
                  )}
                </p>
              </div>

              {/* Tratamento */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Está fazendo algum tratamento?
                </span>
                <p className="font-semibold text-slate-700">
                  {selectedEvento.undergoingTreatment ? (
                    <span className="text-blue-700">
                      Sim {selectedEvento.treatmentDetails ? `— ${selectedEvento.treatmentDetails}` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400">Não</span>
                  )}
                </p>
              </div>

              {/* Encaminhado para um médico? */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Stethoscope className="w-4 h-4 text-rose-600" />
                  Foi encaminhado para um médico?
                </span>
                <p className="font-semibold text-slate-700">
                  {selectedEvento.referredToDoctor ? (
                    <span className="text-rose-700">
                      Sim {selectedEvento.doctorReferralDetails ? `— ${selectedEvento.doctorReferralDetails}` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400">Não</span>
                  )}
                </p>
              </div>

              {/* Fotos Anexadas */}
              {((selectedEvento.attachments && selectedEvento.attachments.length > 0) || selectedEvento.fileUrl) && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    Fotos e Imagens do Evento
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(selectedEvento.attachments && selectedEvento.attachments.length > 0
                      ? selectedEvento.attachments
                      : [selectedEvento.fileUrl!]
                    ).map((url, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-slate-200 aspect-square group cursor-pointer"
                        onClick={() => setPreviewImage(url)}
                      >
                        <img src={url} alt="Foto anexada" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <ZoomIn className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleOpenEditModal(selectedEvento);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar Evento</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm(`Deseja realmente excluir o evento "${selectedEvento.title}"?`)) {
                    await onDeleteEvento(selectedEvento.id);
                    setSelectedEvento(null);
                  }
                }}
                className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center transition cursor-pointer"
                title="Excluir evento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIÇÃO DE EVENTO */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg sm:max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-black text-slate-800">Editar Evento</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditEvento} className="space-y-4 text-xs">
              {/* Evento (o que ocorreu?) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Evento (o que ocorreu?) *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Data e Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('Em observação')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      editStatus === 'Em observação'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Em observação</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus('Resolvido')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      editStatus === 'Resolvido'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolvido</span>
                  </button>
                </div>
              </div>

              {/* Medicamento */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-purple-600" />
                    <span>Está fazendo uso de algum medicamento?</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditUsingMedication(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        !editUsingMedication ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditUsingMedication(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        editUsingMedication ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                {editUsingMedication && (
                  <div className="animate-in fade-in duration-150 pt-1">
                    <input
                      type="text"
                      placeholder="Qual medicamento e dosagem?"
                      value={editMedicationDetails}
                      onChange={(e) => setEditMedicationDetails(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-purple-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Tratamento */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Está fazendo algum tratamento?</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditUndergoingTreatment(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        !editUndergoingTreatment ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditUndergoingTreatment(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        editUndergoingTreatment ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                {editUndergoingTreatment && (
                  <div className="animate-in fade-in duration-150 pt-1">
                    <input
                      type="text"
                      placeholder="Qual tratamento?"
                      value={editTreatmentDetails}
                      onChange={(e) => setEditTreatmentDetails(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Medida Tomada */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Qual foi a medida tomada?
                </label>
                <textarea
                  rows={2}
                  value={editActionTaken}
                  onChange={(e) => setEditActionTaken(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Encaminhado para um médico? */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-rose-600" />
                    <span>Foi encaminhado para um médico?</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditReferredToDoctor(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        !editReferredToDoctor ? 'bg-slate-200 text-slate-800' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditReferredToDoctor(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                        editReferredToDoctor ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>

                {editReferredToDoctor && (
                  <div className="animate-in fade-in duration-150 pt-1">
                    <input
                      type="text"
                      placeholder="Onde ou com quem?"
                      value={editDoctorReferralDetails}
                      onChange={(e) => setEditDoctorReferralDetails(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-rose-200 bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-rose-400 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Fotos / Documentos */}
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    Fotos e Imagens ({editAttachments.length})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isUploadingEdit}
                    onClick={() => editCameraInputRef.current?.click()}
                    className="py-2 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-60"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Tirar Foto</span>
                  </button>
                  <button
                    type="button"
                    disabled={isUploadingEdit}
                    onClick={() => editGalleryInputRef.current?.click()}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-60"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Galeria</span>
                  </button>
                </div>

                <input
                  ref={editCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleEditPhotoCapture}
                />
                <input
                  ref={editGalleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleEditPhotoCapture}
                />

                {isUploadingEdit && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-blue-700">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando foto para o Supabase...</span>
                  </div>
                )}

                {uploadEditError && (
                  <p className="text-[11px] text-rose-600 font-semibold">{uploadEditError}</p>
                )}

                {editAttachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {editAttachments.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                        <img
                          src={url}
                          alt="Foto"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewImage(url)}
                        />
                        <button
                          type="button"
                          onClick={() => setEditAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-rose-600 transition"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {saveEditError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                  {saveEditError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSavingEdit || isUploadingEdit}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando Alterações...</span>
                  </>
                ) : (
                  <span>Salvar Alterações</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal with Zoom */}
      {previewImage && (
        <ImageViewerModal
          imageUrl={previewImage}
          title="Foto da Ocorrência Médica"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
