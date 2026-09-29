import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Paperclip,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  X,
  ZoomIn,
} from 'lucide-react';
import { Exame } from '../types';

interface ScannerModalProps {
  childId: string;
  onClose: () => void;
  onSaveExame: (exame: Omit<Exame, 'id'>) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  childId,
  onClose,
  onSaveExame,
}) => {
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<Exame['type']>('Raio-X');
  const [status, setStatus] = useState<'Agendado' | 'Realizado'>('Realizado');
  const [date, setDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [observations, setObservations] = useState('');
  const [hasAlteration, setHasAlteration] = useState(false);
  const [alterationDetails, setAlterationDetails] = useState('');
  const [location, setLocation] = useState('');
  const [doctorRequested, setDoctorRequested] = useState('');

  // Identical photo & file capture pattern from Consulta
  const [attachments, setAttachments] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedDate = toDisplayDate(date);
    onSaveExame({
      childId: childId || 'default',
      title: title.trim(),
      type: examType,
      status,
      date: formattedDate,
      expectedDate: status === 'Agendado' ? formattedDate : undefined,
      location: location.trim(),
      doctorRequested: doctorRequested.trim(),
      hasAlteration,
      alterationDetails: hasAlteration ? alterationDetails.trim() : undefined,
      observations: observations.trim(),
      fileType: examType === 'Raio-X' ? 'xray' : 'image',
      fileUrl: attachments.length > 0 ? attachments[0] : undefined,
      attachments: attachments,
    });

    onClose();
  };

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden relative">
      {/* Top Header */}
      <header className="px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-bold text-lg cursor-pointer"
        >
          <ArrowLeft className="w-5.5 h-5.5 stroke-[2.5]" />
          <span>Escanear / Adicionar Exame</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
        >
          <X className="w-5.5 h-5.5" />
        </button>
      </header>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <form onSubmit={handleSubmit} className="p-5 pb-16 space-y-4 text-xs">
          {/* Attachments Section - Identical to ConsultasView */}
          <div className="bg-sky-50/50 border border-sky-100 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Paperclip className="w-4 h-4 text-blue-500" />
                Fotos ou Documentos do Exame
              </label>
              <span className="text-xs text-slate-400 font-semibold">
                {attachments.length} {attachments.length === 1 ? 'anexo' : 'anexos'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Tire fotos do pedido médico, laudo do laboratório ou resultado do exame.
            </p>

            {/* Quick capture buttons - Identical to Consulta */}
            <div className="grid grid-cols-2 gap-2.5 mb-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs transition cursor-pointer active:scale-98 shadow-2xs"
              >
                <Camera className="w-4.5 h-4.5 text-blue-500" />
                <span>Tirar Foto</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer active:scale-98 shadow-2xs"
              >
                <ImageIcon className="w-4.5 h-4.5 text-slate-500" />
                <span>Galeria / Arquivo</span>
              </button>
            </div>

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

            {/* Thumbnails of attached files with Zoom and Remove */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-2xl border border-sky-200/60 mt-2">
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
                      className="absolute top-1 right-1 w-5.5 h-5.5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition cursor-pointer"
                      title="Remover anexo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(img)}
                      className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <ZoomIn className="w-3 h-3" />
                      <span>Ver</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Título do Exame / Procedimento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Hemograma, Raio-X de Tórax, Urina EAS..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">Status</label>
            <div className="flex gap-2">
              {(['Agendado', 'Realizado'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    status === st
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">
                Tipo
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Raio-X">Raio-X</option>
                <option value="Sangue">Exame de Sangue</option>
                <option value="Urina">Exame de Urina</option>
                <option value="Fezes">Exame de Fezes</option>
                <option value="Ultrassom">Ultrassonografia</option>
                <option value="Tomografia">Tomografia</option>
                <option value="Ressonância">Ressonância</option>
                <option value="Outro">Outro Exame</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                {status === 'Agendado' ? 'Data Agendada' : 'Data de Realização'}
              </label>
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
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Hospital / Laboratório
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Laboratório Sabin, Hospital da Criança..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">
              Médico Solicitante
            </label>
            <input
              type="text"
              value={doctorRequested}
              onChange={(e) => setDoctorRequested(e.target.value)}
              placeholder="Ex: Dr. Carlos Silva (Pediatra)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Alteration Toggle */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Houve alteração ou observação de atenção?</span>
              </div>
              <input
                type="checkbox"
                checked={hasAlteration}
                onChange={(e) => setHasAlteration(e.target.checked)}
                className="w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            {hasAlteration && (
              <div>
                <input
                  type="text"
                  value={alterationDetails}
                  onChange={(e) => setAlterationDetails(e.target.value)}
                  placeholder="Descreva a alteração (ex: Plaquetas baixas, secreção, mancha...)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-amber-950 font-medium focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Observações Médicas / Parecer do Exame
            </label>
            <textarea
              rows={3}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Anotações do médico, laudo ou orientações sobre o exame..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-[#3B82F6] hover:bg-blue-600 active:bg-blue-700 text-white font-black text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            <span>Salvar Exame</span>
          </button>
        </form>
      </div>

      {/* Fullscreen Photo Lightbox Modal - Identical to ConsultasView */}
      {previewImage && (
        <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm flex justify-between items-center mb-3 text-white">
            <span className="text-xs font-semibold text-slate-300">Documento / Foto Anexa</span>
            <button
              onClick={() => setPreviewImage(null)}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            >
              <X className="w-5.5 h-5.5" />
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
    </div>
  );
};
