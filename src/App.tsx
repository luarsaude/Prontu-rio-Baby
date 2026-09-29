import React, { useState, useEffect, useCallback } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { SupabaseConnectScreen } from './components/SupabaseConnectScreen';
import { HomeScreen } from './components/HomeScreen';
import { ConsultasView } from './components/ConsultasView';
import { ExamesView } from './components/ExamesView';
import { ReceitasView } from './components/ReceitasView';
import { ScannerModal } from './components/ScannerModal';
import { LembretesView } from './components/LembretesView';
import { DocumentosView } from './components/DocumentosView';
import { PerfilView } from './components/PerfilView';
import { EventosView } from './components/EventosView';
import { VacinasView } from './components/VacinasView';
import { ChildModal } from './components/ChildModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { MaisDrawer } from './components/MaisDrawer';
import { PWAInstallModal } from './components/PWAInstallModal';
import { BottomNavBar, NavTab } from './components/BottomNavBar';
import { MascotBear } from './components/MascotIcons';
import { ParentAuthScreen } from './components/ParentAuthScreen';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboardView } from './components/AdminDashboardView';
import { FamilyShareModal } from './components/FamilyShareModal';
import { EnterFamilyCodeModal } from './components/EnterFamilyCodeModal';
import {
  Child,
  Consulta,
  Exame,
  Receita,
  Lembrete,
  Documento,
  Evento,
  VacinaRegistro,
  SupabaseConfig,
  ParentUser,
  FamilyShare,
} from './types';
import {
  getInitialSupabaseConfig,
  clearSupabaseCredentials,
  supabaseAuthGetSession,
  supabaseAuthOnAuthStateChange,
  supabaseAuthSignOut,
  dbUpsertProfile,
  dbFetchChildren,
  dbInsertChild,
  dbUpdateChild,
  dbDeleteChild,
  dbFetchConsultas,
  dbInsertConsulta,
  dbUpdateConsulta,
  dbDeleteConsulta,
  dbFetchExames,
  dbInsertExame,
  dbUpdateExame,
  dbDeleteExame,
  dbFetchReceitas,
  dbInsertReceita,
  dbUpdateReceita,
  dbDeleteReceita,
  dbFetchEventos,
  dbInsertEvento,
  dbUpdateEvento,
  dbDeleteEvento,
  dbFetchVacinas,
  dbSaveVacinaRegistro,
  dbDeleteVacinaRegistro,
  dbFetchLembretes,
  dbInsertLembrete,
  dbUpdateLembrete,
  dbDeleteLembrete,
  dbDeleteLembreteByRelatedId,
  dbFetchDocumentos,
  dbInsertDocumento,
  dbDeleteDocumento,
  dbFetchPendingSharesForUser,
  dbAcceptFamilyShare,
} from './services/supabase';
import { playReminderSound } from './utils/reminderSounds';
import { sortByDateAscending } from './utils/dateOrder';
import { RefreshCw, AlertCircle, Database, Shield, LogOut, CheckCircle2, Bell, Volume2 } from 'lucide-react';

