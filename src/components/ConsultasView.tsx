import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  User,
  Calendar,
  Clock,
  MapPin,
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
  CloudUpload,
} from 'lucide-react';
import { Consulta } from '../types';
import { uploadMedicalPhotoToSupabase } from '../services/supabase';
import { sortByDateAscending } from '../utils/dateOrder';
import { ImageViewerModal } from './ImageViewerModal';

interface ConsultasViewProps {
  consultas: Consulta[];
  childId: string;
  onBack: () => void;
  onAddConsulta: (consulta: Omit<Consulta, 'id'>) => void;
  onUpdateConsulta: (id: string, updated: Partial<Consulta>) => Promise<{ success: boolean; error?: string }> | void;
  onDeleteConsulta: (id: string) => void;
}

export const ConsultasView: React.FC<ConsultasViewProps> = ({
  consultas,
  childId,
  onBack,
  onAddConsulta,
  onUpdateConsulta,
  onDeleteConsulta,
}) => {
  const [filter, setFilter] = useState<'Todas' | 'Realizada' | 'Agendada'>('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);

  // Form state (Nova Consulta)
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('Pediatra');
  const [date, setDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'Realizada' | 'Agendada'>('Agendada');
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState(true);
  const [addAttachments, setAddAttachments] = useState<string[]>([]);
  const [isUploadingAdd, setIsUploadingAdd] = useState(false);
  const [uploadAddError, setUploadAddError] = useState<string | null>(null);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const addCameraInputRef = useRef<HTMLInputElement>(null);
  const addGalleryInputRef = useRef<HTMLInputElement>(null);

  // Edit Consulta Modal State (permite editar consultas Agendadas e Realizadas)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConsultaId, setEditingConsultaId] = useState<string | null>(null);
  const [editDoctorName, setEditDoctorName] = useState('');
  const [editSpecialty, setEditSpecialty] = useState('Pediatra');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('09:00');
  const [editLocation, setEditLocation] = useState('');
  const [editStatus, setEditStatus] = useState<'Realizada' | 'Agendada'>('Agendada');
  const [editNotes, setEditNotes] = useState('');
  const [editReminder, setEditReminder] = useState(true);
  const [editAttachments, setEditAttachments] = useState<string[]>([]);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);
  const [uploadEditError, setUploadEditError] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [saveEditError, setSaveEditError] = useState<string | null>(null);

  const editCameraInputRef = useRef<HTMLInputElement>(null);
  const editGalleryInputRef = useRef<HTMLInputElement>(null);

  // Completion modal state (marcar como realizada com comentário e fotos de documentos)
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeAttachments, setCompleteAttachments] = useState<string[]>([]);
  const [isUploadingComplete, setIsUploadingComplete] = useState(false);
  const [uploadCompleteError, setUploadCompleteError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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

  const handleOpenEditModal = (c: Consulta) => {
    setEditingConsultaId(c.id);
    setEditDoctorName(c.doctorName || '');
    setEditSpecialty(c.specialty || 'Pediatra');
    setEditDate(toInputDate(c.date));
    setEditTime(c.time || '09:00');
    setEditLocation(c.location || '');
    setEditStatus(c.status || 'Agendada');
    setEditNotes(c.notes || '');
    setEditReminder(c.reminder ?? true);
    setEditAttachments(
      c.attachments && c.attachments.length > 0
        ? [...c.attachments]
        : c.fileUrl
        ? [c.fileUrl]
        : []
    );
    setUploadEditError(null);
    setSaveEditError(null);
    setShowEditModal(true);
  };

  const handleEditPhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingEdit(true);
    setUploadEditError(null);

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      const { url, error } = await uploadMedicalPhotoToSupabase(file, 'consultas');
      if (error) {
        setUploadEditError(error);
      } else if (url) {
        setEditAttachments((prev) => [...prev, url]);
      }
    }

    setIsUploadingEdit(false);
    e.target.value = '';
  };

  const handleRemoveEditAttachment = (indexToRemove: number) => {
    setEditAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConsultaId || !editDoctorName.trim()) return;

    if (isUploadingEdit) {
      alert('Aguarde o envio das fotos para o Supabase Storage concluir antes de salvar.');
      return;
    }

    setIsSavingEdit(true);
    setSaveEditError(null);

    const updatedFields: Partial<Consulta> = {
      doctorName: editDoctorName.trim(),
      specialty: editSpecialty.trim(),
      date: toDisplayDate(editDate),
      time: editTime.trim(),
      location: editLocation.trim(),
      status: editStatus,
      notes: editNotes.trim(),
      reminder: editReminder,
      attachments: editAttachments,
    };

    try {
      const res = await onUpdateConsulta(editingConsultaId, updatedFields);
      if (res && (res as any).success === false) {
        setSaveEditError((res as any).error || 'Erro ao salvar alterações no Supabase.');
        setIsSavingEdit(false);
        return;
      }

      if (selectedConsulta && selectedConsulta.id === editingConsultaId) {
        setSelectedConsulta((prev) => (prev ? { ...prev, ...updatedFields } : null));
      }

      setShowEditModal(false);
      setEditingConsultaId(null);
    } catch (err: any) {
      setSaveEditError(err?.message || 'Erro ao atualizar consulta');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleOpenCompleteModal = () => {
    if (!selectedConsulta) return;
    setCompleteNotes(selectedConsulta.notes || '');
    setCompleteAttachments(selectedConsulta.attachments || []);
    setUploadCompleteError(null);
    setShowCompleteModal(true);
  };

  const handleSaveCompleted = () => {
    if (!selectedConsulta) return;
    const updated: Partial<Consulta> = {
      status: 'Realizada',
      notes: completeNotes.trim(),
      attachments: completeAttachments,
    };
    onUpdateConsulta(selectedConsulta.id, updated);
    setSelectedConsulta((prev) => (prev ? { ...prev, ...updated } : null));
    setShowCompleteModal(false);
  };

  // Upload photos directly to Supabase Storage for Nova Consulta
  const handleAddPhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAdd(true);
    setUploadAddError(null);

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      const { url, error } = await uploadMedicalPhotoToSupabase(file, 'consultas');
      if (error) {
        setUploadAddError(error);
      } else if (url) {
        setAddAttachments((prev) => [...prev, url]);
      }
    }

    setIsUploadingAdd(false);
    e.target.value = '';
  };

  const handleRemoveAddAttachment = (indexToRemove: number) => {
    setAddAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Upload photos directly to Supabase Storage for Concluir/Editar Consulta
  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingComplete(true);
    setUploadCompleteError(null);

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      const { url, error } = await uploadMedicalPhotoToSupabase(file, 'consultas');
      if (error) {
        setUploadCompleteError(error);
      } else if (url) {
        setCompleteAttachments((prev) => [...prev, url]);
      }
    }

    setIsUploadingComplete(false);
    e.target.value = '';
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setCompleteAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const filteredConsultas = consultas
    .filter((c) => {
      if (filter === 'Todas') return true;
      return c.status === filter;
    })
    .sort(sortByDateAscending);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAdd) return;
    if (!doctorName.trim()) return;

    const formattedDate = toDisplayDate(date);

    // Prevenção contra salvamento duplo de consulta idêntica
    const isDuplicate = consultas.some(
      (c) =>
        c.childId === (childId || 'default') &&
        c.doctorName.trim().toLowerCase() === doctorName.trim().toLowerCase() &&
        c.date === formattedDate &&
        c.time === time.trim()
    );
    if (isDuplicate) {
      alert('Esta consulta já foi cadastrada com este médico, data e horário.');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      await onAddConsulta({
        childId: childId || 'default',
        doctorName: doctorName.trim(),
        specialty: specialty.trim(),
        date: formattedDate,
        time: time.trim(),
        location: location.trim(),
        status,
        notes: notes.trim(),
        reminder,
        attachments: addAttachments.length > 0 ? addAttachments : undefined,
      });

      // Reset form
      setDoctorName('');
      setLocation('');
      setNotes('');
      setAddAttachments([]);
      setUploadAddError(null);
      setShowAddModal(false);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F3F8FE] overflow-hidden">
      {/* Top Header matching mockup Screen 3 */}
      <header className="px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          <span>Consultas</span>
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 rounded-full bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Nova consulta</span>
        </button>
      </header>

      {/* List of Consultas matching mockup Screen 3 */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-5 space-y-3">
        {/* Filter Tabs (Corre com a tela) */}
        <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
          {(['Todas', 'Agendada', 'Realizada'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer shrink-0 ${
                filter === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {tab === 'Todas' ? 'Todas' : tab === 'Agendada' ? 'Agendadas' : 'Realizadas'}
            </button>
          ))}
        </div>
        {filteredConsultas.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300 my-6">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600">Nenhuma consulta encontrada</p>
            <p className="text-xs text-slate-400 mt-1">
              Clique em "+ Nova consulta" para adicionar o primeiro atendimento médico.
            </p>
          </div>
        ) : (
          filteredConsultas.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedConsulta(item)}
              className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md hover:border-sky-300 transition flex flex-col gap-3 cursor-pointer group"
            >
              {/* 1. Nome do Médico ocupando 100% do espaço do painel */}
              <div className="flex items-start gap-3 w-full">
                {/* Doctor Icon Circle */}
                <div className="w-11 h-11 rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center shrink-0 border border-sky-100 mt-0.5">
                  <User className="w-6 h-6 stroke-[1.8]" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-black text-slate-800 leading-snug group-hover:text-blue-600 transition break-words">
                    {item.doctorName}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {item.specialty}
                  </p>
                </div>
              </div>

              {/* 2. Campo Status reordenado + Data, Hora, Local e Ações na barra inferior */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  {/* Status Badge reordenado para liberar todo o espaço ao nome do médico */}
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      item.status === 'Realizada'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-sky-50 text-sky-600 border border-sky-200'
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{toDisplayDate(item.date)}</span>
                  </span>

                  <span className="flex items-center gap-1.5 font-semibold text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.time}</span>
                  </span>

                  {item.location && (
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{item.location}</span>
                    </span>
                  )}

                  {item.attachments && item.attachments.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/80"
                      title={`${item.attachments.length} foto(s) anexada(s)`}
                    >
                      <Paperclip className="w-3 h-3 text-blue-500" />
                      <span>{item.attachments.length}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditModal(item);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Editar consulta"
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
          ))
        )}
      </div>

      {/* Consulta Details Modal */}
      {selectedConsulta && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Header: Nome do médico ocupando todo o espaço do painel com status reordenado abaixo */}
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center shrink-0 border border-sky-100">
                    <User className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">
                      {selectedConsulta.doctorName}
                    </h3>
                    <p className="text-xs font-bold text-blue-600 mt-0.5">
                      {selectedConsulta.specialty}
                    </p>
                  </div>
                </div>

                {/* Campo Status reordenado abaixo do nome do médico para não disputar espaço */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                      selectedConsulta.status === 'Realizada'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-sky-100 text-sky-700 border border-sky-200'
                    }`}
                  >
                    {selectedConsulta.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{toDisplayDate(selectedConsulta.date)} às {selectedConsulta.time}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(selectedConsulta)}
                  className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                  title="Editar consulta"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedConsulta(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-600 mb-4 border border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-700">Data:</span>
                <span>{toDisplayDate(selectedConsulta.date)} às {selectedConsulta.time}</span>
              </div>

              {selectedConsulta.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700">Local:</span>{' '}
                    <span>{selectedConsulta.location}</span>
                  </div>
                </div>
              )}

              {selectedConsulta.notes && (
                <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60">
                  <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-slate-700">Observações médicas:</span>
                    <p className="mt-0.5 text-slate-600 leading-relaxed break-words whitespace-pre-wrap">
                      {selectedConsulta.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Photos & Documents Attached */}
              {selectedConsulta.attachments && selectedConsulta.attachments.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
                      <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                      Documentos e Fotos ({selectedConsulta.attachments.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedConsulta.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(att)}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer hover:border-blue-400 shadow-2xs transition"
                        title="Clique para ampliar"
                      >
                        <img
                          src={att}
                          alt={`Anexo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition drop-shadow" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              {selectedConsulta.status === 'Agendada' ? (
                <div className="space-y-2">
                  <button
                    onClick={handleOpenCompleteModal}
                    className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Marcar como Realizada</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedConsulta)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-sky-50 text-blue-600 hover:bg-sky-100 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-sky-200/60 active:scale-98"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Consulta</span>
                    </button>

                    <button
                      onClick={() => {
                        onDeleteConsulta(selectedConsulta.id);
                        setSelectedConsulta(null);
                      }}
                      className="py-2.5 px-3.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Excluir consulta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedConsulta)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-sky-50 text-blue-600 hover:bg-sky-100 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-sky-200/60 active:scale-98"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Consulta</span>
                    </button>

                    <button
                      onClick={() => {
                        onDeleteConsulta(selectedConsulta.id);
                        setSelectedConsulta(null);
                      }}
                      className="py-2.5 px-3.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Excluir consulta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onUpdateConsulta(selectedConsulta.id, { status: 'Agendada' });
                      setSelectedConsulta({ ...selectedConsulta, status: 'Agendada' });
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer"
                  >
                    Reverter para Agendada
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complete Consulta Modal (Comentário e Anexo de Fotos) */}
      {showCompleteModal && selectedConsulta && (
        <div className="fixed inset-0 z-55 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {selectedConsulta.status === 'Realizada' ? 'Editar Consulta' : 'Concluir Consulta'}
                </span>
                <h3 className="text-base font-black text-slate-800 mt-1">
                  {selectedConsulta.doctorName}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {selectedConsulta.specialty} • {toDisplayDate(selectedConsulta.date)} às {selectedConsulta.time}
                </p>
              </div>

              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar space-y-4 flex-1 pr-0.5">
              {/* Comment / Observations textarea */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Comentário / Orientações da Consulta
                </label>
                <textarea
                  rows={3}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  placeholder="Ex: Peso e altura anotados, recomendações do médico, dosagem de remédios, conduta ou data de retorno..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/70 placeholder:text-slate-400 resize-none leading-relaxed"
                />
              </div>

              {/* Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    Fotos ou Documentos
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {completeAttachments.length} {completeAttachments.length === 1 ? 'anexo' : 'anexos'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Tire fotos de atestados, receitas, pedidos de exames ou recomendações médicas.
                </p>

                {/* Quick capture buttons */}
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isUploadingComplete}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span>Tirar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isUploadingComplete}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Galeria / Arquivo</span>
                  </button>
                </div>

                {/* Upload indicator */}
                {isUploadingComplete && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold mb-2 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>Enviando foto para o Supabase Storage...</span>
                  </div>
                )}

                {/* Upload error banner */}
                {uploadCompleteError && (
                  <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold mb-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="flex-1">{uploadCompleteError}</span>
                  </div>
                )}

                {/* Hidden inputs for camera capture & file pick */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handlePhotoCapture}
                  className="hidden"
                />

                {/* Thumbnails of attached files */}
                {completeAttachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    {completeAttachments.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-2xs"
                      >
                        <img
                          src={img}
                          alt={`Anexo ${idx + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewImage(img)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition cursor-pointer"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img)}
                          className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 text-[9px] text-white flex items-center gap-0.5 font-semibold"
                        >
                          <ZoomIn className="w-2.5 h-2.5" />
                          <span>Ver</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom confirmation actions */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveCompleted}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Consulta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm flex justify-between items-center mb-3 text-white">
            <span className="text-xs font-semibold text-slate-300">Documento / Foto Anexa</span>
            <button
              onClick={() => setPreviewImage(null)}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-sm max-h-[80vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center border border-white/10 shadow-2xl">
            <img
              src={previewImage}
              alt="Documento Anexado"
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Add New Consulta Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800">
                Nova Consulta Médica
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Médico(a) *
                </label>
                <input
                  type="text"
                  required
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Ex: Dr. Carlos Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Especialidade
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="Pediatra">Pediatra</option>
                  <option value="Dermatologista">Dermatologista</option>
                  <option value="Otorrinolaringologista">Otorrinolaringologista</option>
                  <option value="Oftalmologista">Oftalmologista</option>
                  <option value="Alergista / Imunologista">Alergista / Imunologista</option>
                  <option value="Neuropediatra">Neuropediatra</option>
                  <option value="Ortopedista">Ortopedista</option>
                  <option value="Cardiologista">Cardiologista</option>
                  <option value="Nutricionista Pediátrica">Nutricionista Pediátrica</option>
                  <option value="Dentista / Odontopediatria">Dentista / Odontopediatria</option>
                </select>
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
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Local / Clínica
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Hospital Pediátrico Central"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <div className="flex gap-2">
                  {(['Agendada', 'Realizada'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setStatus(st)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        status === st
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Observações e Orientações Médicas
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Peso atual, altura, sintomas ou recomendações do pediatra..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Fotos e Documentos no Supabase Storage */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    Fotos ou Documentos
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {addAttachments.length} {addAttachments.length === 1 ? 'anexo' : 'anexos'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tire fotos de pedidos médicos, receitas, encaminhamentos ou atestados da consulta.
                </p>

                {/* Upload Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => addCameraInputRef.current?.click()}
                    disabled={isUploadingAdd}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-50 text-blue-600 font-bold text-xs transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span>Tirar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addGalleryInputRef.current?.click()}
                    disabled={isUploadingAdd}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-98 disabled:opacity-50 shadow-2xs"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Galeria / Arquivo</span>
                  </button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={addCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleAddPhotoCapture}
                  className="hidden"
                />
                <input
                  ref={addGalleryInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleAddPhotoCapture}
                  className="hidden"
                />

                {/* Upload indicator */}
                {isUploadingAdd && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>Enviando foto para o Supabase Storage...</span>
                  </div>
                )}

                {/* Upload Error banner */}
                {uploadAddError && (
                  <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="flex-1">{uploadAddError}</span>
                  </div>
                )}

                {/* Thumbnails of attached files */}
                {addAttachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {addAttachments.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-2xs"
                      >
                        <img
                          src={img}
                          alt={`Anexo ${idx + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewImage(img)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAddAttachment(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition cursor-pointer"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img)}
                          className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 text-[9px] text-white flex items-center gap-0.5 font-semibold"
                        >
                          <ZoomIn className="w-2.5 h-2.5" />
                          <span>Ver</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-sky-50/70 rounded-xl">
                <span className="font-bold text-slate-700">Criar lembrete de notificação</span>
                <input
                  type="checkbox"
                  checked={reminder}
                  onChange={(e) => setReminder(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploadingAdd || isSubmittingAdd}
                  className="w-full py-3 rounded-full bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingAdd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando consulta...</span>
                    </>
                  ) : isUploadingAdd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Aguarde o envio das fotos...</span>
                    </>
                  ) : (
                    <span>Salvar Consulta</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Consulta Modal (Edição completa tanto para Agendada quanto para Realizada) */}
      {showEditModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      editStatus === 'Realizada'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {editStatus}
                  </span>
                  <h2 className="text-lg font-black text-slate-800">Editar Consulta</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Atualize data, horário, médico, status e fotos anexas
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingConsultaId(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {saveEditError && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="flex-1">{saveEditError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Nome do Médico / Especialista <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editDoctorName}
                  onChange={(e) => setEditDoctorName(e.target.value)}
                  placeholder="Ex: Dra. Juliana Rossi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Especialidade
                </label>
                <select
                  value={editSpecialty}
                  onChange={(e) => setEditSpecialty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Pediatra">Pediatra</option>
                  <option value="Neuropediatra">Neuropediatra</option>
                  <option value="Oftalmopediatra">Oftalmopediatra</option>
                  <option value="Otorrinolaringologista">Otorrinolaringologista</option>
                  <option value="Cardiologista Pediátrico">Cardiologista Pediátrico</option>
                  <option value="Ortopedista Pediátrico">Ortopedista Pediátrico</option>
                  <option value="Dermatologista Pediátrico">Dermatologista Pediátrico</option>
                  <option value="Fonoaudiólogo">Fonoaudiólogo</option>
                  <option value="Dentista / Odontopediatra">Dentista / Odontopediatra</option>
                  <option value="Nutricionista Infantil">Nutricionista Infantil</option>
                  <option value="Fisioterapeuta">Fisioterapeuta</option>
                  <option value="Psicólogo Infantil">Psicólogo Infantil</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Data
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer bg-white"
                      onClick={(e) => {
                        try {
                          (e.target as any).showPicker?.();
                        } catch {}
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Local / Clínica
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Ex: Clínica Infantil Bem Estar - Sala 204"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">
                  Status da Consulta
                </label>
                <div className="flex gap-2">
                  {(['Agendada', 'Realizada'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setEditStatus(st)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        editStatus === st
                          ? st === 'Realizada'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                            : 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st === 'Realizada' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Calendar className="w-3.5 h-3.5" />
                      )}
                      <span>{st}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Observações e Orientações Médicas
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ex: Conduta, dosagens, receitas, dúvidas para perguntar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Fotos e Documentos no Supabase Storage */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    Fotos ou Documentos no Supabase
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {editAttachments.length} {editAttachments.length === 1 ? 'anexo' : 'anexos'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Adicione ou remova fotos de pedidos, receitas ou atestados desta consulta.
                </p>

                {/* Upload Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => editCameraInputRef.current?.click()}
                    disabled={isUploadingEdit}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-50 text-blue-600 font-bold text-xs transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span>Tirar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => editGalleryInputRef.current?.click()}
                    disabled={isUploadingEdit}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-98 disabled:opacity-50 shadow-2xs"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Galeria / Arquivo</span>
                  </button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={editCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleEditPhotoCapture}
                  className="hidden"
                />
                <input
                  ref={editGalleryInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleEditPhotoCapture}
                  className="hidden"
                />

                {/* Upload indicator */}
                {isUploadingEdit && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>Enviando foto para o Supabase Storage...</span>
                  </div>
                )}

                {/* Upload Error banner */}
                {uploadEditError && (
                  <div className="flex items-start gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="flex-1">{uploadEditError}</span>
                  </div>
                )}

                {/* Thumbnails of attached files */}
                {editAttachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {editAttachments.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-2xs"
                      >
                        <img
                          src={img}
                          alt={`Anexo ${idx + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewImage(img)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditAttachment(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition cursor-pointer"
                          title="Remover foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img)}
                          className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 text-[9px] text-white flex items-center gap-0.5 font-semibold"
                        >
                          <ZoomIn className="w-2.5 h-2.5" />
                          <span>Ver</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-sky-50/70 rounded-xl">
                <span className="font-bold text-slate-700 text-xs">
                  Sincronizar lembrete de notificação
                </span>
                <input
                  type="checkbox"
                  checked={editReminder}
                  onChange={(e) => setEditReminder(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingConsultaId(null);
                  }}
                  disabled={isSavingEdit}
                  className="flex-1 py-3 rounded-full border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isUploadingEdit || isSavingEdit}
                  className="flex-1 py-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 active:scale-98"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no Supabase...</span>
                    </>
                  ) : isUploadingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando fotos...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações</span>
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
          title="Documento / Anexo da Consulta"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
