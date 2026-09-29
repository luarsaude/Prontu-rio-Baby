import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  FileText,
  Shield,
  Award,
  Calendar,
  X,
  Trash2,
  Camera,
  Image as ImageIcon,
  Paperclip,
  ZoomIn,
  Eye,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Documento } from '../types';
import { sortByDateAscending } from '../utils/dateOrder';
import { ImageViewerModal } from './ImageViewerModal';

interface DocumentosViewProps {
  documentos: Documento[];
  childId: string;
  onBack: () => void;
  onAddDocumento: (doc: Omit<Documento, 'id'>) => void;
  onDeleteDocumento: (id: string) => void;
}

export const DocumentosView: React.FC<DocumentosViewProps> = ({
  documentos,
  childId,
  onBack,
  onAddDocumento,
  onDeleteDocumento,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Documento['category']>('Cartão de Vacinas');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  // Input refs for camera and gallery
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

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

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && typeof reader.result === 'string') {
          setAttachments((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleRemoveAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleOpenAddModal = () => {
    setTitle('');
    setCategory('Cartão de Vacinas');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setAttachments([]);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!title.trim()) return;

    const formattedDate = toDisplayDate(date);

    // Prevenção contra salvamento duplo de documento
    const isDuplicate = documentos.some(
      (d) =>
        d.childId === (childId || 'default') &&
        d.title.trim().toLowerCase() === title.trim().toLowerCase() &&
        d.date === formattedDate &&
        d.category === category
    );
    if (isDuplicate) {
      alert('Este documento já foi cadastrado para esta data e categoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddDocumento({
        childId: childId || 'default',
        title: title.trim(),
        category,
        date: formattedDate,
        notes: notes.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
        fileUrl: attachments.length > 0 ? attachments[0] : undefined,
        fileType: 'image',
      });

      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocIcon = (cat: Documento['category']) => {
    if (cat === 'Cartão de Vacinas') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
          <Award className="w-6.5 h-6.5 stroke-[2]" />
        </div>
      );
    }
    if (cat === 'Plano de Saúde') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-blue-500 border border-sky-100 flex items-center justify-center shrink-0">
          <Shield className="w-6.5 h-6.5 stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 border border-indigo-100 flex items-center justify-center shrink-0">
        <FileText className="w-6.5 h-6.5 stroke-[2]" />
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F3F8FE] overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-lg cursor-pointer"
        >
          <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          <span>Documentos</span>
        </button>

        <button
          onClick={handleOpenAddModal}
          className="py-2 px-3.5 rounded-full bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Adicionar</span>
        </button>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 sm:p-5 space-y-3">
        {documentos.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-3">
              <FileText className="w-7 h-7 stroke-[2]" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">
              Nenhum documento cadastrado
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4 font-medium">
              Guarde certidões, cartões de vacina, laudos e fotos de documentos do seu filho.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="py-2.5 px-5 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Primeiro Documento</span>
            </button>
          </div>
        ) : (
          [...documentos].sort(sortByDateAscending).map((item) => {
            const allAttachments = item.attachments && item.attachments.length > 0
              ? item.attachments
              : item.fileUrl
              ? [item.fileUrl]
              : [];

            return (
              <div
                key={item.id}
                className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md hover:border-sky-300 transition flex flex-col gap-2.5 group"
              >
                {/* 1. Ícone e Título ocupando 100% da largura do painel */}
                <div
                  onClick={() => setSelectedDoc(item)}
                  className="flex items-start gap-3 w-full cursor-pointer"
                >
                  <div className="shrink-0 mt-0.5">
                    {getDocIcon(item.category)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.category}
                      </span>
                      {allAttachments.length > 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>{allAttachments.length} {allAttachments.length === 1 ? 'anexo' : 'anexos'}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-slate-800 break-words leading-snug mt-1 group-hover:text-blue-600 transition">
                      {item.title}
                    </h3>
                  </div>
                </div>

                {/* 2. Barra inferior com Data, Notas e Botões de Ação */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-semibold text-slate-600">{item.date}</span>
                    {item.notes && <span className="text-slate-400 truncate max-w-[200px]">• {item.notes}</span>}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-auto">
                    {allAttachments.length > 0 && (
                      <button
                        onClick={() => setSelectedDoc(item)}
                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                        title="Visualizar anexos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteDocumento(item.id)}
                      className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Excluir documento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Thumbnail strip if document has attachments */}
                {allAttachments.length > 0 && (
                  <div className="flex gap-2 pt-1 border-t border-slate-50 overflow-x-auto no-scrollbar">
                    {allAttachments.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(img)}
                        className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 cursor-pointer hover:opacity-90 transition group/thumb shadow-2xs"
                        title="Toque para ampliar"
                      >
                        <img
                          src={img}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/20 transition flex items-center justify-center">
                          <ZoomIn className="w-3.5 h-3.5 text-white opacity-0 group-hover/thumb:opacity-100 drop-shadow" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Adicionar Documento (com Câmera e Galeria) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-black text-slate-800">
                Adicionar Documento
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs overflow-y-auto no-scrollbar flex-1 pr-0.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Título do Documento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Carteira de Vacinação ou Plano de Saúde"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                >
                  <option value="Cartão de Vacinas">Cartão de Vacinas</option>
                  <option value="Plano de Saúde">Plano de Saúde</option>
                  <option value="Certidão">Certidão</option>
                  <option value="Laudo Médico">Laudo Médico</option>
                  <option value="Outro">Outro Documento</option>
                </select>
              </div>

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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700 cursor-pointer min-h-[42px]"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Anotações ou Número do Registro
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Registro nº 9821 ou vacinas de 5 anos ok"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Seção de Fotos e Anexos (Câmera ou Arquivo) */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    Fotos ou Documentos Anexos
                  </label>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {attachments.length} {attachments.length === 1 ? 'anexo' : 'anexos'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Tire fotos do documento físico ou anexe fotos e arquivos do celular.
                </p>

                {/* Botões de Câmera e Galeria */}
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-600 font-bold text-xs transition cursor-pointer active:scale-98"
                  >
                    <Camera className="w-4 h-4 text-blue-500" />
                    <span>Tirar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-98"
                  >
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Galeria / Arquivo</span>
                  </button>
                </div>

                {/* Hidden file inputs */}
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

                {/* Grade de miniaturas anexadas */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    {attachments.map((img, idx) => (
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-full bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando documento...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Salvar Documento</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg sm:max-w-xl bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col">
            <div className="flex justify-between items-start mb-3 pb-2 border-b border-slate-100 shrink-0">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {selectedDoc.category}
                </span>
                <h3 className="text-base font-black text-slate-800 mt-1">
                  {selectedDoc.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400">
                  Data: {selectedDoc.date}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto no-scrollbar space-y-4 flex-1">
              {selectedDoc.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-700 font-medium">
                    {selectedDoc.notes}
                  </p>
                </div>
              )}

              {/* Photos & Documents Attached */}
              {((selectedDoc.attachments && selectedDoc.attachments.length > 0) || selectedDoc.fileUrl) && (
                <div>
                  <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5 mb-2">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    Fotos e Anexos ({
                      (selectedDoc.attachments && selectedDoc.attachments.length > 0)
                        ? selectedDoc.attachments.length
                        : 1
                    })
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {((selectedDoc.attachments && selectedDoc.attachments.length > 0)
                      ? selectedDoc.attachments
                      : [selectedDoc.fileUrl!]
                    ).map((att, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImage(att)}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer hover:border-blue-400 shadow-2xs transition"
                        title="Clique para ampliar"
                      >
                        <img
                          src={att}
                          alt={`Documento ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition drop-shadow" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onDeleteDocumento(selectedDoc.id);
                  setSelectedDoc(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Documento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox Modal with Zoom */}
      {previewImage && (
        <ImageViewerModal
          imageUrl={previewImage}
          title="Documento / Anexo"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};
