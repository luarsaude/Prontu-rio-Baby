export type VacinaOferta = 'SUS' | 'Particular' | 'Ambos';

export type VacinaFonte = {
  nome: string;
  orgao: string;
  url: string;
  descricao?: string;
  urlSecundaria?: string;
  nomeSecundaria?: string;
};

export type VacinaCatalogItem = {
  id: string;
  nome: string;
  dose: string;
  idadeRecomendada: string;
  ageOrder: number;
  oferta: VacinaOferta;
  obrigatoria: boolean;
  descricaoCurta: string;
  paraQueServe: string;
  doencasEvitadas: string[];
  reacoesComuns: string;
  cuidados: string;
  contraindicacoes?: string;
  particularInfo?: string;
  fonte?: VacinaFonte;
};

export type VacinaRegistro = {
  id: string;
  userId?: string;
  childId: string;
  vacinaId: string;
  nome: string;
  dose: string;
  idadeRecomendada: string;
  ageOrder?: number;
  oferta: VacinaOferta;
  vacinado: boolean;
  status?: 'Realizada' | 'Agendada' | 'Pendente';
  dataVacinacao?: string; // DD/MM/YYYY ou YYYY-MM-DD
  dataAgendada?: string; // YYYY-MM-DD
  horaAgendada?: string; // HH:MM
  lembreteId?: string;
  lote?: string;
  laboratorio?: string;
  localVacinacao?: string;
  profissional?: string;
  comprovanteUrl?: string;
  attachments?: string[];
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Child = {
  id: string;
  userId?: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'boy' | 'girl';
  photoUrl?: string;
  avatarId: string;
  bloodType?: string;
  allergies?: string[];
  weight?: string;
  height?: string;
  pediatricianName?: string;
  notes?: string;
  isShared?: boolean;
  sharedRole?: string;
  ownerEmail?: string;
};

export type Consulta = {
  id: string;
  userId?: string;
  childId: string;
  doctorName: string;
  specialty: string;
  date: string; // DD/MM/YYYY or YYYY-MM-DD
  time: string; // HH:MM
  location?: string;
  status: 'Realizada' | 'Agendada' | 'Cancelada';
  notes?: string;
  reminder?: boolean;
  prescriptionsLinked?: string[];
  attachments?: string[]; // URLs for attached documents/photos stored in Supabase
  fileUrl?: string;
};

export type Evento = {
  id: string;
  userId?: string;
  childId: string;
  title: string; // Evento (o que ocorreu?)
  description?: string; // Detalhes do ocorrido
  date: string; // Data (DD/MM/YYYY ou YYYY-MM-DD)
  time: string; // Horário (HH:MM)
  status: 'Em observação' | 'Resolvido'; // Status da ocorrência
  usingMedication: boolean; // Está fazendo uso de algum medicamento?
  medicationDetails?: string; // Nome do medicamento, dosagem, etc.
  undergoingTreatment: boolean; // Está fazendo algum tratamento?
  treatmentDetails?: string; // Tipo de tratamento, repouso, curativos, fisioterapia
  actionTaken: string; // Qual foi a medida tomada?
  referredToDoctor: boolean; // Foi encaminhado para um médico?
  doctorReferralDetails?: string; // Nome do médico, hospital, pronto-socorro ou orientações
  attachments?: string[]; // Fotos/imagens salvas no Supabase Storage
  fileUrl?: string;
};

export type Exame = {
  id: string;
  userId?: string;
  childId: string;
  title: string;
  type: 'Raio-X' | 'Sangue' | 'Urina' | 'Ultrassom' | 'Tomografia' | 'Ressonância' | 'Outro';
  status: 'Realizado' | 'Agendado' | 'Solicitado';
  date: string;
  expectedDate?: string;
  location?: string;
  doctorRequested?: string;
  hasAlteration: boolean;
  alterationDetails?: string;
  observations?: string;
  fileUrl?: string;
  fileType?: 'image' | 'pdf' | 'xray';
  attachments?: string[];
};

export type Receita = {
  id: string;
  userId?: string;
  childId: string;
  medicineName: string;
  dosage: string;
  instructions?: string;
  date: string;
  status: 'Ativa' | 'Antiga';
  doctorName?: string;
  fileUrl?: string;
  category?: string;
  intervalHours?: number;
  durationDays?: number;
  firstDoseTime?: string;
};

export type Documento = {
  id: string;
  userId?: string;
  childId: string;
  title: string;
  category: 'Cartão de Vacinas' | 'Certidão' | 'Laudo Médico' | 'Plano de Saúde' | 'Outro';
  date: string;
  fileUrl?: string;
  fileType?: 'image' | 'pdf';
  notes?: string;
  attachments?: string[];
};

export type Lembrete = {
  id: string;
  userId?: string;
  childId: string;
  type: 'Consulta' | 'Exame' | 'Retorno' | 'Medicamento' | 'Vacina';
  title: string;
  subtitle: string;
  date: string;
  time?: string;
  completed: boolean;
  relatedId?: string;
  notifyHoursBefore?: number; // Padrão: 24 horas
  soundId?: string;           // 10 opções de personalização
};

export type SupabaseConfig = {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isCustomConfigured: boolean;
  lastSync?: string;
};

export type ParentUser = {
  id: string;
  email: string;
  name: string;
  role?: 'parent' | 'admin';
  provider?: string;
};

export type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'admin';
  createdAt?: string;
  lastSignIn?: string;
  children: Child[];
};

export type AdminDashboardData = {
  users: AdminUserRecord[];
  allChildren: Child[];
  unassignedChildren: Child[];
  totalConsultas: number;
  totalExames: number;
  totalReceitas: number;
  totalLembretes: number;
  totalDocumentos: number;
};

export type FamilyRelationship = 'Mãe' | 'Pai' | 'Avó / Avô' | 'Cuidador(a) / Babá' | 'Familiar' | 'Outro';

export type FamilyShare = {
  id: string;
  childId: string;
  childName?: string;
  ownerId: string;
  ownerEmail: string;
  ownerName?: string;
  sharedWithEmail: string;
  sharedWithUserId?: string;
  inviteCode: string;
  relationship: FamilyRelationship;
  permission: 'full' | 'view'; // full: can add/edit medical entries; view: read-only
  status: 'pending' | 'accepted';
  createdAt: string;
  acceptedAt?: string;
};

