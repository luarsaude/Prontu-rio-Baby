import React, { useState, useEffect } from 'react';
import { X, Plus, Check, User, Heart, ShieldAlert, Activity, Sparkles, Calendar, Users, Key, Trash2 } from 'lucide-react';
import { Child } from '../types';
import { BabyAvatar } from './MascotIcons';
import { SafeDeleteChildModal } from './SafeDeleteChildModal';

interface ChildModalProps {
  childrenList: Child[];
  activeChild: Child;
  onSelectChild: (id: string) => void;
  onAddChild: (child: Omit<Child, 'id'>) => void;
  onUpdateChild: (id: string, updated: Partial<Child>) => void;
  onDeleteChild?: (id: string) => void;
  onClose: () => void;
  onOpenFamilyShare?: () => void;
  onOpenEnterCode?: () => void;
}

export const ChildModal: React.FC<ChildModalProps> = ({
  childrenList,
  activeChild,
  onSelectChild,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onClose,
  onOpenFamilyShare,
  onOpenEnterCode,
}) => {
  const [isAdding, setIsAdding] = useState(childrenList.length === 0);
  const [isEditing, setIsEditing] = useState(false);
  const [showSafeDelete, setShowSafeDelete] = useState(false);

  // Form states (no fake defaults)
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  const [bloodType, setBloodType] = useState('A+');
  const [allergies, setAllergies] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [pediatricianName, setPediatricianName] = useState('');

  // Edit current child states
  const [editName, setEditName] = useState(activeChild?.name || '');
  const [editBirthDate, setEditBirthDate] = useState(activeChild?.birthDate || '');
  const [editBlood, setEditBlood] = useState(activeChild?.bloodType || 'A+');
  const [editAllergies, setEditAllergies] = useState(activeChild?.allergies?.join(', ') || '');
  const [editWeight, setEditWeight] = useState(activeChild?.weight || '');
  const [editHeight, setEditHeight] = useState(activeChild?.height || '');
  const [editPediatrician, setEditPediatrician] = useState(activeChild?.pediatricianName || '');

  // Keep edit fields synchronized when activeChild changes
  useEffect(() => {
    if (activeChild) {
      setEditName(activeChild.name || '');
      setEditBirthDate(activeChild.birthDate || '');
      setEditBlood(activeChild.bloodType || 'A+');
      setEditAllergies(activeChild.allergies?.join(', ') || '');
      setEditWeight(activeChild.weight || '');
      setEditHeight(activeChild.height || '');
      setEditPediatrician(activeChild.pediatricianName || '');
    }
  }, [activeChild]);

  // Helper to format date string (YYYY-MM-DD) nicely as DD/MM/YYYY
  const formatDateDisplay = (dateStr?: string): string => {
    if (!dateStr) return '';
    const clean = dateStr.trim();
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts.length >= 3) {
        const y = parts[0];
        const m = parts[1].padStart(2, '0');
        const d = parts[2].substring(0, 2).padStart(2, '0');
        return `${d}/${m}/${y}`;
      }
    }
    return clean;
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddChild({
      name: name.trim(),
      birthDate,
      gender,
      avatarId: gender === 'boy' ? 'baby-boy' : 'baby-girl',
      bloodType,
      allergies: allergies.split(',').map((a) => a.trim()).filter(Boolean),
      weight,
      height,
      pediatricianName,
    });

    // Reset fields
    setName('');
    setBirthDate('');
    setAllergies('');
    setWeight('');
    setHeight('');
    setPediatricianName('');
    setIsAdding(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateChild(activeChild.id, {
      name: editName.trim(),
      birthDate: editBirthDate,
      bloodType: editBlood,
      allergies: editAllergies.split(',').map((a) => a.trim()).filter(Boolean),
      weight: editWeight,
      height: editHeight,
      pediatricianName: editPediatrician,
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-black text-slate-800">
              {isAdding ? 'Cadastrar Filho(a)' : isEditing ? 'Editar Perfil' : 'Filhos Registrados'}
            </h3>
            <p className="text-xs text-slate-400">
              Prontuário e acompanhamento individual
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAdding ? (
          <form onSubmit={handleSaveNew} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome da Criança *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Helena ou Miguel"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Data de Nascimento</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gênero</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGender('boy')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      gender === 'boy' ? 'bg-sky-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Menino
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender('girl')}
                    className={`flex-1 py-2 rounded-xl font-bold border transition ${
                      gender === 'girl' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Menina
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo Sanguíneo</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none bg-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Peso</label>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 15 kg"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Altura</label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ex: 95 cm"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alergias conhecidas</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: Dipirona, Leite, Picada de inseto..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pediatra Responsável</label>
              <input
                type="text"
                value={pediatricianName}
                onChange={(e) => setPediatricianName(e.target.value)}
                placeholder="Ex: Dr. Carlos Silva"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700"
              >
                Cadastrar
              </button>
            </div>
          </form>
        ) : isEditing ? (
          <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome da Criança *</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Data de Nascimento</span>
              </label>
              <input
                type="date"
                value={editBirthDate}
                onChange={(e) => setEditBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Peso</label>
                <input
                  type="text"
                  value={editWeight}
                  onChange={(e) => setEditWeight(e.target.value)}
                  placeholder="Ex: 15 kg"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Altura</label>
                <input
                  type="text"
                  value={editHeight}
                  onChange={(e) => setEditHeight(e.target.value)}
                  placeholder="Ex: 95 cm"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo Sanguíneo</label>
              <select
                value={editBlood}
                onChange={(e) => setEditBlood(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alergias</label>
              <input
                type="text"
                value={editAllergies}
                onChange={(e) => setEditAllergies(e.target.value)}
                placeholder="Ex: Dipirona, Leite..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pediatra</label>
              <input
                type="text"
                value={editPediatrician}
                onChange={(e) => setEditPediatrician(e.target.value)}
                placeholder="Ex: Dr. Carlos Silva"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 font-bold"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-full bg-blue-600 text-white font-bold shadow-md hover:bg-blue-700"
              >
                Salvar Alterações
              </button>
            </div>

            {onDeleteChild && activeChild?.id && (
              <div className="pt-3 mt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSafeDelete(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-rose-200/80"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Excluir perfil com segurança</span>
                </button>
              </div>
            )}
          </form>
        ) : (
          <div className="space-y-4">
            {/* List of children */}
            <div className="space-y-2">
              {childrenList.map((child) => (
                <div
                  key={child.id}
                  onClick={() => onSelectChild(child.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                    child.id === activeChild.id
                      ? 'bg-sky-50 border-blue-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-sky-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <BabyAvatar size={42} />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-black text-slate-800">{child.name}</h4>
                        {child.isShared && (
                          <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" />
                            <span>{child.sharedRole || 'Mãe'}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-400">
                        {child.birthDate ? `Nascido em ${formatDateDisplay(child.birthDate)}` : 'Cadastro realizado'} {child.bloodType ? `• Sangue ${child.bloodType}` : ''}
                      </p>
                    </div>
                  </div>

                  {activeChild && child.id === activeChild.id ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-xs text-blue-600 font-bold">Selecionar</span>
                  )}
                </div>
              ))}
            </div>

            {/* Quick summary of active child */}
            {activeChild && activeChild.id && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Data de Nascimento:</span>
                  <span className="font-semibold text-slate-600">
                    {formatDateDisplay(activeChild.birthDate) || 'Não informada'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Alergias:</span>
                  <span className="font-bold text-rose-600">
                    {activeChild.allergies && activeChild.allergies.length > 0
                      ? activeChild.allergies.join(', ')
                      : 'Nenhuma registrada'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Peso / Altura:</span>
                  <span className="font-semibold text-slate-600">
                    {activeChild.weight || '--'} • {activeChild.height || '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Pediatra:</span>
                  <span className="font-semibold text-blue-600">
                    {activeChild.pediatricianName || 'Não informado'}
                  </span>
                </div>
                {activeChild.ownerEmail && (
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="font-bold text-slate-700">Responsável:</span>
                    <span className="font-semibold text-slate-500 truncate max-w-[200px]">
                      {activeChild.ownerEmail}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
              >
                Editar Dados
              </button>

              <button
                onClick={() => setIsAdding(true)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Filho</span>
              </button>
            </div>

            {/* Family Sharing Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              {activeChild?.id && onOpenFamilyShare && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFamilyShare();
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Compartilhar Prontuário</span>
                </button>
              )}

              {onOpenEnterCode && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEnterCode();
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-blue-600" />
                  <span>Código</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Exclusão Segura */}
      {showSafeDelete && activeChild && (
        <SafeDeleteChildModal
          child={activeChild}
          isOpen={showSafeDelete}
          onClose={() => setShowSafeDelete(false)}
          onConfirmDelete={async (id) => {
            if (onDeleteChild) {
              await onDeleteChild(id);
            }
            setShowSafeDelete(false);
            setIsEditing(false);
            onClose();
            return { success: true };
          }}
        />
      )}
    </div>
  );
};
