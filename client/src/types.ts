export type LegalArea = 
  | 'laboral' 
  | 'civil' 
  | 'penal' 
  | 'administrativo' 
  | 'constitucional' 
  | 'familia' 
  | 'comercial' 
  | 'tributario'
  | 'GENERAL';

export type CaseStatus = 
  | 'activo' 
  | 'en_tramite' 
  | 'suspendido' 
  | 'en_fallo' 
  | 'cerrado';

export type UserRole = 'DIRECTOR' | 'SUPERVISOR' | 'STUDENT' | 'INTAKE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleName?: string;
  active: boolean;
  createdAt: string;
  passwordHash?: string;
}

export interface CaseParty {
  name: string;
  idType: 'CC' | 'NIT' | 'CE' | 'TI' | 'Pasaporte';
  idNumber: string;
  role: string;
  email?: string;
  phone?: string;
  address?: string;
  consent?: boolean;
  consentDate?: string;
  confidential?: boolean;
}

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  legalArea: LegalArea;
  procedureType: string;
  facts: string;
  claims: string;
  plaintiff: CaseParty;
  defendant: CaseParty;
  authority: string;
  status: CaseStatus;
  filingDate: string; // YYYY-MM-DD
  assignee: string;
  responsibleId?: string;
  supervisorId?: string;
  nextAction: string;
  deadlineDate: string; // YYYY-MM-DD
  notes: string;
  isProBono?: boolean;
  estimatedValue?: number; // COP
  consent?: boolean;
  confidential?: boolean;
  createdAt: string;
  updatedAt: string;
  actions?: LegalAction[];
  documents?: LegalDocumentRecord[];
  drafts?: LegalDraft[];
}

export type ActionType = 
  | 'audiencia' 
  | 'reunion' 
  | 'vencimiento_termino' 
  | 'radicacion' 
  | 'entrega_documentos' 
  | 'recordatorio';

export type ProceduralTermType = 'dias_calendario' | 'termino_procesal';

export type LegalVerificationStatus = 'verificado' | 'pendiente_verificacion';

export type ActionUrgency = 'vencido' | 'hoy' | 'critico' | 'proximo' | 'a_tiempo' | 'cumplido';

export interface LegalAction {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle: string;
  title: string;
  type: ActionType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  proceduralTermType: ProceduralTermType;
  legalVerificationStatus: LegalVerificationStatus;
  legalVerificationNotes: string;
  daysDiff?: number;
  urgency?: ActionUrgency;
  responsible: string;
  createdAt: string;
  updatedAt: string;
}

export type DocType = 
  | 'demanda_peticion' 
  | 'contestacion' 
  | 'poder' 
  | 'prueba_documental' 
  | 'auto_resolucion' 
  | 'sentencia' 
  | 'memorial' 
  | 'notificacion' 
  | 'otro';

export type DocReviewStatus = 'pendiente_cotejo' | 'cotejado_aprobado' | 'observado';

export interface LegalDocumentRecord {
  id: string;
  caseId: string;
  caseNumber: string;
  caseTitle?: string;
  title: string;
  originalFilename: string;
  storedFilename: string;
  documentType: DocType;
  uploadDate: string;
  sizeBytes: number;
  mimeType: string;
  description: string;
  reviewStatus: DocReviewStatus;
  reviewNotes?: string;
  uploadedBy?: string;
}

export type DraftTemplateType = 
  | 'derecho_peticion' 
  | 'accion_tutela' 
  | 'solicitud_conciliacion' 
  | 'memorial_impulso' 
  | 'solicitud_informacion' 
  | 'comunicacion_oficial' 
  | 'checklist_documental';

export interface LegalDraft {
  id: string;
  templateType: DraftTemplateType;
  title: string;
  caseId?: string;
  formData: Record<string, any>;
  generatedContent: string;
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
}

export type SourceStatus = 'VERIFIED' | 'PENDING_REVIEW';

export interface OfficialSource {
  id: string;
  title: string;
  entity: string;
  url: string;
  area: LegalArea;
  status: SourceStatus;
  consultedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  note: string;
  syllabus?: string;
  relevantArticles?: string[];
  thematicDescriptor?: string;
  extractedQuote?: string;
  courtLevel?: string;
}

export type PrecedentRole = 'HITO_FUNDADORA' | 'MODIFICADORA' | 'CONSOLIDADORA' | 'VIGENTE_ARQUIMEDES';

export interface JurisprudenceRuling {
  id: string;
  rulingRef: string;
  court: string;
  chamber?: string;
  date: string;
  magistrate: string;
  role: PrecedentRole;
  roleLabel: string;
  thematicDescriptor: string;
  factsContext: string;
  keyHolding: string;
  extractExcerpt: string;
  relatoriaUrl: string;
  officialVerified: boolean;
}

export interface CaseApplicationGuide {
  scenario: string;
  courtHoldingForCase: string;
  recommendedLegalAction: string;
  precedentToCite: string;
  pitfallWarning: string;
}

