import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Syringe,
  HelpCircle,
  Paperclip,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Camera,
  Upload,
  X,
  Eye,
  ShieldCheck,
  AlertCircle,
  Building2,
  Tag,
  Plus,
  Printer,
  Sparkles,
  Info,
  Clock,
  Trash2,
  ExternalLink,
  Check,
  ArrowUp,
  ChevronRight,
  ChevronLeft,
  Globe,
  Bell,
} from 'lucide-react';
import { Child, VacinaCatalogItem, VacinaRegistro, VacinaOferta, Lembrete } from '../types';
import { VACCINES_CATALOG, VACCINE_AGE_GROUPS, getVaccineSource } from '../data/vaccinesCatalog';
import { uploadMedicalPhotoToSupabase } from '../services/supabase';
import { parseDateAndTimeToTimestamp } from '../utils/dateOrder';
import { ImageViewerModal } from './ImageViewerModal';

interface VacinasViewProps {
  child: Child;
  vacinas: VacinaRegistro[];
  onSaveVacina: (registro: Partial<VacinaRegistro> & { childId: string; vacinaId: string; nome: string }) => Promise<void>;
  onDeleteVacina?: (id: string) => Promise<void>;
  onAddLembrete?: (lembrete: Omit<Lembrete, 'id'>) => Promise<Lembrete | undefined>;
  onDeleteLembreteByRelatedId?: (relatedId: string) => Promise<void>;
  onBackToHome: () => void;
  onOpenSettings?: () => void;
}

