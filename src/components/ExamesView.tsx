import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  FlaskConical,
  AlertTriangle,
  Calendar,
  Eye,
  Trash2,
  X,
  Camera,
  CheckCircle2,
  Paperclip,
  ZoomIn,
  Edit2,
  ScanLine,
  Loader2,
  CloudUpload,
  MapPin,
  User,
} from 'lucide-react';
import { Exame } from '../types';
import { uploadMedicalPhotoToSupabase } from '../services/supabase';
import { sortByDateAscending } from '../utils/dateOrder';
import { XRayPreview } from './MascotIcons';
import { ImageViewerModal } from './ImageViewerModal';

interface ExamesViewProps {
  exames: Exame[];
  childId?: string;
  onBack: () => void;
  onOpenScanner: () => void;
  onAddExame?: (exame: Omit<Exame, 'id'>) => Promise<{ success: boolean; error?: string }> | void;
  onUpdateExame: (id: string, updated: Partial<Exame>) => Promise<{ success: boolean; error?: string }> | void;
  onDeleteExame: (id: string) => void;
}

export const ExamesView: React.FC<ExamesViewProps> = ({
  exames,
  childId,
  onBack,
  onOpenScanner,
  onAddExame,
  onUpdateExame,
  onDeleteExame,
}) => {
  const [activeTab, setActiveTab] = useState<'Realizados' | 'Agendados' | 'Alterações'>('Realizados');
  const [selectedExame, setSelectedExame] = useState<Exame | null>(null);

  // Add Exam Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Exame['type']>('Sangue');
  const [newStatus, setNewStatus] = useState<Exame['status']>('Agendado');
  const [newDate, setNewDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [newLocation, setNewLocation] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newObservations, setNewObservations] = useState('');
  const [newHasAlteration, setNewHasAlteration] = useState(false);
  const [newAlterationDetails, setNewAlterationDetails] = useState('');
  const [newAttachments, setNewAttachments] = useState<string[]>([]);
  const [isSavingExam, setIsSavingExam] = useState(false);
  const [saveExamError, setSaveExamError] = useState<string | null>(null);

  // Completion modal state (para marcar como realizado ou editar laudo/fotos)
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeHasAlteration, setCompleteHasAlteration] = useState(false);
  const [completeAlterationDetails, setCompleteAlterationDetails] = useState('');
  const [completeAttachments, setCompleteAttachments] = useState<string[]>([]);
  const [isSavingComplete, setIsSavingComplete] = useState(false);
  const [saveCompleteError, setSaveCompleteError] = useState<string | null>(null);

  // Supabase Storage upload states
  const [isUploadingAdd, setIsUploadingAdd] = useState(false);
  const [uploadAddError, setUploadAddError] = useState<string | null>(null);
  const [isUploadingComplete, setIsUploadingComplete] = useState(false);
  const [uploadCompleteError, setUploadCompleteError] = useState<string | null>(null);

  // Fullscreen photo preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Hidden file inputs for camera and gallery in the Add modal
  const addCameraInputRef = useRef<HTMLInputElement>(null);
  const addGalleryInputRef = useRef<HTMLInputElement>(null);

  // Hidden file inputs for camera and gallery in the Complete modal
  const completeCameraInputRef = useRef<HTMLInputElement>(null);
  const completeGalleryInputRef = useRef<HTMLInputElement>(null);

  const formatDateDisplay = (dateStr?: string): string => {
    if (!dateStr) return '';
    const clean = dateStr.trim();
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        return `${parts[2].substring(0, 2)}/${parts[1]}/${parts[0]}`;
      }
    }
    return clean;
  };

  const toInputDate = (val?: string): string => {
    if (!val) return '';
    const clean = val.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return clean;
  };

  // Filter and sort exams by date in ascending order across all tabs
  const displayedExames = exames
    .filter((ex) => {
      if (activeTab === 'Realizados') return ex.status === 'Realizado';
      if (activeTab === 'Agendados') return ex.status === 'Agendado' || ex.status === 'Solicitado';
      if (activeTab === 'Alterações') return ex.hasAlteration;
      return true;
    })
    .sort(sortByDateAscending);

  const getExamIcon = (type: Exame['type']) => {
    if (type === 'Raio-X' || type === 'Ultrassom' || type === 'Tomografia' || type === 'Ressonância') {
      return (
        <div className="w-12 h-12 rounded-full bg-sky-50 text-blue-500 flex items-center justify-center shrink-0 border border-sky-100">
          <ImageIcon className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    if (type === 'Sangue') {
      return (
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
          <FileText className="w-6 h-6 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
        <FlaskConical className="w-6 h-6 stroke-[2]" />
      </div>
    );
  };

  // Add Exam attachments handler - Direct to Supabase Storage
  const handleAddPhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingAdd(true);
    setUploadAddError(null);

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      const { url, error } = await uploadMedicalPhotoToSupabase(file, 'exames');
      if (error) {
        setUploadAddError(error);
      } else if (url) {
        setNewAttachments((prev) => [...prev, url]);
      }
    }

    setIsUploadingAdd(false);
    e.target.value = '';
  };

  // Complete Exam attachments handler - Direct to Supabase Storage
  const handleCompletePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingComplete(true);
    setUploadCompleteError(null);

    const fileList = Array.from(files) as File[];
    for (const file of fileList) {
      const { url, error } = await uploadMedicalPhotoToSupabase(file, 'exames');
      if (error) {
        setUploadCompleteError(error);
      } else if (url) {
        setCompleteAttachments((prev) => [...prev, url]);
      }
    }

    setIsUploadingComplete(false);
    e.target.value = '';
  };

  // Handle Save New Exam
  const handleSaveNewExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (isUploadingAdd) {
      alert('Aguarde o envio das fotos para o Supabase Storage concluir antes de salvar.');
      return;
    }

    const formattedDate = formatDateDisplay(newDate);

    // Prevenção contra salvamento duplo de exame
    const isDuplicate = exames.some(
      (ex) =>
        ex.childId === (childId || 'default') &&
        ex.title.trim().toLowerCase() === newTitle.trim().toLowerCase() &&
        ex.date === formattedDate &&
        ex.type === newType
    );
    if (isDuplicate) {
      alert('Este exame já foi cadastrado para esta data e tipo.');
      return;
    }

    setSaveExamError(null);
    setIsSavingExam(true);

    try {
      if (onAddExame) {
        const res = await onAddExame({
          childId: childId || 'default',
          title: newTitle.trim(),
          type: newType,
          status: newStatus,
          date: formattedDate,
          expectedDate: newStatus === 'Agendado' ? formattedDate : undefined,
          location: newLocation.trim() || undefined,
          doctorRequested: newDoctor.trim() || undefined,
          observations: newObservations.trim() || undefined,
          hasAlteration: newHasAlteration,
          alterationDetails: newHasAlteration ? newAlterationDetails.trim() : undefined,
          attachments: newAttachments,
          fileUrl: newAttachments.length > 0 ? newAttachments[0] : undefined,
          fileType: newType === 'Raio-X' ? 'xray' : 'image',
        });

        if (res && res.success === false) {
          setSaveExamError(res.error || 'Erro ao salvar exame no Supabase.');
          setIsSavingExam(false);
          return;
        }
      }

      // Reset upon success
      setNewTitle('');
      setNewLocation('');
      setNewDoctor('');
      setNewObservations('');
      setNewHasAlteration(false);
      setNewAlterationDetails('');
      setNewAttachments([]);
      setSaveExamError(null);
      setShowAddModal(false);
    } catch (err: any) {
      setSaveExamError(err?.message || 'Falha ao salvar exame no Supabase.');
    } finally {
      setIsSavingExam(false);
    }
  };

  // Open Complete Modal for an existing exam
  const handleOpenCompleteModal = () => {
    if (!selectedExame) return;
    setSaveCompleteError(null);
    setCompleteNotes(selectedExame.observations || '');
    setCompleteHasAlteration(selectedExame.hasAlteration || false);
    setCompleteAlterationDetails(selectedExame.alterationDetails || '');
    setCompleteAttachments(selectedExame.attachments || (selectedExame.fileUrl ? [selectedExame.fileUrl] : []));
    setShowCompleteModal(true);
  };

  // Save Complete / Edited exam
  const handleSaveCompletedExam = async () => {
    if (!selectedExame) return;

    if (isUploadingComplete) {
      alert('Aguarde o envio das fotos para o Supabase Storage concluir antes de salvar.');
      return;
    }

    setSaveCompleteError(null);
    setIsSavingComplete(true);

    try {
      const updated: Partial<Exame> = {
        status: 'Realizado',
        observations: completeNotes.trim(),
        hasAlteration: completeHasAlteration,
        alterationDetails: completeHasAlteration ? completeAlterationDetails.trim() : undefined,
        attachments: completeAttachments,
        fileUrl: completeAttachments.length > 0 ? completeAttachments[0] : selectedExame.fileUrl,
      };

      if (onUpdateExame) {
        const res = await onUpdateExame(selectedExame.id, updated);
        if (res && res.success === false) {
          setSaveCompleteError(res.error || 'Erro ao atualizar exame no Supabase.');
          setIsSavingComplete(false);
          return;
        }
      }

      setSelectedExame((prev) => (prev ? { ...prev, ...updated } : null));
      setSaveCompleteError(null);
      setShowCompleteModal(false);
    } catch (err: any) {
      setSaveCompleteError(err?.message || 'Falha ao salvar no Supabase.');
    } finally {
      setIsSavingComplete(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F3F8FE] overflow-hidden">
      {/* Top Header matching mockup Screen 4 */}
      <header className="px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-lg cursor-pointer"
        >
          <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          <span>Exames</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScanner}
            className="w-9 h-9 rounded-full bg-sky-50 text-blue-600 hover:bg-sky-100 border border-sky-200/80 flex items-center justify-center transition cursor-pointer"
            title="Escanear exame com câmera"
          >
            <ScanLine className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="py-2 px-3.5 rounded-full bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo exame</span>
          </button>
        </div>
      </header>

      {/* List of Exams matching mockup Screen 4 */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-5 space-y-3">
        {/* 3 Tabs matching mockup Screen 4: Realizados | Agendados | Alterações (Corre com a tela) */}
        <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
          {(['Realizados', 'Agendados', 'Alterações'] as const).map((tab) => (
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
              {tab === 'Alterações' && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-xs bg-rose-500 text-white font-bold">
                  {exames.filter((e) => e.hasAlteration).length}
                </span>
              )}
            </button>
          ))}
        </div>
        {displayedExames.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300 my-6">
            <FlaskConical className="w-11 h-11 text-slate-300 mx-auto mb-2" />
            <p className="text-base font-bold text-slate-600">Nenhum exame nesta aba</p>
            <p className="text-xs text-slate-400 mt-1">
              Toque no botão "+ Novo exame" acima para cadastrar ou anexar fotos de um exame.
            </p>
          </div>
        ) : (
          displayedExames.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedExame(item)}
              className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md hover:border-sky-300 transition flex flex-col gap-2.5 cursor-pointer group"
            >
              {/* 1. Ícone e Título do Exame ocupando 100% do espaço do painel */}
              <div className="flex items-start gap-3 w-full">
                <div className="shrink-0 mt-0.5">
                  {getExamIcon(item.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-800 leading-snug group-hover:text-blue-600 transition break-words">
                      {item.title}
                    </h3>
                    {item.hasAlteration && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full shrink-0">
                        <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                        Alteração
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {item.type}
                  </p>
                  {item.doctorRequested && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mt-1 break-words w-full">
                      <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-slate-500 font-semibold">Médico Solicitante:</span>
                      <span className="text-slate-800 font-bold">{item.doctorRequested}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bloco de alerta detalhado caso haja alteração */}
              {item.hasAlteration && item.alterationDetails && (
                <div className="p-2 bg-rose-50/80 border border-rose-200/70 rounded-xl text-xs text-rose-800 font-medium">
                  <span className="font-bold">Observação da alteração:</span> {item.alterationDetails}
                </div>
              )}

              {/* 2. Campo Status reordenado + Data, Local e Ação na barra inferior */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  {/* Status Badge reordenado para liberar todo o espaço ao título */}
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                      item.status === 'Realizado'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.status === 'Solicitado' ? 'Agendado' : item.status}
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      {item.status === 'Agendado' || item.status === 'Solicitado'
                        ? `Agendado: ${formatDateDisplay(item.expectedDate || item.date)}`
                        : `Realizado: ${formatDateDisplay(item.date)}`}
                    </span>
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
                      title={`${item.attachments.length} foto(s)/laudo(s) anexado(s)`}
                    >
                      <Paperclip className="w-3 h-3 text-blue-500" />
                      <span>{item.attachments.length}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-blue-600 font-bold text-xs group-hover:translate-x-0.5 transition ml-auto">
                  <span>Ver exame</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Exam Details Modal with image / X-ray preview */}
      {selectedExame && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug break-words">
                  {selectedExame.title}
                </h3>
                {/* Campo Status reordenado logo abaixo com data e tipo */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                      selectedExame.status === 'Realizado'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedExame.status === 'Solicitado' ? 'Agendado' : selectedExame.status}
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg">
                    {selectedExame.type}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Data: {formatDateDisplay(selectedExame.date)}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedExame(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer shrink-0"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* If Exam is X-Ray or has preview, show the realistic X-ray preview component */}
            {(selectedExame.fileType === 'xray' || selectedExame.type === 'Raio-X') && (
              <div className="mb-4">
                <p className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Chapa Radiográfica Digitalizada:</span>
                </p>
                <XRayPreview className="h-44 w-full" />
              </div>
            )}

            {/* Alteration Alert Banner */}
            {selectedExame.hasAlteration && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-sm mb-1">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600" />
                  <span>Alteração Detectada no Exame</span>
                </div>
                <p className="text-xs text-rose-800 font-medium leading-relaxed">
                  {selectedExame.alterationDetails || 'O resultado apresenta valores fora dos parâmetros padrão.'}
                </p>
              </div>
            )}

            {/* Observations & Location & Attachments */}
            {(() => {
              const exameAttachments = (selectedExame.attachments && selectedExame.attachments.length > 0)
                ? selectedExame.attachments
                : (selectedExame.fileUrl ? [selectedExame.fileUrl] : []);
              const hasAnyInfo = selectedExame.location || selectedExame.doctorRequested || selectedExame.observations || exameAttachments.length > 0;

              if (!hasAnyInfo) return null;

              return (
                <div className="space-y-2.5 bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 mb-4 border border-slate-100">
                  {selectedExame.location && (
                    <div>
                      <span className="font-bold text-slate-700 text-xs">Laboratório / Clínica:</span>{' '}
                      <span className="text-slate-600">{selectedExame.location}</span>
                    </div>
                  )}

                  {selectedExame.doctorRequested && (
                    <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl">
                      <User className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-700 text-xs">Médico solicitante:</span>{' '}
                        <span className="text-slate-800 font-bold break-words">{selectedExame.doctorRequested}</span>
                      </div>
                    </div>
                  )}

                  {selectedExame.observations && (
                    <div className={selectedExame.location || selectedExame.doctorRequested ? "pt-2 border-t border-slate-200/60" : ""}>
                      <span className="font-bold text-slate-700 text-xs">Comentários e Laudo:</span>
                      <p className="mt-1 text-slate-600 leading-relaxed font-medium text-xs">
                        {selectedExame.observations}
                      </p>
                    </div>
                  )}

                  {/* Photos & Documents Attached in Details */}
                  {exameAttachments.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-200/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                          <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                          Documentos e Fotos ({exameAttachments.length})
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {exameAttachments.map((att, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewImage(att)}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white cursor-pointer hover:border-blue-400 shadow-2xs transition"
                            title="Clique para ampliar em tela cheia"
                          >
                            <img
                              src={att}
                              alt={`Anexo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                              <ZoomIn className="w-4.5 h-4.5 text-white opacity-0 group-hover:opacity-100 transition drop-shadow" />
                            </div>
                            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white flex items-center gap-0.5 font-semibold">
                              <ZoomIn className="w-2.5 h-2.5" />
                              <span>Ver</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Action buttons */}
            <div className="space-y-2">
              {selectedExame.status === 'Agendado' || selectedExame.status === 'Solicitado' ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenCompleteModal}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs active:scale-98"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Marcar como Realizado</span>
                  </button>

                  <button
                    onClick={() => {
                      onDeleteExame(selectedExame.id);
                      setSelectedExame(null);
                    }}
                    className="py-3 px-3.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Excluir exame"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleOpenCompleteModal}
                    className="w-full py-2.5 px-3 rounded-xl bg-sky-50 text-blue-600 hover:bg-sky-100 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-sky-200/50 active:scale-98"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar Comentário / Fotos</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onUpdateExame(selectedExame.id, { status: 'Agendado' });
                        setSelectedExame({ ...selectedExame, status: 'Agendado' });
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition cursor-pointer"
                    >
                      Reverter para Agendado
                    </button>

                    <button
                      onClick={() => {
                        onDeleteExame(selectedExame.id);
                        setSelectedExame(null);
                      }}
                      className="py-2.5 px-3.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1 transition cursor-pointer"
                      title="Excluir exame"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Adicionar Novo Exame (com tirar foto / anexar documento) */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Adicionar Exame
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Cadastre o exame e anexe laudos ou fotos
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewExam} className="overflow-y-auto no-scrollbar space-y-3.5 flex-1 pr-0.5">
              {/* Exam Title */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Nome do Exame *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Hemograma Completo, Raio-X de Tórax..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Médico Solicitante ocupando toda a largura do painel */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Médico Solicitante (opcional)</span>
                </label>
                <input
                  type="text"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  placeholder="Ex: Dr. Marcelo Pediátrico"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Exam Type & Status */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Tipo do Exame
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Sangue">Sangue</option>
                    <option value="Raio-X">Raio-X</option>
                    <option value="Urina">Urina</option>
                    <option value="Ultrassom">Ultrassom</option>
                    <option value="Tomografia">Tomografia</option>
                    <option value="Ressonância">Ressonância</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-xs mb-1">
                    Situação
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Agendado">Agendado</option>
                    <option value="Realizado">Realizado</option>
                  </select>
                </div>
              </div>

              {/* Date with native calendar picker */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  {newStatus === 'Agendado' ? 'Data Agendada *' : 'Data de Realização *'}
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Laboratório / Clínica
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Ex: Laboratório Sabin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Comment / Observations textarea */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Comentários / Observações do Laudo
                </label>
                <textarea
                  rows={2}
                  value={newObservations}
                  onChange={(e) => setNewObservations(e.target.value)}
                  placeholder="Ex: Recomendações de preparo, jejum ou orientações pós-exame..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/70 placeholder:text-slate-400 resize-none leading-relaxed"
                />
              </div>

              {/* Alteration Toggle */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Possui alteração ou resultado fora do padrão?
                  </span>
                  <input
                    type="checkbox"
                    checked={newHasAlteration}
                    onChange={(e) => setNewHasAlteration(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
                {newHasAlteration && (
                  <input
                    type="text"
                    value={newAlterationDetails}
                    onChange={(e) => setNewAlterationDetails(e.target.value)}
                    placeholder="Descreva a alteração (Ex: Leucócitos elevados, anemia leve...)"
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs focus:outline-none"
                  />
                )}
              </div>

              {/* Attachments Section (Fotos e Documentos) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    Anexar Fotos ou Documentos
                  </label>
                  <span className="text-xs text-slate-400 font-semibold">
                    {newAttachments.length} {newAttachments.length === 1 ? 'anexo' : 'anexos'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Tire fotos do pedido médico, laudo do laboratório ou resultado.
                </p>

                {/* Quick capture buttons */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => addCameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs transition cursor-pointer active:scale-98"
                  >
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span>Tirar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addGalleryInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-98"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Galeria / Arquivo</span>
                  </button>
                </div>

                {/* Hidden inputs for add modal */}
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

                {/* Upload progress & error indicator */}
                {isUploadingAdd && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold animate-pulse mb-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>Enviando foto para o Supabase Storage...</span>
                  </div>
                )}
                {uploadAddError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold mb-2">
                    {uploadAddError}
                  </div>
                )}

                {/* Thumbnails of attached files */}
                {newAttachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    {newAttachments.map((img, idx) => (
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
                          onClick={() => setNewAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition cursor-pointer"
                          title="Remover anexo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img)}
                          className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-0.5 font-semibold"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Ver</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save error banner if any */}
              {saveExamError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{saveExamError}</span>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploadingAdd || isSavingExam}
                  className="w-full py-3 rounded-full bg-[#3B82F6] hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                >
                  {isSavingExam ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando no Supabase...</span>
                    </>
                  ) : isUploadingAdd ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando fotos para o Supabase...</span>
                    </>
                  ) : (
                    <span>Salvar Exame</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Marcar como Realizado (Comentário e Anexo de Fotos) */}
      {showCompleteModal && selectedExame && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  {selectedExame.status === 'Realizado' ? 'Editar Exame' : 'Concluir Exame'}
                </span>
                <h3 className="text-lg font-black text-slate-800 mt-1">
                  {selectedExame.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Data: {formatDateDisplay(selectedExame.date)} • {selectedExame.type}
                </p>
              </div>

              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar space-y-3.5 flex-1 pr-0.5">
              {/* Comment / Observations textarea */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Comentário / Laudo do Exame
                </label>
                <textarea
                  rows={3}
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  placeholder="Ex: Resultados normais, orientações do laboratório ou médico..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/70 placeholder:text-slate-400 resize-none leading-relaxed"
                />
              </div>

              {/* Alteration Toggle in Complete Modal */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    O exame apresentou alguma alteração?
                  </span>
                  <input
                    type="checkbox"
                    checked={completeHasAlteration}
                    onChange={(e) => setCompleteHasAlteration(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
                {completeHasAlteration && (
                  <input
                    type="text"
                    value={completeAlterationDetails}
                    onChange={(e) => setCompleteAlterationDetails(e.target.value)}
                    placeholder="Descreva a alteração (Ex: Leucócitos elevados...)"
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs focus:outline-none"
                  />
                )}
              </div>

              {/* Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    Fotos ou Documentos do Exame
                  </label>
                  <span className="text-xs text-slate-400 font-semibold">
                    {completeAttachments.length} {completeAttachments.length === 1 ? 'anexo' : 'anexos'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Tire fotos da chapa, laudo laboratorial ou resultado entregue.
                </p>

                {/* Quick capture buttons */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => completeCameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs transition cursor-pointer active:scale-98"
                  >
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span>Tirar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => completeGalleryInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-98"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Galeria / Arquivo</span>
                  </button>
                </div>

                {/* Hidden inputs for complete modal */}
                <input
                  ref={completeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCompletePhotoCapture}
                  className="hidden"
                />
                <input
                  ref={completeGalleryInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleCompletePhotoCapture}
                  className="hidden"
                />

                {/* Upload progress & error indicator */}
                {isUploadingComplete && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-semibold animate-pulse mb-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                    <span>Enviando foto para o Supabase Storage...</span>
                  </div>
                )}
                {uploadCompleteError && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold mb-2">
                    {uploadCompleteError}
                  </div>
                )}

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
                          onClick={() => setCompleteAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition cursor-pointer"
                          title="Remover foto"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewImage(img)}
                          className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-0.5 font-semibold"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Ver</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Save error banner if any */}
            {saveCompleteError && (
              <div className="p-3 my-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{saveCompleteError}</span>
              </div>
            )}

            {/* Bottom confirmation actions */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                disabled={isSavingComplete}
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isUploadingComplete || isSavingComplete}
                onClick={handleSaveCompletedExam}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer active:scale-98"
              >
                {isSavingComplete ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Salvar Exame</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal with Zoom */}
      {previewImage && (
        <ImageViewerModal
          imageUrl={previewImage}
          title="Documento / Foto do Exame"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
