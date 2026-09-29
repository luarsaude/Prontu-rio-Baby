import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  Baby,
  Calendar,
  FlaskConical,
  Pill,
  Search,
  RefreshCw,
  Eye,
  LogOut,
  Database,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Heart,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Download,
  Plus,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Child, AdminUserRecord, AdminDashboardData, SupabaseConfig } from '../types';
import { dbFetchAdminDashboardData } from '../services/supabase';
import { MascotBear } from './MascotIcons';

interface AdminDashboardViewProps {
  supabaseConfig: SupabaseConfig;
  onOpenSettings: () => void;
  onSwitchToParentView: (targetChildId?: string) => void;
  onLogout: () => void;
  onAddChild: (targetUserId?: string) => void;
  onExportBackup?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  supabaseConfig,
  onOpenSettings,
  onSwitchToParentView,
  onLogout,
  onAddChild,
  onExportBackup,
}) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'with_children' | 'no_children'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'children' | 'database'>('users');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const loadDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await dbFetchAdminDashboardData();
      setData(result);
    } catch (e) {
      console.error('Erro ao carregar dados administrativos:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Filter users based on search and selected filter
  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    const query = searchQuery.trim().toLowerCase();

    return data.users.filter((user) => {
      // Search match
      const matchName = user.name?.toLowerCase().includes(query);
      const matchEmail = user.email?.toLowerCase().includes(query);
      const matchChild = user.children?.some((c) => c.name?.toLowerCase().includes(query));
      const matchesSearch = !query || matchName || matchEmail || matchChild;

      if (!matchesSearch) return false;

      // Filter tab
      if (userFilter === 'with_children') return user.children.length > 0;
      if (userFilter === 'no_children') return user.children.length === 0;
      return true;
    });
  }, [data?.users, searchQuery, userFilter]);

  // Filter all children based on search
  const filteredChildren = useMemo(() => {
    if (!data?.allChildren) return [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return data.allChildren;

    return data.allChildren.filter(
      (c) =>
        c.name?.toLowerCase().includes(query) ||
        c.pediatricianName?.toLowerCase().includes(query) ||
        c.bloodType?.toLowerCase().includes(query) ||
        c.allergies?.some((a) => a.toLowerCase().includes(query))
    );
  }, [data?.allChildren, searchQuery]);

  // Helper to calculate child age
  const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return 'Idade não informada';
    try {
      const parts = birthDate.split('-').map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) return 'Idade não informada';
      const birth = new Date(parts[0], parts[1] - 1, parts[2]);
      if (isNaN(birth.getTime())) return 'Idade não informada';
      const now = new Date();
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (now.getDate() < birth.getDate()) months--;
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years <= 0) {
        return months <= 0 ? 'Recém-nascido(a)' : `${months} ${months === 1 ? 'mês' : 'meses'}`;
      }
      return `${years}a ${months}m`;
    } catch {
      return 'Idade não informada';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 min-h-0 overflow-y-auto pb-16">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Mode */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
              <Shield className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-white uppercase">
                  Painel Administrativo
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                  Supabase Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Gestão de Usuários, Crianças e Prontuários
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
              title="Atualizar dados do Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={onOpenSettings}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-emerald-200 text-[11px] font-bold transition cursor-pointer border border-slate-700 flex items-center gap-1"
              title="Configurações de Banco de Dados & SQL"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">Banco & SQL</span>
            </button>

            <button
              onClick={() => onSwitchToParentView()}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition cursor-pointer shadow-xs flex items-center gap-1.5"
              title="Visualizar interface do aplicativo para os pais"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ver App</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition cursor-pointer"
              title="Sair do Modo Administrador"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="p-4 space-y-4 max-w-5xl mx-auto w-full">
        {/* KPI Overview Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Card 1: Users */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Usuários</span>
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-white">
                {data ? data.users.length : '...'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Responsáveis</p>
            </div>
          </div>

          {/* Card 2: Children */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Filhos</span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Baby className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-white">
                {data ? data.allChildren.length : '...'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Crianças vinculadas</p>
            </div>
          </div>

          {/* Card 3: Consultas */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Consultas</span>
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-white">
                {data ? data.totalConsultas : '...'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Registros</p>
            </div>
          </div>

          {/* Card 4: Exames */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Exames</span>
              <div className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <FlaskConical className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-white">
                {data ? data.totalExames : '...'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Laboratório/Imagens</p>
            </div>
          </div>

          {/* Card 5: Receitas */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Receitas</span>
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Pill className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-black text-white">
                {data ? data.totalReceitas : '...'}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Medicamentos</p>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuários &amp; Filhos</span>
            {data && (
              <span className="bg-black/30 px-1.5 py-0.2 rounded-full text-[10px]">
                {data.users.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('children')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'children'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Todas as Crianças</span>
            {data && (
              <span className="bg-black/30 px-1.5 py-0.2 rounded-full text-[10px]">
                {data.allChildren.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Banco &amp; SQL</span>
          </button>
        </div>

        {/* TAB 1: USERS & LINKED CHILDREN */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por responsável, e-mail ou nome da criança..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Filter pills */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shrink-0 text-xs">
                <button
                  onClick={() => setUserFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    userFilter === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Todos ({data?.users.length || 0})
                </button>
                <button
                  onClick={() => setUserFilter('with_children')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    userFilter === 'with_children'
                      ? 'bg-slate-700 text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Com Filhos ({data?.users.filter((u) => u.children.length > 0).length || 0})
                </button>
                <button
                  onClick={() => setUserFilter('no_children')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                    userFilter === 'no_children'
                      ? 'bg-slate-700 text-slate-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sem Filhos ({data?.users.filter((u) => u.children.length === 0).length || 0})
                </button>
              </div>
            </div>

            {/* Loading skeleton */}
            {loading ? (
              <div className="p-8 text-center bg-slate-800/40 border border-slate-800 rounded-2xl">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-bold">
                  Carregando usuários e filhos do Supabase...
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/40 border border-slate-800 rounded-2xl">
                <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">Nenhum usuário encontrado</p>
                <p className="text-xs text-slate-500 mt-1">
                  Tente alterar os termos da busca ou filtre por outros critérios.
                </p>
              </div>
            ) : (
              /* Users List with linked children */
              <div className="space-y-3">
                {filteredUsers.map((user) => {
                  const isExpanded = expandedUserId === user.id || filteredUsers.length === 1;

                  return (
                    <div
                      key={user.id}
                      className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xs transition hover:border-slate-600"
                    >
                      {/* User Header */}
                      <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/60">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* User Avatar Initial */}
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-black text-white truncate">
                                {user.name || user.email}
                              </h3>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  user.role === 'admin'
                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                }`}
                              >
                                {user.role === 'admin' ? 'Administrador' : 'Responsável'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                              {user.email && user.email !== user.name ? user.email : (user.email ? `Google: ${user.email}` : '')}
                            </p>
                          </div>
                        </div>

                        {/* User badges and expand button */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/60 shrink-0">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${
                              user.children.length > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            <Baby className="w-3.5 h-3.5" />
                            <span>
                              {user.children.length}{' '}
                              {user.children.length === 1 ? 'filho vinculado' : 'filhos vinculados'}
                            </span>
                          </span>

                          <button
                            onClick={() =>
                              setExpandedUserId(isExpanded ? null : user.id)
                            }
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold px-2 py-1 rounded-lg hover:bg-slate-700/60 transition cursor-pointer"
                          >
                            {isExpanded ? 'Recolher' : 'Ver filhos'}
                          </button>
                        </div>
                      </div>

                      {/* Linked Children Container */}
                      {isExpanded && (
                        <div className="p-3.5 bg-slate-900/60 border-t border-slate-700/60 space-y-2.5">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <Baby className="w-3.5 h-3.5 text-emerald-400" />
                              Filhos vinculados a esta conta:
                            </span>
                            <button
                              onClick={() => onAddChild(user.id)}
                              className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Adicionar filho</span>
                            </button>
                          </div>

                          {user.children.length === 0 ? (
                            <div className="p-3 bg-slate-800/40 border border-dashed border-slate-700 rounded-xl text-center">
                              <p className="text-xs text-slate-400">
                                Nenhum filho vinculado a este responsável ainda.
                              </p>
                              <button
                                onClick={() => onAddChild(user.id)}
                                className="mt-2 text-xs font-bold text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Cadastrar primeira criança</span>
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {user.children.map((child) => (
                                <div
                                  key={child.id}
                                  className="p-3 rounded-xl bg-slate-800 border border-slate-700/80 flex flex-col justify-between hover:border-slate-600 transition"
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                                          <Baby className="w-4 h-4 text-blue-300" />
                                        </div>
                                        <div className="min-w-0">
                                          <h4 className="text-xs font-black text-white truncate">
                                            {child.name}
                                          </h4>
                                          <p className="text-[10px] text-slate-400">
                                            {calculateAge(child.birthDate)}
                                            {child.bloodType && ` • Sangue ${child.bloodType}`}
                                          </p>
                                        </div>
                                      </div>

                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                          child.gender === 'girl'
                                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                        }`}
                                      >
                                        {child.gender === 'girl' ? 'Menina' : 'Menino'}
                                      </span>
                                    </div>

                                    {/* Medical Details */}
                                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap gap-1 text-[10px]">
                                      {child.pediatricianName && (
                                        <span className="bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded-md">
                                          🩺 Dr(a). {child.pediatricianName}
                                        </span>
                                      )}
                                      {child.allergies && child.allergies.length > 0 ? (
                                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold">
                                          ⚠️ Alergia: {child.allergies.join(', ')}
                                        </span>
                                      ) : (
                                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">
                                          Sem alergias
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action: Open Child Medical Records in Parent View */}
                                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-end">
                                    <button
                                      onClick={() => onSwitchToParentView(child.id)}
                                      className="w-full py-1.5 px-3 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Acessar Prontuário do Filho</span>
                                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL CHILDREN DIRECT VIEW */}
        {activeTab === 'children' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome da criança, pediatra ou alergia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {filteredChildren.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/40 border border-slate-800 rounded-2xl">
                <Baby className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">Nenhuma criança encontrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredChildren.map((child) => {
                  // Find parent for this child
                  const parentUser = data?.users.find((u) => u.id === child.userId);

                  return (
                    <div
                      key={child.id}
                      className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-2xl flex flex-col justify-between hover:border-slate-600 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                              <Baby className="w-5 h-5 text-blue-300" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-black text-white truncate">
                                {child.name}
                              </h3>
                              <p className="text-xs text-slate-400">
                                {calculateAge(child.birthDate)}
                                {child.bloodType && ` • Sangue ${child.bloodType}`}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              child.gender === 'girl'
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {child.gender === 'girl' ? 'Menina' : 'Menino'}
                          </span>
                        </div>

                        {/* Responsible Parent Pill */}
                        <div className="mt-3 p-2 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                            Responsável:
                          </span>
                          <span
                            className="font-bold text-slate-200 truncate max-w-[220px]"
                            title={parentUser ? (parentUser.email || parentUser.name) : 'Responsável vinculado'}
                          >
                            {parentUser ? (parentUser.name || parentUser.email) : 'Responsável vinculado'}
                          </span>
                        </div>

                        {/* Medical notes */}
                        <div className="mt-2 flex flex-wrap gap-1 text-[10px]">
                          {child.pediatricianName && (
                            <span className="bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md">
                              🩺 Pediatra: {child.pediatricianName}
                            </span>
                          )}
                          {child.allergies && child.allergies.length > 0 && (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold">
                              ⚠️ Alergia: {child.allergies.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Button: Open Child Prontuário */}
                      <button
                        onClick={() => onSwitchToParentView(child.id)}
                        className="mt-3 w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Abrir Prontuário Completo</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DATABASE HEALTH & SQL SCRIPTS */}
        {activeTab === 'database' && (
          <div className="space-y-3">
            {/* Database Status Card */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Status da Conexão Supabase
                    </h3>
                    <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Conectado e Sincronizado em Tempo Real
                    </p>
                  </div>
                </div>

                <button
                  onClick={onOpenSettings}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  Abrir Modal SQL
                </button>
              </div>

              {/* Endpoint & Project Info */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/60 font-mono text-[11px] text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Supabase URL:</span>
                  <span className="text-emerald-300 font-bold truncate max-w-[240px]">
                    {supabaseConfig.url || 'Conectado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Persistência:</span>
                  <span className="text-blue-300">PostgreSQL com Row Level Security (RLS)</span>
                </div>
              </div>
            </div>

            {/* Tables Count Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Registros por Tabela no Supabase
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400">public.children</span>
                  <span className="font-bold text-white">{data?.allChildren.length || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400">public.profiles</span>
                  <span className="font-bold text-white">{data?.users.length || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400">public.consultas</span>
                  <span className="font-bold text-white">{data?.totalConsultas || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400">public.exames</span>
                  <span className="font-bold text-white">{data?.totalExames || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400">public.receitas</span>
                  <span className="font-bold text-white">{data?.totalReceitas || 0}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex justify-between items-center">
                  <span className="text-slate-400">public.lembretes</span>
                  <span className="font-bold text-white">{data?.totalLembretes || 0}</span>
                </div>
              </div>

              {/* Action buttons */}
              {onExportBackup && (
                <div className="pt-2">
                  <button
                    onClick={onExportBackup}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Exportar Backup Geral de Todos os Dados (JSON)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