export default function App() {
  // Supabase connection state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getInitialSupabaseConfig);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  // Authentication & Admin State
  const [currentUser, setCurrentUser] = useState<ParentUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminViewMode, setAdminViewMode] = useState<'admin_panel' | 'parent_app'>('admin_panel');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);

  // App Navigation
  const [currentView, setCurrentView] = useState<
    'home' | 'consultas' | 'exames' | 'receitas' | 'documentos' | 'lembretes' | 'perfil' | 'eventos' | 'vacinas'
  >('home');
  const [bottomTab, setBottomTab] = useState<NavTab>('inicio');

  // Supabase Data (100% Live from Database)
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [vacinas, setVacinas] = useState<VacinaRegistro[]>([]);
  const [exames, setExames] = useState<Exame[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  // Modals
  const [showChildModal, setShowChildModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showMaisDrawer, setShowMaisDrawer] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showFamilyShareModal, setShowFamilyShareModal] = useState(false);
  const [showEnterCodeModal, setShowEnterCodeModal] = useState(false);

  // Family Sharing State
  const [pendingShares, setPendingShares] = useState<FamilyShare[]>([]);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Active Reminder Alert state (popup no celular com toque sonoro)
  const [activeReminderAlert, setActiveReminderAlert] = useState<Lembrete | null>(null);
  const [dismissedReminderAlerts, setDismissedReminderAlerts] = useState<Set<string>>(() => new Set());

  // Scheduler para verificar horários dos lembretes e acionar o popup + som
  useEffect(() => {
    if (!lembretes.length) return;

    const checkDueReminders = () => {
      const now = Date.now();

      for (const lem of lembretes) {
        if (lem.completed) continue;
        if (dismissedReminderAlerts.has(lem.id)) continue;

        // Parse de data e hora com suporte a formatos DD/MM/AAAA e AAAA-MM-DD
        let day = 0, month = 0, year = 0;
        const dStr = (lem.date || '').trim();
        if (dStr.includes('/')) {
          const parts = dStr.split('/');
          day = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          year = parseInt(parts[2], 10);
        } else if (dStr.includes('-')) {
          const parts = dStr.split('-');
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          day = parseInt(parts[2], 10);
        }
        if (!year || isNaN(year) || !day || isNaN(day)) continue;

        let hour = 9, minute = 0;
        if (lem.time) {
          const tParts = lem.time.split(':');
          hour = parseInt(tParts[0], 10) || 9;
          minute = parseInt(tParts[1], 10) || 0;
        }

        const eventTime = new Date(year, month, day, hour, minute).getTime();
        if (isNaN(eventTime)) continue;

        // Quantidade de horas de antecedência (padrão 24 horas se não configurado)
        const hoursBefore = lem.notifyHoursBefore !== undefined ? lem.notifyHoursBefore : 24;
        const targetAlertTime = eventTime - (hoursBefore * 60 * 60 * 1000);

        // Se atingiu o momento do alerta e o evento não ocorreu há mais de 12 horas
        if (now >= targetAlertTime && now <= eventTime + (12 * 60 * 60 * 1000)) {
          setActiveReminderAlert(lem);
          playReminderSound((lem.soundId as any) || 'gentle_bell');

          // Notificação nativa do navegador/celular se autorizada
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(`Prontuário Baby • ${lem.title}`, {
                body: `${lem.subtitle}\nAviso programado com ${hoursBefore}h de antecedência.`,
                icon: '/favicon.ico',
              });
            } catch {}
          }
          break; // Aciona um de cada vez
        }
      }
    };

    checkDueReminders();
    const timer = setInterval(checkDueReminders, 15000);
    return () => clearInterval(timer);
  }, [lembretes, dismissedReminderAlerts]);

  // Helper to refresh pending invites
  const refreshPendingShares = useCallback(async (email?: string) => {
    const targetEmail = email || currentUser?.email;
    if (!targetEmail) {
      setPendingShares([]);
      return;
    }
    try {
      const invites = await dbFetchPendingSharesForUser(targetEmail);
      setPendingShares(invites);
    } catch (e) {
      console.warn('Erro ao buscar convites pendentes:', e);
    }
  }, [currentUser?.email]);

  // Check Supabase Auth Session on startup and subscribe to auth changes
  useEffect(() => {
    let isMounted = true;
    const sessionTimer = setTimeout(() => {
      if (isMounted) setCheckingSession(false);
    }, 1500);

    async function initSession() {
      try {
        const { user } = await supabaseAuthGetSession();
        if (user && isMounted) {
          const userRole = user.user_metadata?.role || 'parent';
          const userEmail = user.email || '';
          const userName =
            userEmail ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            'Responsável';

          setCurrentUser({
            id: user.id,
            email: userEmail,
            name: userName,
            role: userRole,
          });

          if (userEmail) {
            dbUpsertProfile({
              id: user.id,
              name: userName,
              email: userEmail,
              role: userRole === 'admin' ? 'admin' : 'parent',
            }).catch(() => {});
            refreshPendingShares(userEmail);
          }

          if (userRole === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (e) {
        console.warn('Erro ao verificar sessão Supabase:', e);
      } finally {
        if (isMounted) {
          clearTimeout(sessionTimer);
          setCheckingSession(false);
        }
      }
    }

    initSession();

    const { unsubscribe } = supabaseAuthOnAuthStateChange((event, session) => {
      if (session?.user) {
        const userRole = session.user.user_metadata?.role || 'parent';
        const userEmail = session.user.email || '';
        const userName =
          userEmail ||
          session.user.user_metadata?.name ||
          session.user.user_metadata?.full_name ||
          'Responsável';

        setCurrentUser({
          id: session.user.id,
          email: userEmail,
          name: userName,
          role: userRole,
        });

        if (userEmail) {
          dbUpsertProfile({
            id: session.user.id,
            name: userName,
            email: userEmail,
            role: userRole === 'admin' ? 'admin' : 'parent',
          }).catch(() => {});
          refreshPendingShares(userEmail);
        }

        if (userRole === 'admin') {
          setIsAdmin(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAdmin(false);
        setChildrenList([]);
        setActiveChildId('');
        setConsultas([]);
        setEventos([]);
        setVacinas([]);
        setExames([]);
        setReceitas([]);
        setLembretes([]);
        setDocumentos([]);
        setPendingShares([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [refreshPendingShares]);

  // Load all child data from Supabase
  const loadChildData = useCallback(async (childId: string) => {
    if (!childId) {
      setConsultas([]);
      setEventos([]);
      setVacinas([]);
      setExames([]);
      setReceitas([]);
      setLembretes([]);
      setDocumentos([]);
      return;
    }

    try {
      const [resConsultas, resEventos, resVacinas, resExames, resReceitas, resLembretes, resDocs] = await Promise.all([
        dbFetchConsultas(childId),
        dbFetchEventos(childId),
        dbFetchVacinas(childId),
        dbFetchExames(childId),
        dbFetchReceitas(childId),
        dbFetchLembretes(childId),
        dbFetchDocumentos(childId),
      ]);

      if (resConsultas.error) console.warn('Erro consultas:', resConsultas.error);
      if (resEventos.error) console.warn('Erro eventos:', resEventos.error);
      if (resVacinas.error) console.warn('Erro vacinas:', resVacinas.error);
      if (resExames.error) console.warn('Erro exames:', resExames.error);
      if (resReceitas.error) console.warn('Erro receitas:', resReceitas.error);
      if (resLembretes.error) console.warn('Erro lembretes:', resLembretes.error);
      if (resDocs.error) console.warn('Erro documentos:', resDocs.error);

      // Deduplicar receitas ao carregar para evitar registros duplicados em tela
      const uniqueReceitas: Receita[] = [];
      const duplicateReceitaIds: string[] = [];
      for (const rec of resReceitas.data) {
        const isDup = uniqueReceitas.some(
          (u) =>
            u.id === rec.id ||
            (u.childId === rec.childId &&
              u.medicineName.trim().toLowerCase() === rec.medicineName.trim().toLowerCase() &&
              (u.dosage || '').trim().toLowerCase() === (rec.dosage || '').trim().toLowerCase() &&
              u.date === rec.date)
        );
        if (isDup) {
          duplicateReceitaIds.push(rec.id);
        } else {
          uniqueReceitas.push(rec);
        }
      }

      // Se houver registros de receitas duplicadas existentes no banco, remove-as em segundo plano
      if (duplicateReceitaIds.length > 0) {
        duplicateReceitaIds.forEach((dupId) => {
          dbDeleteReceita(dupId).catch(() => {});
          dbDeleteLembreteByRelatedId(dupId).catch(() => {});
        });
      }

      // Deduplicar lembretes
      const uniqueLembretes: Lembrete[] = [];
      const duplicateLemIds: string[] = [];
      for (const lem of resLembretes.data) {
        const isDup = uniqueLembretes.some(
          (u) =>
            u.id === lem.id ||
            (u.childId === lem.childId &&
              u.title === lem.title &&
              u.subtitle === lem.subtitle &&
              u.date === lem.date &&
              u.time === lem.time)
        );
        if (isDup) {
          duplicateLemIds.push(lem.id);
        } else {
          uniqueLembretes.push(lem);
        }
      }

      if (duplicateLemIds.length > 0) {
        duplicateLemIds.forEach((dupId) => {
          dbDeleteLembrete(dupId).catch(() => {});
        });
      }

      setConsultas([...resConsultas.data].sort(sortByDateAscending));
      setEventos([...resEventos.data].sort(sortByDateAscending));
      setVacinas(resVacinas.data);
      setExames([...resExames.data].sort(sortByDateAscending));
      setReceitas([...uniqueReceitas].sort(sortByDateAscending));
      setLembretes([...uniqueLembretes].sort(sortByDateAscending));
      setDocumentos([...resDocs.data].sort(sortByDateAscending));
    } catch (e: any) {
      console.error('Erro ao carregar dados do Supabase:', e);
    }
  }, []);

  // Fetch children list on connection or initialization with user isolation
  const refreshFromSupabase = useCallback(async (overrideUserId?: string, overrideEmail?: string) => {
    if (!supabaseConfig.isConnected) return;

    const uid = overrideUserId !== undefined ? overrideUserId : currentUser?.id;
    const uemail = overrideEmail !== undefined ? overrideEmail : currentUser?.email;

    setLoadingInitial(true);
    setDbError(null);

    const safetyTimer = setTimeout(() => {
      setLoadingInitial(false);
    }, 2500);

    try {
      const { data, error } = await dbFetchChildren(uid, uemail, isAdmin);
      clearTimeout(safetyTimer);
      if (error) {
        setDbError(`Supabase: ${error}. Verifique se você executou o script SQL das tabelas.`);
        setLoadingInitial(false);
        return;
      }

      setChildrenList(data);
      if (data.length > 0) {
        const selectedId = activeChildId && data.some((c) => c.id === activeChildId)
          ? activeChildId
          : data[0].id;
        setActiveChildId(selectedId);
        await loadChildData(selectedId);
      } else {
        setActiveChildId('');
        setConsultas([]);
        setEventos([]);
        setExames([]);
        setReceitas([]);
        setLembretes([]);
        setDocumentos([]);
      }
    } catch (err: any) {
      setDbError(err.message || 'Erro ao conectar com Supabase.');
    } finally {
      setLoadingInitial(false);
    }
  }, [supabaseConfig.isConnected, activeChildId, loadChildData, currentUser?.id, currentUser?.email, isAdmin]);

  useEffect(() => {
    if (supabaseConfig.isConnected && (currentUser || isAdmin)) {
      refreshFromSupabase(currentUser?.id, currentUser?.email);
    }
  }, [supabaseConfig.isConnected, currentUser?.id, currentUser?.email, isAdmin, refreshFromSupabase]);

  // Logout handler (Redirects directly to ParentAuthScreen)
  const handleLogout = async () => {
    try {
      await supabaseAuthSignOut();
    } catch {}
    setCurrentUser(null);
    setIsAdmin(false);
    setAdminViewMode('admin_panel');
    setChildrenList([]);
    setActiveChildId('');
    setConsultas([]);
    setEventos([]);
    setVacinas([]);
    setExames([]);
    setReceitas([]);
    setLembretes([]);
    setDocumentos([]);
    setCurrentView('home');
    setBottomTab('inicio');
    setShowMaisDrawer(false);
  };

  // When active child changes, load their medical data
  const handleSelectChild = (childId: string) => {
    setActiveChildId(childId);
    loadChildData(childId);
    setShowChildModal(false);
  };

  const activeChild = childrenList.find((c) => c.id === activeChildId) || {
    id: '',
    name: '',
    birthDate: '',
    gender: 'boy' as const,
    avatarId: 'baby-boy',
  };

  // Family sharing invitation acceptance
  const handleAcceptPendingShare = async (share: FamilyShare) => {
    if (!currentUser) return;
    setLoadingInitial(true);
    const { success, error } = await dbAcceptFamilyShare(share.id, currentUser);
    setLoadingInitial(false);
    if (!success) {
      alert(`Erro ao aceitar convite: ${error || 'Tente novamente.'}`);
      return;
    }
    setShareToast(`Convite aceito! Prontuário de ${share.childName || 'seu familiar'} agora está acessível.`);
    setTimeout(() => setShareToast(null), 6000);
    await refreshFromSupabase(currentUser.id, currentUser.email);
    setActiveChildId(share.childId);
    await loadChildData(share.childId);
    await refreshPendingShares(currentUser.email);
  };

  // Family code linking success
  const handleCodeLinked = async (share: FamilyShare) => {
    setShowEnterCodeModal(false);
    setShareToast(`Código familiar validado! Prontuário de ${share.childName || 'seu familiar'} conectado.`);
    setTimeout(() => setShareToast(null), 6000);
    if (currentUser) {
      await refreshFromSupabase(currentUser.id, currentUser.email);
      setActiveChildId(share.childId);
      await loadChildData(share.childId);
      await refreshPendingShares(currentUser.email);
    }
  };

  // --- CRUD DISPATCHERS (100% SUPABASE COM ISOLAMENTO DE USUÁRIO) ---

  const handleAddChild = async (childData: Omit<Child, 'id'>) => {
    setLoadingInitial(true);
    const { data, error } = await dbInsertChild(childData, currentUser?.id, currentUser?.email);
    setLoadingInitial(false);
    if (error) {
      alert(`Erro ao salvar no Supabase: ${error}`);
      return;
    }
    if (data) {
      const updated = [...childrenList, data];
      setChildrenList(updated);
      setActiveChildId(data.id);
      loadChildData(data.id);
      setShowChildModal(false);
    }
  };

  const handleUpdateChild = async (id: string, updatedFields: Partial<Child>) => {
    const { error } = await dbUpdateChild(id, updatedFields);
    if (error) {
      alert(`Erro ao atualizar no Supabase: ${error}`);
      return;
    }
    setChildrenList((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));
  };

  const handleDeleteChild = async (childId: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await dbDeleteChild(childId);
    if (error) {
      console.error('Erro ao excluir no Supabase:', error);
      return { success: false, error: `Erro ao excluir no Supabase: ${error}` };
    }
    const remaining = childrenList.filter((c) => c.id !== childId);
    setChildrenList(remaining);
    if (remaining.length > 0) {
      setActiveChildId(remaining[0].id);
      loadChildData(remaining[0].id);
    } else {
      setActiveChildId('');
      setConsultas([]);
      setEventos([]);
      setVacinas([]);
      setExames([]);
      setReceitas([]);
      setLembretes([]);
      setDocumentos([]);
    }
    return { success: true };
  };

  const handleAddConsulta = async (consultaData: Omit<Consulta, 'id'>) => {
    if (!activeChildId) {
      setShowChildModal(true);
      alert('Por favor, primeiro cadastre o seu bebê para vincular este registro.');
      return;
    }

    // Prevenção contra salvamento duplo de consulta
    const isDuplicate = consultas.some(
      (c) =>
        c.childId === activeChildId &&
        c.doctorName.trim().toLowerCase() === consultaData.doctorName.trim().toLowerCase() &&
        c.date === consultaData.date &&
        c.time === consultaData.time
    );
    if (isDuplicate) {
      console.warn('Consulta duplicada ignorada para evitar salvamento duplo.');
      return;
    }

    const { data, error } = await dbInsertConsulta(
      {
        ...consultaData,
        childId: activeChildId,
      },
      currentUser?.id
    );
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    if (data) {
      setConsultas((prev) => [...prev, data].sort(sortByDateAscending));

      // Ao criar consulta agendada, insere automaticamente registro no módulo lembrete (padrão: 24h antes)
      if (consultaData.status === 'Agendada' || consultaData.reminder !== false) {
        try {
          const { data: newLembrete } = await dbInsertLembrete(
            {
              childId: activeChildId,
              type: 'Consulta',
              title: 'Consulta Médica',
              subtitle: `${consultaData.doctorName} (${consultaData.specialty})\n${consultaData.date} às ${consultaData.time}`,
              date: consultaData.date,
              time: consultaData.time,
              completed: false,
              relatedId: data.id,
              notifyHoursBefore: 24, // Padrão 24 horas antes
              soundId: 'gentle_bell', // Padrão Sininho Suave
            },
            currentUser?.id
          );
          if (newLembrete) {
            setLembretes((prev) => [newLembrete, ...prev]);
          }
        } catch (lemErr) {
          console.warn('Não foi possível criar lembrete automático da consulta:', lemErr);
        }
      }
    }
  };

  const handleUpdateConsulta = async (
    id: string,
    updatedFields: Partial<Consulta>
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await dbUpdateConsulta(id, updatedFields);
    if (error) {
      alert(`Erro no Supabase ao atualizar consulta: ${error}`);
      return { success: false, error };
    }
    setConsultas((prev) => prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c)));

    // Se a consulta teve data/horário/médico alterados ou foi concluída, sincroniza lembrete vinculado
    if (
      updatedFields.date ||
      updatedFields.time ||
      updatedFields.doctorName ||
      updatedFields.specialty ||
      updatedFields.status
    ) {
      try {
        const existingLembrete = lembretes.find((l) => l.relatedId === id);
        if (existingLembrete) {
          const lemUpdates: Partial<Lembrete> = {};
          if (updatedFields.date) lemUpdates.date = updatedFields.date;
          if (updatedFields.time) lemUpdates.time = updatedFields.time;
          if (updatedFields.status === 'Realizada') lemUpdates.completed = true;
          if (updatedFields.status === 'Agendada') lemUpdates.completed = false;
          if (
            updatedFields.doctorName ||
            updatedFields.specialty ||
            updatedFields.date ||
            updatedFields.time
          ) {
            const doc =
              updatedFields.doctorName ?? existingLembrete.subtitle?.split('(')[0]?.trim();
            const spec =
              updatedFields.specialty ??
              (existingLembrete.subtitle?.match(/\(([^)]+)\)/)?.[1] || 'Pediatra');
            const dt = updatedFields.date ?? existingLembrete.date;
            const tm = updatedFields.time ?? existingLembrete.time;
            lemUpdates.subtitle = `${doc} (${spec})\n${dt} às ${tm}`;
          }
          await dbUpdateLembrete(existingLembrete.id, lemUpdates);
          setLembretes((prev) =>
            prev.map((l) => (l.id === existingLembrete.id ? { ...l, ...lemUpdates } : l))
          );
        }
      } catch (err) {
        console.warn('Não foi possível sincronizar o lembrete da consulta:', err);
      }
    }

    return { success: true };
  };

  const handleDeleteConsulta = async (id: string) => {
    const { error } = await dbDeleteConsulta(id);
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setConsultas((prev) => prev.filter((c) => c.id !== id));

    // Ao excluir consulta, remove o lembrete vinculado
    try {
      await dbDeleteLembreteByRelatedId(id);
      setLembretes((prev) => prev.filter((l) => l.relatedId !== id));
    } catch (e) {
      console.warn('Erro ao remover lembrete vinculado à consulta:', e);
    }
  };

  const handleAddExame = async (
    exameData: Omit<Exame, 'id'>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!activeChildId) {
      setShowChildModal(true);
      const msg = 'Por favor, primeiro cadastre ou selecione o bebê para vincular este exame.';
      alert(msg);
      return { success: false, error: msg };
    }

    // Prevenção contra salvamento duplo de exame
    const isDuplicate = exames.some(
      (e) =>
        e.childId === activeChildId &&
        e.title.trim().toLowerCase() === exameData.title.trim().toLowerCase() &&
        e.date === exameData.date
    );
    if (isDuplicate) {
      console.warn('Exame duplicado ignorado para evitar salvamento duplo.');
      return { success: true };
    }

    const { data, error } = await dbInsertExame(
      {
        ...exameData,
        childId: activeChildId,
      },
      currentUser?.id
    );
    if (error) {
      alert(`Erro no Supabase ao salvar exame: ${error}`);
      return { success: false, error };
    }
    if (data) {
      setExames((prev) => [...prev, data].sort(sortByDateAscending));
      setCurrentView('exames');
      setBottomTab('exames');

      // Ao criar exame agendado, insere automaticamente registro no módulo lembrete (padrão: 24h antes)
      if (exameData.status === 'Agendado' || exameData.date) {
        try {
          const { data: newLembrete } = await dbInsertLembrete(
            {
              childId: activeChildId,
              type: 'Exame',
              title: 'Exame Agendado',
              subtitle: `${exameData.title}${exameData.doctorRequested ? ` - ${exameData.doctorRequested}` : exameData.location ? ` - ${exameData.location}` : ''}\n${exameData.date}`,
              date: exameData.date,
              time: '08:00',
              completed: false,
              relatedId: data.id,
              notifyHoursBefore: 24, // Padrão 24 horas antes
              soundId: 'gentle_bell', // Padrão Sininho Suave
            },
            currentUser?.id
          );
          if (newLembrete) {
            setLembretes((prev) => [newLembrete, ...prev]);
          }
        } catch (lemErr) {
          console.warn('Não foi possível criar lembrete automático do exame:', lemErr);
        }
      }
      return { success: true };
    }
    return { success: false, error: 'Não foi possível salvar o exame.' };
  };

  const handleUpdateExame = async (
    id: string,
    updatedFields: Partial<Exame>
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await dbUpdateExame(id, updatedFields);
    if (error) {
      alert(`Erro no Supabase ao atualizar exame: ${error}`);
      return { success: false, error };
    }
    setExames((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e)));
    return { success: true };
  };

  const handleDeleteExame = async (id: string) => {
    const { error } = await dbDeleteExame(id);
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setExames((prev) => prev.filter((e) => e.id !== id));

    // Ao excluir exame, remove o lembrete vinculado
    try {
      await dbDeleteLembreteByRelatedId(id);
      setLembretes((prev) => prev.filter((l) => l.relatedId !== id));
    } catch (e) {
      console.warn('Erro ao remover lembrete vinculado ao exame:', e);
    }
  };

  const handleAddReceita = async (
    recData: Omit<Receita, 'id'>,
    remindersToCreate?: Array<Omit<Lembrete, 'id'>>
  ) => {
    if (!activeChildId) {
      setShowChildModal(true);
      alert('Por favor, primeiro cadastre o seu bebê para vincular este registro.');
      return;
    }

    // Prevenção contra salvamento duplo de receita idêntica
    const isDuplicate = receitas.some(
      (r) =>
        r.childId === activeChildId &&
        r.medicineName.trim().toLowerCase() === recData.medicineName.trim().toLowerCase() &&
        (r.dosage || '').trim().toLowerCase() === (recData.dosage || '').trim().toLowerCase() &&
        r.date === recData.date
    );
    if (isDuplicate) {
      console.warn('Receita duplicada ignorada para evitar salvamento duplo.');
      return;
    }

    const { data, error } = await dbInsertReceita(
      {
        ...recData,
        childId: activeChildId,
      },
      currentUser?.id
    );
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    if (data) {
      setReceitas((prev) => [...prev, data].sort(sortByDateAscending));

      // Se foram gerados lembretes nos horários da medicação
      if (remindersToCreate && remindersToCreate.length > 0) {
        const createdList: Lembrete[] = [];
        for (const rem of remindersToCreate) {
          try {
            const { data: newLem } = await dbInsertLembrete(
              {
                ...rem,
                childId: activeChildId,
                relatedId: data.id,
              },
              currentUser?.id
            );
            if (newLem) {
              createdList.push(newLem);
            }
          } catch (lemErr) {
            console.warn('Erro ao inserir lembrete de medicamento:', lemErr);
          }
        }
        if (createdList.length > 0) {
          setLembretes((prev) => [...prev, ...createdList].sort(sortByDateAscending));
        }
      }
    }
  };

  const handleUpdateReceita = async (id: string, updatedFields: Partial<Receita>) => {
    const { error } = await dbUpdateReceita(id, updatedFields);
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setReceitas((prev) => prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r)));
  };

  const handleDeleteReceita = async (id: string) => {
    const { error } = await dbDeleteReceita(id);
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setReceitas((prev) => prev.filter((r) => r.id !== id));

    // Ao excluir receita, remove os lembretes de medicação vinculados
    try {
      await dbDeleteLembreteByRelatedId(id);
      setLembretes((prev) => prev.filter((l) => l.relatedId !== id));
    } catch (e) {
      console.warn('Erro ao remover lembretes vinculados à receita:', e);
    }
  };

  const handleAddLembrete = async (lemData: Omit<Lembrete, 'id'>) => {
    if (!activeChildId) {
      setShowChildModal(true);
      alert('Por favor, primeiro cadastre o seu bebê para vincular este registro.');
      return;
    }

    // Prevenção contra salvamento duplo de lembrete
    const isDuplicate = lembretes.some(
      (l) =>
        l.childId === activeChildId &&
        l.title.trim().toLowerCase() === lemData.title.trim().toLowerCase() &&
        l.subtitle.trim().toLowerCase() === lemData.subtitle.trim().toLowerCase() &&
        l.date === lemData.date &&
        l.time === lemData.time
    );
    if (isDuplicate) {
      console.warn('Lembrete duplicado ignorado para evitar salvamento duplo.');
      return;
    }

    const { data, error } = await dbInsertLembrete(
      {
        ...lemData,
        childId: activeChildId,
      },
      currentUser?.id
    );
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    if (data) {
      setLembretes((prev) => [...prev, data].sort(sortByDateAscending));
    }
  };

  const handleToggleLembreteComplete = async (id: string) => {
    const current = lembretes.find((l) => l.id === id);
    if (!current) return;
    const { error } = await dbUpdateLembrete(id, { completed: !current.completed });
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setLembretes((prev) => prev.map((l) => (l.id === id ? { ...l, completed: !l.completed } : l)));
  };

  const handleDeleteLembrete = async (id: string) => {
    const { error } = await dbDeleteLembrete(id);
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setLembretes((prev) => prev.filter((l) => l.id !== id));
  };

  const handleUpdateLembrete = async (id: string, updatedFields: Partial<Lembrete>) => {
    const { error } = await dbUpdateLembrete(id, updatedFields);
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setLembretes((prev) => prev.map((l) => (l.id === id ? { ...l, ...updatedFields } : l)));
  };

  const handleAddDocumento = async (docData: Omit<Documento, 'id'>) => {
    if (!activeChildId) {
      setShowChildModal(true);
      alert('Por favor, primeiro cadastre o seu bebê para vincular este registro.');
      return;
    }

    // Prevenção contra salvamento duplo de documento
    const isDuplicate = documentos.some(
      (d) =>
        d.childId === activeChildId &&
        d.title.trim().toLowerCase() === docData.title.trim().toLowerCase() &&
        d.date === docData.date &&
        d.category === docData.category
    );
    if (isDuplicate) {
      console.warn('Documento duplicado ignorado.');
      return;
    }

    const { data, error } = await dbInsertDocumento(
      {
        ...docData,
        childId: activeChildId,
      },
      currentUser?.id
    );
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    if (data) {
      setDocumentos((prev) => [...prev, data].sort(sortByDateAscending));
    }
  };

  const handleDeleteDocumento = async (id: string) => {
    const { error } = await dbDeleteDocumento(id);
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setDocumentos((prev) => prev.filter((d) => d.id !== id));
  };

  // Eventos Handlers
  const handleAddEvento = async (eventoData: Omit<Evento, 'id'>) => {
    if (!activeChildId) {
      setShowChildModal(true);
      alert('Por favor, primeiro cadastre o seu bebê para vincular este registro.');
      return;
    }

    // Prevenção contra salvamento duplo de evento
    const isDuplicate = eventos.some(
      (e) =>
        e.childId === activeChildId &&
        e.title.trim().toLowerCase() === eventoData.title.trim().toLowerCase() &&
        e.date === eventoData.date &&
        e.time === eventoData.time
    );
    if (isDuplicate) {
      console.warn('Evento duplicado ignorado.');
      return;
    }

    const { data, error } = await dbInsertEvento(
      {
        ...eventoData,
        childId: activeChildId,
      },
      currentUser?.id
    );
    if (error) {
      alert(`Erro no Supabase ao salvar evento: ${error}`);
      return;
    }
    if (data) {
      setEventos((prev) => [...prev, data].sort(sortByDateAscending));
    }
  };

  const handleUpdateEvento = async (id: string, updatedFields: Partial<Evento>) => {
    const { error } = await dbUpdateEvento(id, updatedFields);
    if (error) {
      alert(`Erro no Supabase ao atualizar evento: ${error}`);
      return { error };
    }
    setEventos((prev) => prev.map((e) => (e.id === id ? { ...e, ...updatedFields } : e)));
    return { error: null };
  };

  const handleDeleteEvento = async (id: string) => {
    const { error } = await dbDeleteEvento(id);
    if (error) {
      alert(`Erro no Supabase: ${error}`);
      return;
    }
    setEventos((prev) => prev.filter((e) => e.id !== id));
  };

  // Vacinas Handlers
  const handleSaveVacina = async (
    registro: Partial<VacinaRegistro> & { childId: string; vacinaId: string; nome: string }
  ) => {
    const { data, error } = await dbSaveVacinaRegistro(registro, currentUser?.id);
    if (error) {
      console.warn('Erro ao salvar vacina:', error);
    }
    if (data) {
      setVacinas((prev) => {
        const exists = prev.some((v) => v.id === data.id);
        if (exists) {
          return prev.map((v) => (v.id === data.id ? data : v));
        }
        return [data, ...prev];
      });
    }
  };

  const handleDeleteVacina = async (id: string) => {
    const { error } = await dbDeleteVacinaRegistro(id);
    if (error) {
      alert(`Erro no Supabase ao excluir registro de vacina: ${error}`);
      return;
    }
    setVacinas((prev) => prev.filter((v) => v.id !== id));
  };

  // Export JSON backup directly from Supabase query data
  const handleExportBackup = () => {
    const backupData = {
      app: 'Meu Prontuário Infantil (Supabase)',
      exportedAt: new Date().toISOString(),
      supabaseUrl: supabaseConfig.url,
      children: childrenList,
      consultas,
      eventos,
      vacinas,
      exames,
      receitas,
      lembretes,
      documentos,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prontuario-supabase-${activeChild.name || 'filho'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Navigation handlers
  const handleBottomTabSelect = (tab: NavTab) => {
    setBottomTab(tab);
    if (tab === 'inicio') {
      setCurrentView('home');
    } else if (tab === 'consultas') {
      setCurrentView('consultas');
    } else if (tab === 'exames') {
      setCurrentView('exames');
    } else if (tab === 'mais') {
      setShowMaisDrawer(true);
    }
  };

  const handleNavigateFromHome = (
    view: 'inicio' | 'consultas' | 'exames' | 'eventos' | 'vacinas' | 'receitas' | 'documentos' | 'lembretes' | 'perfil'
  ) => {
    if (view === 'inicio') {
      setCurrentView('home');
      setBottomTab('inicio');
    } else if (view === 'consultas') {
      setCurrentView('consultas');
      setBottomTab('consultas');
    } else if (view === 'exames') {
      setCurrentView('exames');
      setBottomTab('exames');
    } else {
      setCurrentView(view);
      setBottomTab('mais');
    }
  };

  return (
    <MobileFrame>
      {checkingSession ? (
        /* Loading session state */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F3F8FE] text-center">
          <MascotBear size={72} />
          <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verificando sessão segura...</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Conectando ao Supabase
          </p>
        </div>
      ) : !currentUser && !isAdmin ? (
        /* Screen: Cadastro e Login dos Pais (Google, Email, Recuperação de Senha) */
        <ParentAuthScreen
          onAuthSuccess={(parent) => {
            setCurrentUser(parent);
          }}
          onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        />
      ) : loadingInitial ? (
        /* Loading Live Supabase Records */
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F3F8FE] text-center">
          <MascotBear size={72} />
          <div className="mt-4 flex items-center gap-2 text-blue-600 font-bold text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Consultando banco de dados Supabase...</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Carregando prontuário em tempo real
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {/* Dedicated Administrator Interface */}
          {isAdmin && adminViewMode === 'admin_panel' ? (
            <AdminDashboardView
              supabaseConfig={supabaseConfig}
              onOpenSettings={() => setShowSupabaseModal(true)}
              onSwitchToParentView={(targetChildId) => {
                if (targetChildId) {
                  handleSelectChild(targetChildId);
                }
                setAdminViewMode('parent_app');
                setCurrentView('home');
              }}
              onLogout={handleLogout}
              onAddChild={() => setShowChildModal(true)}
              onExportBackup={handleExportBackup}
            />
          ) : (
            <>
              {/* Admin Mode Bar (Visível apenas para Administrador inspecionando o app dos pais) */}
              {isAdmin && (
                <div className="bg-slate-900 text-slate-200 text-[11px] font-bold px-3 py-2 flex items-center justify-between z-40 border-b border-emerald-500/40 shrink-0">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Visualizando como Responsável</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdminViewMode('admin_panel')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-xs transition"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Voltar ao Painel Admin</span>
                    </button>
                    <button
                      onClick={() => setShowSupabaseModal(true)}
                      className="text-slate-300 hover:text-white underline cursor-pointer text-[10px]"
                    >
                      Banco &amp; SQL
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1 text-[10px]"
                      title="Sair do modo administrador"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}

          {/* Database error banner if table missing */}
          {dbError && (
            <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-4 flex items-center justify-between text-xs text-amber-900 shrink-0 z-30">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">{dbError}</span>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowSupabaseModal(true)}
                  className="font-bold underline text-blue-600 shrink-0 ml-2 cursor-pointer"
                >
                  Ver SQL
                </button>
              )}
            </div>
          )}

          {/* Main Active Screen */}
          {currentView === 'home' && (
            <HomeScreen
              parentName={currentUser?.name || (isAdmin ? 'Administrador' : 'Responsável')}
              activeChild={activeChild}
              consultas={consultas}
              eventos={eventos}
              vacinas={vacinas}
              exames={exames}
              receitas={receitas}
              lembretes={lembretes}
              documentos={documentos}
              isAdmin={isAdmin}
              onNavigate={handleNavigateFromHome}
              onOpenChildModal={() => setShowChildModal(true)}
              onOpenSettings={() => setShowSupabaseModal(true)}
              onOpenInstallModal={() => setShowInstallModal(true)}
              onAddChild={() => setShowChildModal(true)}
              onOpenFamilyShare={() => setShowFamilyShareModal(true)}
              onOpenEnterCode={() => setShowEnterCodeModal(true)}
              pendingShares={pendingShares}
              onAcceptPendingShare={handleAcceptPendingShare}
            />
          )}

          {currentView === 'consultas' && (
            <ConsultasView
              consultas={consultas}
              childId={activeChildId}
              onBack={() => {
                setCurrentView('home');
                setBottomTab('inicio');
              }}
              onAddConsulta={handleAddConsulta}
              onUpdateConsulta={handleUpdateConsulta}
              onDeleteConsulta={handleDeleteConsulta}
            />
          )}

          {currentView === 'exames' && (
            <ExamesView
              exames={exames}
              childId={activeChildId}
              onBack={() => {
                setCurrentView('home');
                setBottomTab('inicio');
              }}
              onOpenScanner={() => setShowScannerModal(true)}
              onAddExame={handleAddExame}
              onUpdateExame={handleUpdateExame}
              onDeleteExame={handleDeleteExame}
            />
          )}

          {currentView === 'receitas' && (
            <ReceitasView
              receitas={receitas}
              lembretes={lembretes}
              childId={activeChildId}
              onBack={() => {
                setCurrentView('home');
                setBottomTab('inicio');
              }}
              onNavigateToLembretes={() => {
                setCurrentView('lembretes');
              }}
              onAddReceita={handleAddReceita}
              onUpdateReceita={handleUpdateReceita}
              onDeleteReceita={handleDeleteReceita}
            />
          )}

          {currentView === 'lembretes' && (
            <LembretesView
              lembretes={lembretes}
              childId={activeChildId}
              onBack={() => {
                setCurrentView('home');
                setBottomTab('inicio');
              }}
              onAddLembrete={handleAddLembrete}
              onToggleComplete={handleToggleLembreteComplete}
              onDeleteLembrete={handleDeleteLembrete}
              onUpdateLembrete={handleUpdateLembrete}
            />
          )}

          {currentView === 'documentos' && (
            <DocumentosView
              documentos={documentos}
              childId={activeChildId}
              onBack={() => {
                setCurrentView('home');
                setBottomTab('inicio');
              }}
              onAddDocumento={handleAddDocumento}
              onDeleteDocumento={handleDeleteDocumento}
            />
          )}

          {currentView === 'perfil' && (
            <PerfilView
              child={activeChild}
              consultasCount={consultas.length}
              examesCount={exames.length}
              receitasCount={receitas.length}
              vacinasCount={vacinas.filter((v) => v.childId === activeChildId && v.vacinado).length}
              documentosCount={documentos.length}
              eventosCount={eventos.length}
              onBack={() => {
                setCurrentView('home');
                setBottomTab('inicio');
              }}
              onEditChild={() => setShowChildModal(true)}
              onDeleteChild={handleDeleteChild}
            />
          )}

          {currentView === 'eventos' && (
            <EventosView
              eventos={eventos}
              childId={activeChildId}
              onBack={() => {
                setCurrentView('home');
                setBottomTab('inicio');
              }}
              onAddEvento={handleAddEvento}
              onUpdateEvento={handleUpdateEvento}
              onDeleteEvento={handleDeleteEvento}
            />
          )}

          {currentView === 'vacinas' && (
            <VacinasView
              child={activeChild}
              vacinas={vacinas}
              onSaveVacina={handleSaveVacina}
              onDeleteVacina={handleDeleteVacina}
              onAddLembrete={handleAddLembrete}
              onDeleteLembreteByRelatedId={async (relId) => {
                await dbDeleteLembreteByRelatedId(relId);
                setLembretes((prev) => prev.filter((l) => l.relatedId !== relId));
              }}
              onBackToHome={() => {
                setCurrentView('home');
                setBottomTab('inicio');
              }}
              onOpenSettings={() => setShowSupabaseModal(true)}
            />
          )}

              {/* Bottom Navigation Bar */}
              <BottomNavBar
                currentTab={bottomTab}
                onSelectTab={handleBottomTabSelect}
                badgeCount={lembretes.filter((l) => !l.completed).length}
              />
            </>
          )}
        </div>
      )}

      {/* Scanner Modal (Screen 6: Adicionar Exame / Escanear Raio-X ou Receita) */}
      {showScannerModal && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col h-full overflow-hidden">
          <ScannerModal
            childId={activeChildId}
            onClose={() => setShowScannerModal(false)}
            onSaveExame={handleAddExame}
          />
        </div>
      )}

      {/* Child Switcher & Profile Modal */}
      {showChildModal && (
        <ChildModal
          childrenList={childrenList}
          activeChild={activeChild}
          onSelectChild={handleSelectChild}
          onAddChild={handleAddChild}
          onUpdateChild={handleUpdateChild}
          onDeleteChild={handleDeleteChild}
          onClose={() => setShowChildModal(false)}
          onOpenFamilyShare={() => setShowFamilyShareModal(true)}
          onOpenEnterCode={() => setShowEnterCodeModal(true)}
        />
      )}

      {/* Supabase Database Settings Modal */}
      {showSupabaseModal && (
        <SupabaseSettingsModal
          config={supabaseConfig}
          onSaveConfig={(cfg) => {
            setSupabaseConfig(cfg);
            if (cfg.isConnected) refreshFromSupabase();
          }}
          onExportBackup={handleExportBackup}
          onClose={() => setShowSupabaseModal(false)}
        />
      )}

      {/* Mais Options Drawer */}
      {showMaisDrawer && (
        <MaisDrawer
          onClose={() => setShowMaisDrawer(false)}
          onNavigate={(view) => {
            setCurrentView(view);
            setBottomTab('mais');
          }}
          onOpenSupabase={() => setShowSupabaseModal(true)}
          onOpenChildModal={() => setShowChildModal(true)}
          onOpenInstallModal={() => setShowInstallModal(true)}
          onOpenFamilyShare={() => setShowFamilyShareModal(true)}
          onOpenEnterCode={() => setShowEnterCodeModal(true)}
          onLogout={handleLogout}
          supabaseConnected={supabaseConfig.isConnected}
          isAdmin={isAdmin}
        />
      )}

      {/* Family Share Management Modal (Convidar Mãe, Pai, Cuidadores) */}
      {showFamilyShareModal && (
        <FamilyShareModal
          child={activeChild}
          currentUser={currentUser}
          onClose={() => setShowFamilyShareModal(false)}
          onShareCreated={() => {
            if (currentUser?.email) {
              refreshPendingShares(currentUser.email);
            }
          }}
        />
      )}

      {/* Enter Family Invite Code Modal */}
      {showEnterCodeModal && (
        <EnterFamilyCodeModal
          currentUser={currentUser}
          onClose={() => setShowEnterCodeModal(false)}
          onSuccess={handleCodeLinked}
        />
      )}

      {/* Floating Success Toast for Family Actions */}
      {shareToast && (
        <div className="absolute top-4 left-4 right-4 z-50 p-3.5 bg-slate-900/95 text-white rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold leading-tight flex-1">{shareToast}</p>
          <button
            onClick={() => setShareToast(null)}
            className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Secret Administrator Login Modal */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onAdminSuccess={() => {
          setIsAdmin(true);
          setAdminViewMode('admin_panel');
          setShowAdminLoginModal(false);
          refreshFromSupabase();
        }}
      />

      {/* PWA Install Modal (Celular / Android / iOS / Desktop) */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Pop-up no Celular ao Chegar no Horário Previsto do Lembrete */}
      {activeReminderAlert && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-blue-100 animate-in zoom-in-95 duration-200 text-center space-y-4">
            {/* Ícone com animação de toque sonoro pulsante */}
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-lg relative z-10">
                <Bell className="w-7 h-7 animate-bounce" />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-block">
                Lembrete de Saúde
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-2">
                {activeReminderAlert.title}
              </h3>
              <p className="text-sm font-semibold text-slate-700 whitespace-pre-line mt-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {activeReminderAlert.subtitle}
              </p>
              <p className="text-xs font-bold text-sky-600 mt-2">
                Aviso configurado: {activeReminderAlert.notifyHoursBefore ?? 24} horas antes
              </p>
            </div>

            {/* Ações do Alerta */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => playReminderSound((activeReminderAlert.soundId as any) || 'gentle_bell')}
                className="w-full py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Ouvir Toque Novamente</span>
              </button>

              <button
                onClick={() => {
                  handleToggleLembreteComplete(activeReminderAlert.id);
                  setDismissedReminderAlerts((prev) => new Set(prev).add(activeReminderAlert.id));
                  setActiveReminderAlert(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar como Concluído</span>
              </button>

              <button
                onClick={() => {
                  setDismissedReminderAlerts((prev) => new Set(prev).add(activeReminderAlert.id));
                  setActiveReminderAlert(null);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Entendido / Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileFrame>
  );
}