export const VacinasView: React.FC<VacinasViewProps> = ({
  child,
  vacinas,
  onSaveVacina,
  onDeleteVacina,
  onAddLembrete,
  onDeleteLembreteByRelatedId,
  onBackToHome,
}) => {
  // Dynamic calculation of child's exact age and current vaccination group
  const { babyAgeMonths, childAgeFormatted, babyAgeGroupId } = useMemo(() => {
    if (!child?.birthDate) {
      return { babyAgeMonths: null, childAgeFormatted: '', babyAgeGroupId: null };
    }

    // Parse YYYY-MM-DD safely without timezone shifts
    const parts = child.birthDate.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return { babyAgeMonths: null, childAgeFormatted: '', babyAgeGroupId: null };
    }

    const [bYear, bMonth, bDay] = parts;
    const birth = new Date(bYear, bMonth - 1, bDay);
    if (isNaN(birth.getTime())) {
      return { babyAgeMonths: null, childAgeFormatted: '', babyAgeGroupId: null };
    }

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

    const totalMonths = Math.max(0, years * 12 + months);

    // Formatted label, e.g. "1 ano e 2 meses", "2 meses", "1 mês"
    let formatted = '';
    if (years === 0) {
      if (totalMonths === 0) {
        formatted = days > 0 ? `${days} ${days === 1 ? 'dia' : 'dias'}` : 'Recém-nascido';
      } else {
        formatted = `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
      }
    } else {
      const anoStr = years === 1 ? '1 ano' : `${years} anos`;
      if (months === 0) {
        formatted = anoStr;
      } else {
        const mesStr = months === 1 ? '1 mês' : `${months} meses`;
        formatted = `${anoStr} e ${mesStr}`;
      }
    }

    // Map to active VACCINE_AGE_GROUPS id
    let groupId = 'ao-nascer';
    if (totalMonths < 2) {
      groupId = 'ao-nascer';
    } else if (totalMonths === 2) {
      groupId = '2-meses';
    } else if (totalMonths === 3) {
      groupId = '3-meses';
    } else if (totalMonths === 4) {
      groupId = '4-meses';
    } else if (totalMonths === 5) {
      groupId = '5-meses';
    } else if (totalMonths === 6) {
      groupId = '6-meses';
    } else if (totalMonths >= 7 && totalMonths < 9) {
      groupId = '7-meses';
    } else if (totalMonths >= 9 && totalMonths < 12) {
      groupId = '9-meses';
    } else if (totalMonths >= 12 && totalMonths < 15) {
      groupId = '12-meses'; // 12 meses (1 ano) até 1 ano e 2 meses!
    } else if (totalMonths >= 15 && totalMonths < 18) {
      groupId = '15-meses'; // 1 ano e 3m até 1 ano e 5m
    } else if (totalMonths >= 18 && totalMonths < 48) {
      groupId = '18-meses'; // 1 ano e 6m até 3 anos e 11m
    } else if (totalMonths >= 48 && totalMonths < 108) {
      groupId = '4-anos'; // 4 anos até 8 anos e 11m
    } else if (totalMonths >= 108) {
      groupId = '9-14-anos';
    }

    return { babyAgeMonths: totalMonths, childAgeFormatted: formatted, babyAgeGroupId: groupId };
  }, [child?.birthDate]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOferta, setFilterOferta] = useState<'TODAS' | 'SUS' | 'PARTICULAR'>('TODAS');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'VACINADO' | 'AGENDADO' | 'PENDENTE'>('TODOS');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [expandedAgeGroups, setExpandedAgeGroups] = useState<Record<string, boolean>>(() => {
    // If child age group is known, keep it open by default
    return {};
  });

  // Automatically expand the section of the child's current age when loaded
  useEffect(() => {
    if (babyAgeGroupId) {
      setExpandedAgeGroups((prev) => {
        if (Object.keys(prev).length === 0) {
          return { [babyAgeGroupId]: true };
        }
        return prev;
      });
    }
  }, [babyAgeGroupId]);

  // Auto-scroll the horizontal age bar to the baby's age group so the parent sees it immediately
  useEffect(() => {
    if (babyAgeGroupId && filterAgeBarRef.current) {
      const timer = setTimeout(() => {
        const el = filterAgeBarRef.current?.querySelector<HTMLElement>(`[data-age-group="${babyAgeGroupId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [babyAgeGroupId]);

  const allAgeGroupsExpanded = useMemo(() => {
    return VACCINE_AGE_GROUPS.every((g) => !!expandedAgeGroups[g.id]);
  }, [expandedAgeGroups]);

  const handleToggleExpandAll = () => {
    const nextState = !allAgeGroupsExpanded;
    const updated: Record<string, boolean> = {};
    for (const g of VACCINE_AGE_GROUPS) {
      updated[g.id] = nextState;
    }
    setExpandedAgeGroups(updated);
  };

  // Modals state
  const [selectedInfoVaccine, setSelectedInfoVaccine] = useState<VacinaCatalogItem | null>(null);
  const [editVaccineItem, setEditVaccineItem] = useState<{
    catalogItem?: VacinaCatalogItem;
    record?: VacinaRegistro;
  } | null>(null);

  // Modal Marcar Vacina (Realizada vs Agendada com Lembrete)
  const [marcarModalItem, setMarcarModalItem] = useState<{
    catalogItem: VacinaCatalogItem;
    record?: VacinaRegistro;
  } | null>(null);
  const [marcarTipo, setMarcarTipo] = useState<'realizada' | 'agendada'>('realizada');
  const [realizadaData, setRealizadaData] = useState<string>('');
  const [realizadaLocal, setRealizadaLocal] = useState<string>('');
  const [realizadaLote, setRealizadaLote] = useState<string>('');
  const [agendadaData, setAgendadaData] = useState<string>('');
  const [agendadaHora, setAgendadaHora] = useState<string>('09:00');
  const [agendadaLocal, setAgendadaLocal] = useState<string>('');
  const [notifyHoursBefore, setNotifyHoursBefore] = useState<number>(24);
  const [isSavingMarcar, setIsSavingMarcar] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'idade' | 'dataAplicacao'>('idade');

  // Scroll to top state & horizontal refs
  const [showScrollTopButton, setShowScrollTopButton] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const filterAgeBarRef = useRef<HTMLDivElement>(null);

  const scrollHorizontally = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop;
    if (top > 250) {
      if (!showScrollTopButton) setShowScrollTopButton(true);
    } else {
      if (showScrollTopButton) setShowScrollTopButton(false);
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Form state for vaccination record
  const [formVacinado, setFormVacinado] = useState<boolean>(true);
  const [formDataVacinacao, setFormDataVacinacao] = useState<string>('');
  const [formLote, setFormLote] = useState<string>('');
  const [formLaboratorio, setFormLaboratorio] = useState<string>('');
  const [formLocalVacinacao, setFormLocalVacinacao] = useState<string>('');
  const [formProfissional, setFormProfissional] = useState<string>('');
  const [formObservacoes, setFormObservacoes] = useState<string>('');
  const [formAttachments, setFormAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Attachment preview / zoom modal
  const [previewAttachmentUrl, setPreviewAttachmentUrl] = useState<string | null>(null);

  // Quick clip modal for directly adding/viewing receipt of a vaccine
  const [clipModalItem, setClipModalItem] = useState<{
    catalogItem: VacinaCatalogItem;
    record?: VacinaRegistro;
  } | null>(null);

  // Custom vaccine modal
  const [showAddCustomModal, setShowAddCustomModal] = useState<boolean>(false);
  const [customNome, setCustomNome] = useState<string>('');
  const [customDose, setCustomDose] = useState<string>('Dose única');
  const [customIdade, setCustomIdade] = useState<string>('Campanhas / Outras');
  const [customOferta, setCustomOferta] = useState<VacinaOferta>('SUS');
  const [customParaQueServe, setCustomParaQueServe] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const clipFileInputRef = useRef<HTMLInputElement>(null);

  // Quick lookup of existing records by vacinaId
  const recordsMap = useMemo(() => {
    const map = new Map<string, VacinaRegistro>();
    for (const v of vacinas) {
      if (v.childId === child.id) {
        map.set(v.vacinaId, v);
      }
    }
    return map;
  }, [vacinas, child.id]);

  // Combined vaccine list (Catalog + Custom vaccines registered for this child)
  const allVaccineItems = useMemo(() => {
    const items: VacinaCatalogItem[] = [...VACCINES_CATALOG];
    // Check if any custom vaccines exist in user records
    for (const rec of vacinas) {
      if (rec.childId === child.id && rec.vacinaId.startsWith('custom_')) {
        const alreadyInCatalog = items.some((item) => item.id === rec.vacinaId);
        if (!alreadyInCatalog) {
          items.push({
            id: rec.vacinaId,
            nome: rec.nome,
            dose: rec.dose,
            idadeRecomendada: rec.idadeRecomendada,
            ageOrder: rec.ageOrder ?? 999,
            oferta: rec.oferta,
            obrigatoria: false,
            descricaoCurta: rec.observacoes || 'Vacina complementar cadastrada pela família.',
            paraQueServe: rec.observacoes || 'Vacina ou reforço prescrito individualmente.',
            doencasEvitadas: [],
            reacoesComuns: 'Consulte o pediatra ou a bula para reações específicas.',
            cuidados: 'Manter cuidados habituais e hidratação.',
          });
        }
      }
    }
    return items;
  }, [vacinas, child.id]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalDoses = allVaccineItems.length;
    let appliedDoses = 0;
    let scheduledDoses = 0;
    let susCount = 0;
    let particularCount = 0;

    for (const item of allVaccineItems) {
      const rec = recordsMap.get(item.id);
      if (rec && rec.vacinado) {
        appliedDoses++;
      } else if (rec && (rec.status === 'Agendada' || rec.dataAgendada)) {
        scheduledDoses++;
      }
      if (item.oferta === 'SUS') susCount++;
      else if (item.oferta === 'Particular') particularCount++;
      else {
        susCount++;
        particularCount++;
      }
    }

    const percentage = totalDoses > 0 ? Math.round((appliedDoses / totalDoses) * 100) : 0;
    return {
      totalDoses,
      appliedDoses,
      scheduledDoses,
      pendingDoses: Math.max(0, totalDoses - appliedDoses - scheduledDoses),
      percentage,
      susCount,
      particularCount,
    };
  }, [allVaccineItems, recordsMap]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return allVaccineItems.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.nome.toLowerCase().includes(q);
        const matchesDose = item.dose.toLowerCase().includes(q);
        const matchesAge = item.idadeRecomendada.toLowerCase().includes(q);
        const matchesDisease = item.doencasEvitadas.some((d) => d.toLowerCase().includes(q));
        const matchesForWhat = item.paraQueServe.toLowerCase().includes(q);
        if (!matchesName && !matchesDose && !matchesAge && !matchesDisease && !matchesForWhat) {
          return false;
        }
      }

      // Filter Oferta (SUS vs Particular)
      if (filterOferta === 'SUS' && item.oferta === 'Particular') {
        return false;
      }
      if (filterOferta === 'PARTICULAR' && item.oferta === 'SUS') {
        return false;
      }

      // Filter Status (Vacinado vs Agendado vs Pendente)
      const rec = recordsMap.get(item.id);
      const isVacinado = !!(rec && rec.vacinado);
      const isAgendado = !isVacinado && !!(rec?.status === 'Agendada' || rec?.dataAgendada);
      if (filterStatus === 'VACINADO' && !isVacinado) {
        return false;
      }
      if (filterStatus === 'AGENDADO' && !isAgendado) {
        return false;
      }
      if (filterStatus === 'PENDENTE' && (isVacinado || isAgendado)) {
        return false;
      }

      // Filter Age Group
      if (selectedAgeGroup !== 'all') {
        const groupObj = VACCINE_AGE_GROUPS.find((g) => g.id === selectedAgeGroup);
        if (groupObj) {
          if (groupObj.id === 'especiais') {
            if (item.ageOrder < 999) return false;
          } else {
            if (item.ageOrder !== groupObj.ageOrder) return false;
          }
        }
      }

      return true;
    });
  }, [allVaccineItems, searchQuery, filterOferta, filterStatus, selectedAgeGroup, recordsMap]);

  // Group filtered items by Age Group
  const groupedSections = useMemo(() => {
    const groups: {
      group: typeof VACCINE_AGE_GROUPS[0];
      items: VacinaCatalogItem[];
      appliedCount: number;
    }[] = [];

    for (const g of VACCINE_AGE_GROUPS) {
      const itemsInGroup = filteredItems.filter((item) => {
        if (g.id === 'especiais') {
          return item.ageOrder >= 999;
        }
        return item.ageOrder === g.ageOrder;
      });

      if (itemsInGroup.length > 0) {
        // Ordena itens do grupo em ordem cronológica crescente por data de aplicação / agendamento
        const sortedItemsInGroup = [...itemsInGroup].sort((a, b) => {
          const recA = recordsMap.get(a.id);
          const recB = recordsMap.get(b.id);
          const dateA = recA?.dataVacinacao || recA?.dataAgendada;
          const timeA = recA?.horaAgendada;
          const dateB = recB?.dataVacinacao || recB?.dataAgendada;
          const timeB = recB?.horaAgendada;

          if (dateA && dateB) {
            const tsA = parseDateAndTimeToTimestamp(dateA, timeA);
            const tsB = parseDateAndTimeToTimestamp(dateB, timeB);
            if (tsA !== tsB) return tsA - tsB;
          }
          if (dateA && !dateB) return -1;
          if (!dateA && dateB) return 1;
          return (a.ageOrder || 0) - (b.ageOrder || 0);
        });

        const applied = itemsInGroup.filter((item) => {
          const rec = recordsMap.get(item.id);
          return rec && rec.vacinado;
        }).length;

        groups.push({
          group: g,
          items: sortedItemsInGroup,
          appliedCount: applied,
        });
      }
    }

    return groups;
  }, [filteredItems, recordsMap]);

  // Lista de todas as vacinas aplicadas em ordem crescente por data e hora da aplicação
  const appliedVaccinesChronological = useMemo(() => {
    const list: {
      catalogItem: VacinaCatalogItem;
      record: VacinaRegistro;
      timestamp: number;
    }[] = [];

    for (const item of allVaccineItems) {
      const rec = recordsMap.get(item.id);
      if (rec && rec.vacinado && rec.dataVacinacao) {
        const ts = parseDateAndTimeToTimestamp(rec.dataVacinacao, rec.horaAgendada);
        list.push({
          catalogItem: item,
          record: rec,
          timestamp: ts,
        });
      }
    }

    // Ordenação estritamente crescente (mais antiga primeiro até a mais recente)
    list.sort((a, b) => a.timestamp - b.timestamp);
    return list;
  }, [allVaccineItems, recordsMap]);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedAgeGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Open Edit Modal for a vaccine
  const handleOpenEdit = (catalogItem: VacinaCatalogItem) => {
    const existingRec = recordsMap.get(catalogItem.id);
    const today = new Date().toISOString().split('T')[0];

    setFormVacinado(existingRec ? existingRec.vacinado : true);
    setFormDataVacinacao(existingRec?.dataVacinacao || today);
    setFormLote(existingRec?.lote || '');
    setFormLaboratorio(existingRec?.laboratorio || '');
    setFormLocalVacinacao(existingRec?.localVacinacao || (catalogItem.oferta === 'SUS' ? 'UBS / Posto de Saúde' : 'Clínica de Vacinação'));
    setFormProfissional(existingRec?.profissional || '');
    setFormObservacoes(existingRec?.observacoes || '');
    setFormAttachments(existingRec?.attachments || (existingRec?.comprovanteUrl ? [existingRec.comprovanteUrl] : []));
    setUploadError(null);

    setEditVaccineItem({
      catalogItem,
      record: existingRec,
    });
  };

  // Open Marcar Modal (Realizada vs Agendada com Lembrete)
  const handleOpenMarcarModal = (catalogItem: VacinaCatalogItem) => {
    const existingRec = recordsMap.get(catalogItem.id);
    const today = new Date().toISOString().split('T')[0];

    if (existingRec?.status === 'Agendada' || (!existingRec?.vacinado && existingRec?.dataAgendada)) {
      setMarcarTipo('agendada');
      setAgendadaData(existingRec.dataAgendada || today);
      setAgendadaHora(existingRec.horaAgendada || '09:00');
      setAgendadaLocal(existingRec.localVacinacao || (catalogItem.oferta === 'SUS' ? 'UBS / Posto de Saúde' : 'Clínica de Vacinas'));
      setRealizadaData(today);
      setRealizadaLocal(existingRec.localVacinacao || (catalogItem.oferta === 'SUS' ? 'UBS / Posto de Saúde' : 'Clínica de Vacinas'));
      setRealizadaLote(existingRec.lote || '');
    } else {
      setMarcarTipo('realizada');
      setRealizadaData(existingRec?.dataVacinacao || today);
      setRealizadaLocal(existingRec?.localVacinacao || (catalogItem.oferta === 'SUS' ? 'UBS / Posto de Saúde' : 'Clínica de Vacinas'));
      setRealizadaLote(existingRec?.lote || '');
      setAgendadaData(existingRec?.dataAgendada || today);
      setAgendadaHora(existingRec?.horaAgendada || '09:00');
      setAgendadaLocal(existingRec?.localVacinacao || (catalogItem.oferta === 'SUS' ? 'UBS / Posto de Saúde' : 'Clínica de Vacinas'));
    }

    setMarcarModalItem({
      catalogItem,
      record: existingRec,
    });
  };

  const handleConfirmMarcarRealizada = async () => {
    if (!marcarModalItem) return;
    setIsSavingMarcar(true);
    try {
      const { catalogItem, record } = marcarModalItem;
      const today = new Date().toISOString().split('T')[0];

      await onSaveVacina({
        id: record?.id,
        childId: child.id,
        vacinaId: catalogItem.id,
        nome: catalogItem.nome,
        dose: catalogItem.dose,
        idadeRecomendada: catalogItem.idadeRecomendada,
        ageOrder: catalogItem.ageOrder,
        oferta: catalogItem.oferta,
        vacinado: true,
        status: 'Realizada',
        dataVacinacao: realizadaData || today,
        dataAgendada: undefined,
        horaAgendada: undefined,
        localVacinacao: realizadaLocal || undefined,
        lote: realizadaLote || undefined,
        attachments: record?.attachments || [],
      });

      // Se havia lembrete de agendamento prévio, remove
      if (onDeleteLembreteByRelatedId) {
        await onDeleteLembreteByRelatedId(catalogItem.id);
      }

      setMarcarModalItem(null);
    } finally {
      setIsSavingMarcar(false);
    }
  };

  const handleConfirmMarcarAgendada = async () => {
    if (!marcarModalItem) return;
    if (!agendadaData) {
      alert('Por favor, informe a data agendada para a vacinação.');
      return;
    }

    setIsSavingMarcar(true);
    try {
      const { catalogItem, record } = marcarModalItem;

      // 1. Salva registro de vacina com status "Agendada"
      await onSaveVacina({
        id: record?.id,
        childId: child.id,
        vacinaId: catalogItem.id,
        nome: catalogItem.nome,
        dose: catalogItem.dose,
        idadeRecomendada: catalogItem.idadeRecomendada,
        ageOrder: catalogItem.ageOrder,
        oferta: catalogItem.oferta,
        vacinado: false,
        status: 'Agendada',
        dataAgendada: agendadaData,
        horaAgendada: agendadaHora || '09:00',
        localVacinacao: agendadaLocal || undefined,
        attachments: record?.attachments || [],
      });

      // 2. Cria lembrete no sistema para alertar o usuário
      if (onAddLembrete) {
        if (onDeleteLembreteByRelatedId) {
          await onDeleteLembreteByRelatedId(catalogItem.id);
        }

        const parts = agendadaData.split('-');
        const dateFormatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : agendadaData;

        await onAddLembrete({
          childId: child.id,
          type: 'Vacina',
          title: `Vacina: ${catalogItem.nome}`,
          subtitle: `${catalogItem.dose} (${catalogItem.oferta === 'SUS' ? 'SUS' : 'Particular'})\nPrevista para ${dateFormatted} às ${agendadaHora || '09:00'}${agendadaLocal ? ` • ${agendadaLocal}` : ''}`,
          date: agendadaData,
          time: agendadaHora || '09:00',
          completed: false,
          relatedId: catalogItem.id,
          notifyHoursBefore: notifyHoursBefore,
          soundId: 'gentle_bell',
        });
      }

      setMarcarModalItem(null);
    } finally {
      setIsSavingMarcar(false);
    }
  };

  const handleDesmarcarVacina = async () => {
    if (!marcarModalItem) return;
    setIsSavingMarcar(true);
    try {
      const { catalogItem, record } = marcarModalItem;
      if (record) {
        await onSaveVacina({
          ...record,
          vacinado: false,
          status: 'Pendente',
          dataVacinacao: undefined,
          dataAgendada: undefined,
          horaAgendada: undefined,
        });

        if (onDeleteLembreteByRelatedId) {
          await onDeleteLembreteByRelatedId(catalogItem.id);
        }
      }
      setMarcarModalItem(null);
    } finally {
      setIsSavingMarcar(false);
    }
  };

  // Quick toggle vacinado directly from card (agora abre modal perguntando realizada ou agendada)
  const handleQuickToggleVacinado = (catalogItem: VacinaCatalogItem) => {
    handleOpenMarcarModal(catalogItem);
  };

  // Open Clip / Attachment Modal
  const handleOpenClipModal = (catalogItem: VacinaCatalogItem) => {
    const existingRec = recordsMap.get(catalogItem.id);
    setClipModalItem({
      catalogItem,
      record: existingRec,
    });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFromClipModal = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await uploadMedicalPhotoToSupabase(file, 'vacinas');
        if (res.url) {
          uploadedUrls.push(res.url);
        } else {
          // Fallback to local Base64 URL so upload never fails for user
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          const base64Url = await base64Promise;
          uploadedUrls.push(base64Url);
        }
      } catch {
        // Fallback
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const base64Url = await base64Promise;
        uploadedUrls.push(base64Url);
      }
    }

    setIsUploadingPhoto(false);

    if (isFromClipModal && clipModalItem) {
      // Auto-save to the vaccine record immediately!
      const currentAtts = clipModalItem.record?.attachments || (clipModalItem.record?.comprovanteUrl ? [clipModalItem.record.comprovanteUrl] : []);
      const newAtts = [...currentAtts, ...uploadedUrls];
      const today = new Date().toISOString().split('T')[0];

      await onSaveVacina({
        id: clipModalItem.record?.id,
        childId: child.id,
        vacinaId: clipModalItem.catalogItem.id,
        nome: clipModalItem.catalogItem.nome,
        dose: clipModalItem.catalogItem.dose,
        idadeRecomendada: clipModalItem.catalogItem.idadeRecomendada,
        ageOrder: clipModalItem.catalogItem.ageOrder,
        oferta: clipModalItem.catalogItem.oferta,
        vacinado: clipModalItem.record ? clipModalItem.record.vacinado : true,
        dataVacinacao: clipModalItem.record?.dataVacinacao || today,
        attachments: newAtts,
        comprovanteUrl: newAtts[0],
      });

      // Update clip modal state
      setClipModalItem((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          record: {
            ...prev.record,
            id: prev.record?.id || `vac_${Date.now()}`,
            childId: child.id,
            vacinaId: prev.catalogItem.id,
            nome: prev.catalogItem.nome,
            dose: prev.catalogItem.dose,
            idadeRecomendada: prev.catalogItem.idadeRecomendada,
            oferta: prev.catalogItem.oferta,
            vacinado: prev.record ? prev.record.vacinado : true,
            attachments: newAtts,
            comprovanteUrl: newAtts[0],
          },
        };
      });
    } else {
      setFormAttachments((prev) => [...prev, ...uploadedUrls]);
    }

    if (e.target) {
      e.target.value = '';
    }
  };

  // Remove photo from attachment list
  const handleRemoveAttachment = async (indexToRemove: number, isFromClipModal = false) => {
    if (isFromClipModal && clipModalItem) {
      const currentAtts = clipModalItem.record?.attachments || [];
      const updated = currentAtts.filter((_, idx) => idx !== indexToRemove);

      await onSaveVacina({
        ...clipModalItem.record!,
        childId: child.id,
        vacinaId: clipModalItem.catalogItem.id,
        nome: clipModalItem.catalogItem.nome,
        attachments: updated,
        comprovanteUrl: updated.length > 0 ? updated[0] : undefined,
      });

      setClipModalItem((prev) => {
        if (!prev || !prev.record) return null;
        return {
          ...prev,
          record: {
            ...prev.record,
            attachments: updated,
            comprovanteUrl: updated.length > 0 ? updated[0] : undefined,
          },
        };
      });
    } else {
      setFormAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    }
  };

  // Save changes from Edit Modal
  const handleSaveEdit = async () => {
    if (!editVaccineItem) return;
    setIsSubmitting(true);

    try {
      const catalogItem = editVaccineItem.catalogItem;
      const nome = catalogItem?.nome || editVaccineItem.record?.nome || 'Vacina';
      const dose = catalogItem?.dose || editVaccineItem.record?.dose || 'Dose';
      const idade = catalogItem?.idadeRecomendada || editVaccineItem.record?.idadeRecomendada || '';
      const vacinaId = catalogItem?.id || editVaccineItem.record?.vacinaId || `vac_${Date.now()}`;
      const oferta = catalogItem?.oferta || editVaccineItem.record?.oferta || 'SUS';
      const ageOrder = catalogItem?.ageOrder ?? editVaccineItem.record?.ageOrder ?? 0;

      await onSaveVacina({
        id: editVaccineItem.record?.id,
        childId: child.id,
        vacinaId,
        nome,
        dose,
        idadeRecomendada: idade,
        ageOrder,
        oferta,
        vacinado: formVacinado,
        dataVacinacao: formVacinado ? formDataVacinacao : undefined,
        lote: formLote.trim() || undefined,
        laboratorio: formLaboratorio.trim() || undefined,
        localVacinacao: formLocalVacinacao.trim() || undefined,
        profissional: formProfissional.trim() || undefined,
        observacoes: formObservacoes.trim() || undefined,
        attachments: formAttachments,
        comprovanteUrl: formAttachments.length > 0 ? formAttachments[0] : undefined,
      });

      setEditVaccineItem(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save new custom vaccine
  const handleSaveCustomVaccine = async () => {
    if (!customNome.trim()) return;

    setIsSubmitting(true);
    try {
      const customId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const today = new Date().toISOString().split('T')[0];

      await onSaveVacina({
        childId: child.id,
        vacinaId: customId,
        nome: customNome.trim(),
        dose: customDose.trim() || 'Dose única',
        idadeRecomendada: customIdade,
        ageOrder: 999,
        oferta: customOferta,
        vacinado: false,
        dataVacinacao: today,
        observacoes: customParaQueServe.trim() || undefined,
        attachments: [],
      });

      setShowAddCustomModal(false);
      setCustomNome('');
      setCustomDose('Dose única');
      setCustomParaQueServe('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-slate-50 overflow-hidden">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileUpload(e, false)}
        accept="image/*,application/pdf"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => handleFileUpload(e, false)}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={clipFileInputRef}
        onChange={(e) => handleFileUpload(e, true)}
        accept="image/*,application/pdf"
        className="hidden"
      />

      {/* Header Fixed at Top - Slim & Compact */}
      <div className="bg-white border-b border-slate-100 shrink-0 px-4 py-3 shadow-xs z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBackToHome}
              className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Voltar ao início"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Syringe className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 leading-tight">
                  Vacinas do Bebê
                </h1>
                <p className="text-xs text-slate-500 font-semibold truncate max-w-[220px] sm:max-w-xs">
                  {child.name} • {childAgeFormatted ? `${childAgeFormatted} • ` : ''}Calendário SUS & Particular
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowAddCustomModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Adicionar outra vacina"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Imprimir carteirinha"
            >
              <Printer className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div
        id="vacinas-scroll-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 w-full pb-48 smooth-scroll"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Progress & Age Filter Card (Corre com a tela, não fica fixo ocupando espaço) */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs space-y-3">
          {/* Progress & Summary Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {stats.appliedDoses} de {stats.totalDoses} doses aplicadas
                </span>
              </span>
              <span className="text-emerald-600 font-black">
                {stats.percentage}% em dia
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>

            {/* Sub-pills: SUS & Particular counts */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto visible-scrollbar-x pb-1 pt-0.5 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ofertadas pelo SUS ({stats.susCount})
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Rede Particular / Ampliada ({stats.particularCount})
              </span>
              {stats.scheduledDoses > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {stats.scheduledDoses} agendada(s)
                </span>
              )}
              {stats.pendingDoses > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                  <Clock className="w-3 h-3 text-amber-500" />
                  {stats.pendingDoses} doses pendentes
                </span>
              )}
            </div>
          </div>

          {/* Top Age Filter Bar (Barra de Idades Unificada - Corre com a tela) */}
          <div className="pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                <span className="tracking-wide">IDADE:</span>
                {childAgeFormatted && (
                  <button
                    type="button"
                    onClick={() => {
                      if (babyAgeGroupId) {
                        setSelectedAgeGroup(babyAgeGroupId);
                        setExpandedAgeGroups((prev) => ({ ...prev, [babyAgeGroupId]: true }));
                        const el = document.getElementById(`age-section-${babyAgeGroupId}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                    className="text-[11px] text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 transition cursor-pointer"
                    title={`Clique para filtrar as vacinas de ${childAgeFormatted}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Bebê: <strong>{childAgeFormatted}</strong></span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleToggleExpandAll}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                title="Expandir ou recolher todos os grupos de idade"
              >
                {allAgeGroupsExpanded ? 'Recolher todos' : 'Expandir todos'}
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollHorizontally(filterAgeBarRef, 'left')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                title="Rolar idades para a esquerda"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div
                ref={filterAgeBarRef}
                className="flex items-center gap-1.5 overflow-x-auto visible-scrollbar-x pb-2 pt-0.5 flex-1 min-w-0"
              >
                <button
                  type="button"
                  onClick={() => setSelectedAgeGroup('all')}
                  className={`px-3 py-1 rounded-full shrink-0 transition text-xs cursor-pointer ${
                    selectedAgeGroup === 'all'
                      ? 'bg-slate-900 text-white font-black shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                  }`}
                >
                  Todas
                </button>
                {VACCINE_AGE_GROUPS.map((g) => {
                  const isCurrent = selectedAgeGroup === g.id;
                  const isBabyGroup = babyAgeGroupId === g.id;
                  return (
                    <button
                      key={g.id}
                      data-age-group={g.id}
                      type="button"
                      onClick={() => {
                        setSelectedAgeGroup(g.id);
                        setExpandedAgeGroups((prev) => ({ ...prev, [g.id]: true }));
                        const el = document.getElementById(`age-section-${g.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      title={isBabyGroup ? `Faixa etária atual do bebê (${childAgeFormatted})` : undefined}
                      className={`px-3 py-1 rounded-full shrink-0 transition text-xs cursor-pointer flex items-center gap-1.5 ${
                        isCurrent
                          ? 'bg-blue-600 text-white font-black shadow-xs ring-2 ring-blue-300'
                          : isBabyGroup
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black border border-emerald-300 ring-1 ring-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                      }`}
                    >
                      {isBabyGroup && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      <span>{g.label}</span>
                      {isBabyGroup && (
                        <span className="text-[9px] bg-emerald-200/80 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                          Atual
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollHorizontally(filterAgeBarRef, 'right')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                title="Rolar idades para a direita"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar vacina (ex: BCG, Penta, Rotavírus, Meningo, Gripe)..."
              className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs font-bold">
            {/* Filter by Oferta */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterOferta('TODAS')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterOferta === 'TODAS'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setFilterOferta('SUS')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  filterOferta === 'SUS'
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                SUS
              </button>
              <button
                type="button"
                onClick={() => setFilterOferta('PARTICULAR')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  filterOferta === 'PARTICULAR'
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-indigo-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
                Particular
              </button>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterStatus('TODOS')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterStatus === 'TODOS'
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('VACINADO')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterStatus === 'VACINADO'
                    ? 'bg-white text-emerald-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                Vacinadas
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('AGENDADO')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterStatus === 'AGENDADO'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                Agendadas
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('PENDENTE')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  filterStatus === 'PENDENTE'
                    ? 'bg-white text-amber-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                Pendentes
              </button>
            </div>

            {/* View Mode Toggle: Por Idade vs Ordem Crescente de Aplicação */}
            <div className="w-full flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Exibição:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('idade')}
                  className={`px-3 py-1 rounded-lg transition text-xs cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'idade'
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>Por Idade (Calendário)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('dataAplicacao')}
                  className={`px-3 py-1 rounded-lg transition text-xs cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'dataAplicacao'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-emerald-700 font-semibold'
                  }`}
                  title="Listar doses aplicadas em ordem cronológica crescente (da primeira à mais recente)"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ordem da Aplicação (Crescente)</span>
                  {appliedVaccinesChronological.length > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        viewMode === 'dataAplicacao'
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {appliedVaccinesChronological.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW MODE 1: CRONOLÓGICO POR DATA E HORA DE APLICAÇÃO     */}
        {/* ========================================================= */}
        {viewMode === 'dataAplicacao' ? (
          appliedVaccinesChronological.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                <Syringe className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1">
                Nenhuma vacina aplicada registrada ainda
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                Marque as vacinas que o seu bebê já tomou na aba "Por Idade (Calendário)" para visualizá-las aqui em ordem cronológica.
              </p>
              <button
                type="button"
                onClick={() => setViewMode('idade')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
              >
                Ver Calendário de Vacinas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-600">
                  {appliedVaccinesChronological.length} {appliedVaccinesChronological.length === 1 ? 'dose aplicada' : 'doses aplicadas'} em ordem crescente:
                </span>
                <span className="text-[11px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Mais antiga → Mais recente
                </span>
              </div>

              {appliedVaccinesChronological.map(({ catalogItem, record, timestamp }, idx) => {
                const isSUS = catalogItem.oferta === 'SUS';
                const isParticular = catalogItem.oferta === 'Particular';
                const hasAttachments = !!(record.attachments && record.attachments.length > 0) || !!record.comprovanteUrl;
                const dateParts = (record.dataVacinacao || '').split('-');
                const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : record.dataVacinacao;

                return (
                  <div
                    key={record.id || catalogItem.id}
                    className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-2xs hover:shadow-md transition flex flex-col gap-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Index Badge */}
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-black leading-none">#{idx + 1}</span>
                          <Syringe className="w-4 h-4 stroke-[2.2] mt-0.5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition">
                              {catalogItem.nome}
                            </h3>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              {catalogItem.dose}
                            </span>
                            {isSUS && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                SUS
                              </span>
                            )}
                            {isParticular && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                Particular
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-slate-600">
                            <span className="font-extrabold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <Calendar className="w-3.5 h-3.5" />
                              Aplicada em: {formattedDate}
                              {record.horaAgendada ? ` às ${record.horaAgendada}` : ''}
                            </span>
                            {record.localVacinacao && (
                              <span className="flex items-center gap-1 text-slate-500 font-medium">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {record.localVacinacao}
                              </span>
                            )}
                            {record.lote && (
                              <span className="text-slate-400 text-[11px] font-mono font-semibold">
                                Lote: {record.lote}
                              </span>
                            )}
                          </div>

                          {record.observacoes && (
                            <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                              {record.observacoes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {hasAttachments && (
                          <button
                            type="button"
                            onClick={() => {
                              const url = (record.attachments && record.attachments[0]) || record.comprovanteUrl;
                              if (url) setPreviewAttachmentUrl(url);
                            }}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                            title="Ver foto do comprovante com Zoom"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(catalogItem)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                          title="Editar dados da vacina"
                        >
                          Editar
                        </button>
                      </div>
                    </div>

                    {/* Photos Preview Thumbnails with Zoom */}
                    {record.attachments && record.attachments.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100 overflow-x-auto">
                        <span className="text-[11px] font-bold text-slate-400 shrink-0">
                          Comprovantes:
                        </span>
                        {record.attachments.map((attUrl, aIdx) => (
                          <div
                            key={aIdx}
                            onClick={() => setPreviewAttachmentUrl(attUrl)}
                            className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 cursor-pointer group/thumb hover:border-emerald-400 transition"
                            title="Clique para dar zoom na foto"
                          >
                            <img
                              src={attUrl}
                              alt="Comprovante"
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ========================================================= */
          /* VIEW MODE 2: AGRUPADO POR IDADE (CALENDÁRIO)              */
          /* ========================================================= */
          groupedSections.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-1">
              Nenhuma vacina encontrada
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
              Não encontramos nenhuma vacina com os filtros selecionados ou termo de busca.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterOferta('TODAS');
                setFilterStatus('TODOS');
                setSelectedAgeGroup('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          groupedSections.map(({ group, items, appliedCount }) => {
            const isExpanded = !!expandedAgeGroups[group.id];
            const isAllCompleted = appliedCount === items.length && items.length > 0;

            return (
              <div
                key={group.id}
                id={`age-section-${group.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition scroll-mt-24"
              >
                {/* Accordion Age Header */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleGroup(group.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGroup(group.id);
                    }
                  }}
                  className="w-full px-4 py-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/60 transition cursor-pointer select-none text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isAllCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {group.ageOrder === 0
                        ? '0m'
                        : group.ageOrder >= 999
                        ? '★'
                        : group.ageOrder >= 48
                        ? `${Math.round(group.ageOrder / 12)}a`
                        : `${group.ageOrder}m`}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-black text-slate-800">
                          {group.label}
                        </h2>
                        {group.id === babyAgeGroupId && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Faixa atual ({childAgeFormatted})
                          </span>
                        )}
                        {isAllCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            Concluído
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        {group.desc} • {appliedCount} de {items.length} aplicadas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs font-bold text-slate-500">
                      {items.length} {items.length === 1 ? 'dose' : 'doses'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Vaccines List in this age group */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100 p-2 sm:p-3 space-y-2">
                    {items.map((item) => {
                      const rec = recordsMap.get(item.id);
                      const isVacinado = !!(rec && rec.vacinado);
                      const isAgendado = !isVacinado && !!(rec?.status === 'Agendada' || rec?.dataAgendada);
                      const hasAttachments = !!(
                        rec &&
                        ((rec.attachments && rec.attachments.length > 0) || rec.comprovanteUrl)
                      );
                      const attachmentCount = rec?.attachments?.length || (rec?.comprovanteUrl ? 1 : 0);

                      const isSUS = item.oferta === 'SUS';
                      const isParticular = item.oferta === 'Particular';

                      return (
                        <div
                          key={item.id}
                          className={`w-full rounded-xl p-3 sm:p-4 border transition ${
                            isVacinado
                              ? 'bg-emerald-50/30 border-emerald-200/70 hover:border-emerald-300'
                              : isAgendado
                              ? 'bg-blue-50/30 border-blue-200/80 hover:border-blue-300'
                              : 'bg-white border-slate-200/80 hover:border-sky-300'
                          }`}
                        >
                          <div className="w-full flex flex-col gap-2">
                            {/* 1. Nome da Vacina utilizando TODO o espaço até o limite do painel */}
                            <h3 className="w-full block text-sm sm:text-base font-black text-slate-900 leading-snug break-words">
                              {item.nome}
                            </h3>

                            {/* 2. Resumo do "pra que serve" utilizando TODO o espaço até o limite do painel */}
                            {item.descricaoCurta && (
                              <p className="w-full block text-xs sm:text-sm text-slate-600 font-medium leading-relaxed break-words">
                                {item.descricaoCurta}
                              </p>
                            )}

                            {/* 3. Linha de Tags e Botões de Ação */}
                            <div className="flex items-center justify-between gap-2 flex-wrap pt-1.5 border-t border-slate-100">
                              {/* Tags: Dose, Oferta e Ajuda */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                                  {item.dose}
                                </span>

                                {/* Oferta Tag: SUS vs Particular */}
                                {isSUS && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                    SUS
                                  </span>
                                )}
                                {isParticular && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                    Particular
                                  </span>
                                )}
                                {item.oferta === 'Ambos' && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-800 border border-cyan-200 shrink-0">
                                    SUS & Particular
                                  </span>
                                )}

                                {/* Interrogation Button for explanatory balloon */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedInfoVaccine(item)}
                                  className="w-5.5 h-5.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95 shrink-0"
                                  title="Para que serve esta vacina? (Clique para ver detalhes e fontes)"
                                >
                                  <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                                </button>
                              </div>

                              {/* Action Buttons: Vacinado toggle, Attachment clip, Edit details */}
                              <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                {/* Clip Icon for attaching receipt */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenClipModal(item)}
                                  className={`p-2 rounded-xl transition flex items-center gap-1 cursor-pointer text-xs font-bold ${
                                    hasAttachments
                                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                                  }`}
                                  title={
                                    hasAttachments
                                      ? `${attachmentCount} comprovante(s) anexado(s). Clique para ver ou adicionar.`
                                      : 'Anexar comprovante de vacinação'
                                  }
                                >
                                  <Paperclip className="w-4 h-4 stroke-[2.2]" />
                                  {hasAttachments && (
                                    <span className="text-[11px] font-black">
                                      {attachmentCount}
                                    </span>
                                  )}
                                </button>

                                {/* Vacinado / Agendado / Marcar Button (Abre modal de escolha) */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenMarcarModal(item)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                    isVacinado
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                                      : isAgendado
                                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs ring-2 ring-blue-300/60'
                                      : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                                  }`}
                                  title={
                                    isVacinado
                                      ? 'Vacina realizada. Clique para alterar status ou desmarcar.'
                                      : isAgendado
                                      ? `Agendada para ${rec?.dataAgendada?.split('-').reverse().join('/')}${rec?.horaAgendada ? ' às ' + rec.horaAgendada : ''}. Clique para marcar como realizada ou alterar agendamento.`
                                      : 'Clique para marcar se foi realizada ou agendar com lembrete'
                                  }
                                >
                                  {isVacinado ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                                      <span>Vacinado</span>
                                    </>
                                  ) : isAgendado ? (
                                    <>
                                      <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                                      <span>Agendada</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.8]" />
                                      <span>Marcar</span>
                                    </>
                                  )}
                                </button>

                                {/* Edit details button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(item)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-xs font-bold transition cursor-pointer"
                                  title="Editar dados da vacinação (data, lote, local, notas)"
                                >
                                  Editar
                                </button>
                              </div>
                            </div>

                            {/* 4. Detalhes caso esteja Agendada com Lembrete */}
                            {isAgendado && rec?.dataAgendada && (
                              <div className="flex items-center gap-2 flex-wrap text-[11px] text-blue-900 font-semibold bg-blue-50/80 border border-blue-200/80 px-2.5 py-1.5 rounded-lg w-fit mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Agendada para: <strong>{rec.dataAgendada.split('-').reverse().join('/')}</strong>{rec.horaAgendada ? ` às ${rec.horaAgendada}` : ''}</span>
                                </span>
                                {rec.localVacinacao && (
                                  <span className="truncate max-w-[200px] text-blue-700">
                                    • {rec.localVacinacao}
                                  </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-black">
                                  <Bell className="w-3 h-3 text-blue-600" />
                                  Lembrete ativo
                                </span>
                              </div>
                            )}

                            {/* 5. Detalhes da aplicação caso já tenha sido vacinado */}
                            {isVacinado && rec?.dataVacinacao && (
                              <div className="flex items-center gap-2 flex-wrap text-[11px] text-emerald-800 font-semibold bg-emerald-100/60 px-2.5 py-1 rounded-lg w-fit mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Aplicada em: <strong>{rec.dataVacinacao.split('-').reverse().join('/')}</strong></span>
                                </span>
                                {rec.localVacinacao && (
                                  <span className="truncate max-w-[240px]">
                                    • {rec.localVacinacao}
                                  </span>
                                )}
                                {rec.lote && (
                                  <span>• Lote: {rec.lote}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )
      )}
      </div>

      {/* Floating Scroll to Top Button */}
      {showScrollTopButton && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 sm:right-6 z-40 px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl flex items-center gap-1.5 text-xs font-bold transition hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-xs"
          title="Voltar ao início"
        >
          <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Topo</span>
        </button>
      )}

      {/* ========================================================= */}
      {/* 0. MODAL MARCAR VACINAÇÃO (REALIZADA OU AGENDADA)         */}
      {/* ========================================================= */}
      {marcarModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    marcarTipo === 'realizada' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {marcarTipo === 'realizada' ? (
                    <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
                  ) : (
                    <Clock className="w-6 h-6 stroke-[2.2]" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Marcar Vacina
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {marcarModalItem.catalogItem.nome} • {marcarModalItem.catalogItem.dose}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMarcarModalItem(null)}
                className="p-2 -mr-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Pergunta: Foi realizada ou agendada? */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Qual o status desta vacina?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMarcarTipo('realizada')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 text-center transition cursor-pointer ${
                      marcarTipo === 'realizada'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        marcarTipo === 'realizada' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <span className="block text-xs font-black">Já Realizada</span>
                      <span className="block text-[10px] text-slate-500 font-medium">Bebê já tomou</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarcarTipo('agendada')}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 text-center transition cursor-pointer ${
                      marcarTipo === 'agendada'
                        ? 'border-blue-500 bg-blue-50/70 text-blue-950 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        marcarTipo === 'agendada' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Clock className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="block text-xs font-black">Agendar</span>
                      <span className="block text-[10px] text-slate-500 font-medium">Com lembrete</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* OPÇÃO 1: FORMULÁRIO JÁ REALIZADA */}
              {marcarTipo === 'realizada' && (
                <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Data da Aplicação:
                    </label>
                    <input
                      type="date"
                      value={realizadaData}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRealizadaData(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Local da vacinação (opcional):
                    </label>
                    <input
                      type="text"
                      value={realizadaLocal}
                      onChange={(e) => setRealizadaLocal(e.target.value)}
                      placeholder="Ex: UBS Vila Mariana, Posto de Saúde, Clínica Vacinar"
                      className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lote da vacina (opcional):
                    </label>
                    <input
                      type="text"
                      value={realizadaLote}
                      onChange={(e) => setRealizadaLote(e.target.value)}
                      placeholder="Ex: AB1234, Lote 23B"
                      className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSavingMarcar}
                    onClick={handleConfirmMarcarRealizada}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSavingMarcar ? 'Salvando...' : 'Salvar como Realizada'}</span>
                  </button>
                </div>
              )}

              {/* OPÇÃO 2: FORMULÁRIO AGENDAR VACINAÇÃO COM LEMBRETE */}
              {marcarTipo === 'agendada' && (
                <div className="space-y-3 pt-1 border-t border-slate-100 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Data Agendada: *
                      </label>
                      <input
                        type="date"
                        value={agendadaData}
                        onChange={(e) => setAgendadaData(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Horário: *
                      </label>
                      <input
                        type="time"
                        value={agendadaHora}
                        onChange={(e) => setAgendadaHora(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Local Previsto (opcional):
                    </label>
                    <input
                      type="text"
                      value={agendadaLocal}
                      onChange={(e) => setAgendadaLocal(e.target.value)}
                      placeholder="Ex: UBS Central, Clínica de Vacinas"
                      className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  {/* Caixa Explicativa do Lembrete Automático */}
                  <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-blue-950 font-black text-xs">
                      <Bell className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                      <span>Lembrete de Vacinação</span>
                    </div>
                    <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                      Ao confirmar, criaremos automaticamente um lembrete com notificação para você não esquecer desta vacina.
                    </p>
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">
                        Avisar com antecedência:
                      </label>
                      <select
                        value={notifyHoursBefore}
                        onChange={(e) => setNotifyHoursBefore(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-white text-blue-900 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                      >
                        <option value={24}>24 horas antes (1 dia antes)</option>
                        <option value={48}>48 horas antes (2 dias antes)</option>
                        <option value={2}>2 horas antes</option>
                        <option value={0}>No exato horário agendado</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSavingMarcar || !agendadaData}
                    onClick={handleConfirmMarcarAgendada}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Bell className="w-4 h-4" />
                    <span>{isSavingMarcar ? 'Agendando...' : 'Confirmar Agendamento e Criar Lembrete'}</span>
                  </button>
                </div>
              )}

              {/* Botão para Desmarcar (se já havia vacina ou agendamento) */}
              {marcarModalItem.record &&
                (marcarModalItem.record.vacinado ||
                  marcarModalItem.record.status === 'Agendada' ||
                  marcarModalItem.record.dataAgendada) && (
                  <div className="pt-2 border-t border-slate-100 flex justify-center">
                    <button
                      type="button"
                      disabled={isSavingMarcar}
                      onClick={handleDesmarcarVacina}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desmarcar vacina (voltar para pendente)</span>
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. BALÃO EXPLICATIVO (MODAL "PRA QUE SERVE A VACINA?")     */}
      {/* ========================================================= */}
      {selectedInfoVaccine && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 p-5 sm:p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Syringe className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-black text-slate-900">
                      {selectedInfoVaccine.nome}
                    </h3>
                    {selectedInfoVaccine.oferta === 'SUS' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        Ofertada no SUS (Gratuita)
                      </span>
                    ) : selectedInfoVaccine.oferta === 'Particular' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                        Rede Particular
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-800">
                        SUS & Particular
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {selectedInfoVaccine.dose} • Recomendada: {selectedInfoVaccine.idadeRecomendada}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedInfoVaccine(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: Para que serve? */}
            <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
              {/* Para que serve */}
              <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-100">
                <div className="flex items-center gap-2 mb-1.5 text-blue-900 font-black text-sm">
                  <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                  <span>Para que serve esta vacina?</span>
                </div>
                <p className="text-slate-700 font-medium">
                  {selectedInfoVaccine.paraQueServe}
                </p>
              </div>

              {/* Doenças prevenidas */}
              {selectedInfoVaccine.doencasEvitadas.length > 0 && (
                <div>
                  <span className="block font-black text-slate-800 mb-1.5">
                    Doenças graves prevenidas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInfoVaccine.doencasEvitadas.map((doenca, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]"
                      >
                        ✓ {doenca}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reações comuns esperadas */}
              <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/80">
                <span className="block font-black text-amber-950 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Reações comuns e esperadas:
                </span>
                <p className="text-amber-900 font-medium">
                  {selectedInfoVaccine.reacoesComuns}
                </p>
              </div>

              {/* Cuidados e orientações */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                <span className="block font-black text-slate-800 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Cuidados recomendados após a aplicação:
                </span>
                <p className="text-slate-600 font-medium">
                  {selectedInfoVaccine.cuidados}
                </p>
              </div>

              {/* Diferença SUS vs Particular (se houver) */}
              {selectedInfoVaccine.particularInfo && (
                <div className="bg-indigo-50/70 rounded-2xl p-3.5 border border-indigo-200">
                  <span className="block font-black text-indigo-950 mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-600" />
                    Opção na Rede Particular:
                  </span>
                  <p className="text-indigo-900 font-medium">
                    {selectedInfoVaccine.particularInfo}
                  </p>
                </div>
              )}

              {/* Origem da Informação & Fonte Oficial com Link */}
              {(() => {
                const source = getVaccineSource(selectedInfoVaccine);
                return (
                  <div className="bg-emerald-50/90 rounded-2xl p-4 border border-emerald-200/90 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-emerald-950 font-black text-xs">
                        <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Origem & Fonte Oficial da Informação:</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {source.orgao}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <p className="font-semibold text-emerald-900">
                        Referência: <strong>{source.nome}</strong>
                      </p>
                      {source.descricao && (
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {source.descricao}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 border-t border-emerald-200/60">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs"
                      >
                        <span>Acessar página oficial da fonte</span>
                        <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                      </a>

                      {source.urlSecundaria && (
                        <a
                          href={source.urlSecundaria}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs transition cursor-pointer"
                        >
                          <span>{source.nomeSecundaria || 'Acessar Calendário do SUS'}</span>
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInfoVaccine(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Entendi, fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODAL DE EDIÇÃO DE VACINAÇÃO (MARCAR E INSERIR DATA)   */}
      {/* ========================================================= */}
      {editVaccineItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Registro da Vacina
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  {editVaccineItem.catalogItem?.nome || editVaccineItem.record?.nome} (
                  {editVaccineItem.catalogItem?.dose || editVaccineItem.record?.dose})
                </p>
              </div>
              <button
                onClick={() => setEditVaccineItem(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs">
              {/* Status Switch: Vacinado / Não vacinado */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="block font-black text-slate-800 text-sm">
                    A criança já tomou esta vacina?
                  </span>
                  <span className="text-slate-500">
                    {formVacinado ? 'Sim, dose aplicada' : 'Não, dose ainda pendente'}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formVacinado}
                    onChange={(e) => setFormVacinado(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Data da Vacinação */}
              {formVacinado && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Data da Vacinação: <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={formDataVacinacao}
                      onChange={(e) => setFormDataVacinacao(e.target.value)}
                      className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setFormDataVacinacao(new Date().toISOString().split('T')[0])}
                      className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition"
                    >
                      Hoje
                    </button>
                    {child.birthDate && (
                      <button
                        type="button"
                        onClick={() => setFormDataVacinacao(child.birthDate)}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition"
                        title="Usar data de nascimento"
                      >
                        Nasc.
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Local de Vacinação */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Local da Aplicação:
                </label>
                <input
                  type="text"
                  value={formLocalVacinacao}
                  onChange={(e) => setFormLocalVacinacao(e.target.value)}
                  placeholder="Ex: UBS Vila Mariana, Maternidade Santa Clara, Clínica Vacinar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Lote & Fabricante */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lote da vacina:
                  </label>
                  <input
                    type="text"
                    value={formLote}
                    onChange={(e) => setFormLote(e.target.value)}
                    placeholder="Ex: AB2349"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Laboratório / Fabricante:
                  </label>
                  <input
                    type="text"
                    value={formLaboratorio}
                    onChange={(e) => setFormLaboratorio(e.target.value)}
                    placeholder="Ex: Fiocruz, GSK, Pfizer"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Profissional / Vacinador */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vacinador(a) / Responsável:
                </label>
                <input
                  type="text"
                  value={formProfissional}
                  onChange={(e) => setFormProfissional(e.target.value)}
                  placeholder="Ex: Enfª Mariana da Silva"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Observações */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Anotações / Reações observadas:
                </label>
                <textarea
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Ex: Teve febrícula passageira no dia seguinte, orientada compressa fria..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Comprovantes Anexados (Fotos da Carteira) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                    <span>Comprovantes / Fotos da Carteirinha:</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-blue-700 hover:bg-sky-100 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Câmera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Galeria
                    </button>
                  </div>
                </div>

                {/* Thumbnails list */}
                {formAttachments.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {formAttachments.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 bg-white"
                      >
                        <img
                          src={url}
                          alt="Comprovante"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setPreviewAttachmentUrl(url)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx, false)}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition"
                          title="Remover anexo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:bg-slate-50 cursor-pointer transition"
                  >
                    <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-slate-500 font-bold block">
                      Toque para anexar a foto da carteira ou atestado
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Formatos: Fotos (JPEG, PNG) ou PDF
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditVaccineItem(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Registro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODAL RÁPIDO DE ANEXAR COMPROVANTE (CLIPS)            */}
      {/* ========================================================= */}
      {clipModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Comprovante de Vacinação
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold truncate max-w-[200px]">
                    {clipModalItem.catalogItem.nome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClipModalItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Attachments */}
            {clipModalItem.record?.attachments && clipModalItem.record.attachments.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700">
                  Comprovantes salvos ({clipModalItem.record.attachments.length}):
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {clipModalItem.record.attachments.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-square group bg-slate-50"
                    >
                      <img
                        src={url}
                        alt="Comprovante"
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-200"
                        onClick={() => setPreviewAttachmentUrl(url)}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewAttachmentUrl(url)}
                          className="p-1.5 rounded-full bg-white text-slate-800 shadow-md"
                          title="Visualizar em tela cheia"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx, true)}
                          className="p-1.5 rounded-full bg-rose-600 text-white shadow-md"
                          title="Excluir comprovante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl p-6 text-center border-2 border-dashed border-slate-200">
                <Paperclip className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-black text-slate-700">
                  Nenhum comprovante anexado
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tire uma foto do selo da vacina na caderneta física ou do atestado emitido pelo posto.
                </p>
              </div>
            )}

            {/* Upload Buttons */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (clipFileInputRef.current) {
                      clipFileInputRef.current.capture = 'environment';
                      clipFileInputRef.current.click();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Tirar Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (clipFileInputRef.current) {
                      clipFileInputRef.current.removeAttribute('capture');
                      clipFileInputRef.current.click();
                    }
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Galeria / Arquivo</span>
                </button>
              </div>

              {isUploadingPhoto && (
                <p className="text-center text-xs text-blue-600 font-bold animate-pulse">
                  Salvando comprovante...
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setClipModalItem(null)}
                className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL ADICIONAR OUTRA VACINA PERSONALIZADA            */}
      {/* ========================================================= */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Cadastrar Outra Vacina
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">
                    Vacina complementar ou recomendação pediátrica
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome da vacina: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={customNome}
                  onChange={(e) => setCustomNome(e.target.value)}
                  placeholder="Ex: Febre Tifoide, Vacina Alérgica, Gripe Específica"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Dose:
                  </label>
                  <input
                    type="text"
                    value={customDose}
                    onChange={(e) => setCustomDose(e.target.value)}
                    placeholder="Ex: Dose única, 1ª Dose"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ofertada em:
                  </label>
                  <select
                    value={customOferta}
                    onChange={(e) => setCustomOferta(e.target.value as VacinaOferta)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="SUS">SUS (Público)</option>
                    <option value="Particular">Rede Particular</option>
                    <option value="Ambos">Ambos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Idade ou Período recomendado:
                </label>
                <input
                  type="text"
                  value={customIdade}
                  onChange={(e) => setCustomIdade(e.target.value)}
                  placeholder="Ex: 2 anos, Antes de viagem, Anual"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Para que serve / Observações:
                </label>
                <textarea
                  value={customParaQueServe}
                  onChange={(e) => setCustomParaQueServe(e.target.value)}
                  placeholder="Descreva para que serve e por que foi indicada..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomVaccine}
                disabled={!customNome.trim() || isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Adicionar ao Calendário'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. VISUALIZADOR DE COMPROVANTE (IMAGE VIEWER COM ZOOM)   */}
      {/* ========================================================= */}
      {previewAttachmentUrl && (
        <ImageViewerModal
          imageUrl={previewAttachmentUrl}
          title="Comprovante de Vacinação"
          onClose={() => setPreviewAttachmentUrl(null)}
        />
      )}
    </div>
  );
};