export interface JurisprudenceLine {
  id: string;
  legalArea: LegalArea;
  topic: string;
  legalProblem: string;
  court: string;
  summaryDoctrine: string;
  rulings: JurisprudenceRuling[];
  caseApplications: CaseApplicationGuide[];
  tags: string[];
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  event: string;
  entity: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DashboardMetrics {
  totalCases: number;
  activeCases: number;
  inProgressCases: number;
  suspendedCases: number;
  inRulingCases: number;
  closedCases: number;
  upcomingDeadlinesCount: number;
  pendingActionsCount: number;
  completedActionsCount: number;
  pendingSourcesCount: number;
  verifiedSourcesCount: number;
  casesByArea: { area: LegalArea; count: number; label: string }[];
  workloadByAssignee: { assignee: string; activeCount: number; totalCount: number }[];
  monthlyEvolution: { month: string; opened: number; closed: number }[];
  urgentActions: LegalAction[];
  recentAudit?: AuditLogEntry[];
}

export interface StrategicProspectus {
  caseDiagnosis: string;
  recommendedNextSteps: string[];
  applicableNormsAndSources: Array<{
    norm: string;
    article: string;
    officialSourceTitle: string;
    officialUrl: string;
    relevance: string;
  }>;
  jurisprudencePrecedents: Array<{
    court: string;
    precedentRef: string;
    keyHolding: string;
    relatoriaUrl?: string;
  }>;
}

export interface PendingActionGuidance {
  actionTitle: string;
  urgencyLevel: string;
  daysRemaining?: number;
  howToDevelopStepByStep: string[];
  proceduralRulesNotice: string;
  pitfallsToAvoid: string[];
}

export interface HearingPreparationGuidance {
  hearingType: string;
  suggestedSupportMaterials: Array<{
    materialName: string;
    description: string;
    urgency: 'Indispensable' | 'Recomendable';
  }>;
  interrogationAndEvidenceTactics: string[];
  inattendanceConsequencesNotice: string;
  settlementFormulasAdvice: string;
}

export interface RemediesAndIncidentsStrategy {
  availableOrdinaryRemedies: Array<{
    name: string;
    legalBasis: string;
    deadlineAndFiling: string;
    purpose: string;
  }>;
  extraordinaryAndConstitutionalRemedies: Array<{
    name: string;
    legalBasis: string;
    requirements: string;
  }>;
  incidenteDesacatoGuide?: {
    legalBasis: string;
    differencesWithCumplimiento: string;
    stepByStepProcedure: string[];
    remediesAndConsulta: string;
    sanctionsRisk: string;
  };
}

export interface AICaseAnalysisRequest {
  caseId?: string;
  caseTitle?: string;
  legalArea?: string;
  procedureType?: string;
  facts: string;
  claims?: string;
  partiesInfo?: string;
  authority?: string;
  currentStatus?: string;
  nextAction?: string;
  deadlineDate?: string;
  currentDoubtOrNeed?: string;
  specificQueryType?: 'general' | 'estrategia' | 'audiencia' | 'actuacion_pendiente' | 'desacato_recursos';
}

export interface AICaseAnalysisResult {
  timeline: { dateOrPeriod: string; description: string; relevance: string }[];
  factsToClarify: string[];
  documentChecklist: { documentName: string; purpose: string; necessity: 'Obligatorio' | 'Recomendable' | 'Opcional' }[];
  interviewQuestions: string[];
  legalAreas: { area: string; confidence: 'Alta' | 'Media' | 'Baja'; reasoning: string }[];
  preliminaryActions: { stepNumber: number; title: string; timeframe: string; description: string }[];
  risksAndUncertainties: { risk: string; severity: 'Alta' | 'Media' | 'Baja'; mitigation: string }[];
  executiveSummary: string;
  sourcesNote: string;
  isAiMockMode: boolean;
  modelUsed: string;
  disclaimer: string;
  piiMinimized?: boolean;

  // Módulos especializados solicitados
  strategicProspectus?: StrategicProspectus;
  pendingActionGuidance?: PendingActionGuidance;
  hearingPreparation?: HearingPreparationGuidance;
  remediesAndIncidentsStrategy?: RemediesAndIncidentsStrategy;
  theoryOfTheCase?: {
    factualTheory: string;
    probatoryTheory: string;
    legalTheory: string;
  };
}

export interface GovernanceOverview {
  integrations: Array<{
    name: string;
    status: 'MANUAL_LINK' | 'CONFIGURED_NOT_LIVE_TESTED' | 'PENDING_CREDENTIAL' | 'PENDING_INSTITUTIONAL';
    detail: string;
  }>;
  phases: string[];
  safeguards: string[];
}

export interface JudicialStateItem {
  id: string;
  caseId: string;
  caseNumber: string; // Formato 23 dígitos estándar colombiano
  processTitle: string;
  authority: string;
  company?: string;
  stateNumber: string; // Ej: "Estado N° 084"
  stateDate: string; // YYYY-MM-DD
  postingTime: string; // "08:00 AM"
  actType: string; // Auto admisorio, Traslado de excepciones, etc.
  notebook: string; // Ej: "C-01 Principal (Fls. 140-146)"
  summary: string;
  fullDecision?: string;
  termType: string; // "3 días hábiles", "5 días hábiles", etc.
  termDays: number;
  termStartDate: string;
  termEndDate: string;
  daysRemaining: number;
  urgency: 'critico' | 'urgente' | 'normal' | 'informativo';
  source: 'RAMA_JUDICIAL' | 'SAMAI' | 'TYBA';
  documentUrl?: string;
  isRead: boolean;
  starred?: boolean;
}
