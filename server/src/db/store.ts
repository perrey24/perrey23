import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'node:crypto';
import { 
  LegalCase, 
  LegalAction, 
  LegalDocumentRecord, 
  LegalDraft, 
  DashboardMetrics, 
  LegalArea, 
  CaseStatus,
  User,
  UserRole,
  OfficialSource,
  AuditLogEntry
} from '../types';
import { SEED_CASES, SEED_ACTIONS, SEED_DOCUMENTS, SEED_SOURCES, SEED_AUDIT } from './seedData';
import { calculateTermStatus } from '../services/termCalculator';

interface DatabaseSchema {
  cases: LegalCase[];
  actions: LegalAction[];
  documents: LegalDocumentRecord[];
  drafts: LegalDraft[];
  users: User[];
  sources: OfficialSource[];
  audit: AuditLogEntry[];
  lastUpdated: string;
}

function hashPasswordSync(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `${salt.toString('base64url')}:${derived.toString('base64url')}`;
}

export function defaultSeedUsers(): User[] {
  const hash = hashPasswordSync('Demo123!');
  return [
    {
      id: 'USR-DIRECTOR',
      name: 'Dra. Mercedes Carrascal',
      email: 'coordinacion@demo.local',
      role: 'DIRECTOR',
      roleName: 'Dirección y Coordinación',
      passwordHash: hash,
      active: true,
      createdAt: '2026-08-01T08:00:00Z'
    },
    {
      id: 'USR-SUPERVISOR',
      name: 'Dr. Alejandro Restrepo',
      email: 'supervision@demo.local',
      role: 'SUPERVISOR',
      roleName: 'Docente Supervisor/a',
      passwordHash: hash,
      active: true,
      createdAt: '2026-08-01T08:00:00Z'
    },
    {
      id: 'USR-STUDENT',
      name: 'Carlos Andrés Ruiz',
      email: 'estudiante@demo.local',
      role: 'STUDENT',
      roleName: 'Estudiante de Consultorio',
      passwordHash: hash,
      active: true,
      createdAt: '2026-08-15T09:00:00Z'
    },
    {
      id: 'USR-INTAKE',
      name: 'Mariana Duarte',
      email: 'recepcion@demo.local',
      role: 'INTAKE',
      roleName: 'Recepción y Admisión',
      passwordHash: hash,
      active: true,
      createdAt: '2026-08-15T09:00:00Z'
    }
  ];
}

export class JsonDataStore {
  private filePath: string;
  private data: DatabaseSchema;
  private encryptionKey: Buffer | null = null;

  constructor(dataDirectory: string = path.join(__dirname, '../../data')) {
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    this.filePath = path.join(dataDirectory, 'lexflow.db.json');

    // Comprobar clave de cifrado opcional AES-256-GCM
    const rawKey = process.env.DATA_ENCRYPTION_KEY;
    if (rawKey) {
      this.encryptionKey = /^[0-9a-f]{64}$/iu.test(rawKey) 
        ? Buffer.from(rawKey, 'hex') 
        : Buffer.from(rawKey, 'base64');
      if (this.encryptionKey.length !== 32) {
        console.warn('DATA_ENCRYPTION_KEY no tiene 32 bytes válidos, usando almacenamiento estándar.');
        this.encryptionKey = null;
      }
    }

    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(this.filePath)) {
      try {
        let content = fs.readFileSync(this.filePath, 'utf-8');
        if (this.encryptionKey && !content.trim().startsWith('{')) {
          // Desencriptar AES-256-GCM
          const packed = Buffer.from(content, 'base64');
          const iv = packed.subarray(0, 12);
          const tag = packed.subarray(12, 28);
          const encrypted = packed.subarray(28);
          const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
          decipher.setAuthTag(tag);
          content = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf-8');
        }
        const parsed = JSON.parse(content);
        if (parsed.cases && Array.isArray(parsed.cases)) {
          // Asegurar que las entidades añadidas existan
          if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
            parsed.users = defaultSeedUsers();
          }
          if (!parsed.sources || !Array.isArray(parsed.sources)) {
            parsed.sources = SEED_SOURCES;
          }
          if (!parsed.audit || !Array.isArray(parsed.audit)) {
            parsed.audit = SEED_AUDIT;
          }
          return parsed;
        }
      } catch (err) {
        console.error('Error reading database file, resetting to initial seed:', err);
      }
    }

    const initialData: DatabaseSchema = {
      cases: SEED_CASES,
      actions: SEED_ACTIONS,
      documents: SEED_DOCUMENTS,
      drafts: [],
      users: defaultSeedUsers(),
      sources: SEED_SOURCES,
      audit: SEED_AUDIT,
      lastUpdated: new Date().toISOString()
    };
    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema): void {
    let payload = JSON.stringify(data, null, 2);
    if (this.encryptionKey) {
      // Cifrado AES-256-GCM
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
      const encrypted = Buffer.concat([cipher.update(payload, 'utf-8'), cipher.final()]);
      const packed = Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
      payload = packed;
    }

    const tmpPath = `${this.filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, payload, 'utf-8');
    fs.renameSync(tmpPath, this.filePath);
  }

  private persist(): void {
    this.data.lastUpdated = new Date().toISOString();
    this.saveDataDirect(this.data);
  }

  public resetToDefault(): void {
    this.data = {
      cases: JSON.parse(JSON.stringify(SEED_CASES)),
      actions: JSON.parse(JSON.stringify(SEED_ACTIONS)),
      documents: JSON.parse(JSON.stringify(SEED_DOCUMENTS)),
      drafts: [],
      users: defaultSeedUsers(),
      sources: JSON.parse(JSON.stringify(SEED_SOURCES)),
      audit: JSON.parse(JSON.stringify(SEED_AUDIT)),
      lastUpdated: new Date().toISOString()
    };
    this.addAuditEntry('USR-DIRECTOR', 'Dra. Mercedes Carrascal', 'DIRECTOR', 'SEED_RESET', 'system', 'database', { reset: true });
    this.persist();
  }

  // --- Auditoría ---
  public addAuditEntry(
    actorId: string, 
    actorName: string, 
    actorRole: UserRole, 
    event: string, 
    entity: string, 
    entityId: string, 
    metadata?: Record<string, any>
  ): void {
    const entry: AuditLogEntry = {
      id: `AUD-${Date.now().toString(36)}-${randomBytes(4).toString('hex')}`,
      actorId,
      actorName,
      actorRole,
      event,
      entity,
      entityId,
      timestamp: new Date().toISOString(),
      metadata
    };
    this.data.audit.unshift(entry);
    if (this.data.audit.length > 5000) {
      this.data.audit = this.data.audit.slice(0, 5000);
    }
  }

  public getAuditLogs(limit: number = 50): AuditLogEntry[] {
    return this.data.audit.slice(0, limit);
  }

  // --- Usuarios y Roles ---
  public getUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...safe }) => safe as User);
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public createUser(userData: { name: string; email: string; role: UserRole; passwordHash: string }): User {
    const newUser: User = {
      id: `USR-${uuidv4().substring(0, 8).toUpperCase()}`,
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      role: userData.role,
      roleName: userData.role === 'DIRECTOR' ? 'Dirección y Coordinación'
        : userData.role === 'SUPERVISOR' ? 'Docente Supervisor/a'
        : userData.role === 'STUDENT' ? 'Estudiante de Consultorio'
        : 'Recepción y Admisión',
      passwordHash: userData.passwordHash,
      active: true,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.persist();
    const { passwordHash, ...safe } = newUser;
    return safe as User;
  }

  // --- Fuentes Oficiales ---
  public getSources(area?: string, status?: string): OfficialSource[] {
    let list = [...this.data.sources];
    if (area && area !== 'all') {
      list = list.filter(s => s.area === 'GENERAL' || s.area === area);
    }
    if (status && status !== 'all') {
      list = list.filter(s => s.status === status);
    }
    return list;
  }

  public getSourceById(id: string): OfficialSource | undefined {
    return this.data.sources.find(s => s.id === id);
  }

  public createSource(input: Omit<OfficialSource, 'id' | 'status' | 'verifiedAt' | 'verifiedBy'>): OfficialSource {
    const newSource: OfficialSource = {
      ...input,
      id: `SRC-${uuidv4().substring(0, 8).toUpperCase()}`,
      status: 'PENDING_REVIEW',
      verifiedAt: null,
      verifiedBy: null
    };
    this.data.sources.push(newSource);
    this.persist();
    return newSource;
  }

  public verifySource(id: string, supervisorId: string): OfficialSource | null {
    const source = this.data.sources.find(s => s.id === id);
    if (!source) return null;
    source.status = 'VERIFIED';
    source.verifiedAt = new Date().toISOString();
    source.verifiedBy = supervisorId;
    this.persist();
    return source;
  }

  // --- Casos Jurídicos ---
  public getCases(filters?: {
    search?: string;
    area?: LegalArea;
    status?: CaseStatus;
    assignee?: string;
    startDate?: string;
    endDate?: string;
    currentUser?: User;
  }): LegalCase[] {
    let result = [...this.data.cases];

    // Restricción RBAC para estudiantes: sólo ven sus casos asignados
    if (filters?.currentUser && filters.currentUser.role === 'STUDENT') {
      result = result.filter(c => c.responsibleId === filters.currentUser!.id);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(c => 
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.plaintiff.name.toLowerCase().includes(q) ||
        c.defendant.name.toLowerCase().includes(q) ||
        c.authority.toLowerCase().includes(q) ||
        c.facts.toLowerCase().includes(q) ||
        c.claims.toLowerCase().includes(q)
      );
    }

    if (filters?.area && filters.area !== 'all' as any) {
      result = result.filter(c => c.legalArea === filters.area);
    }

    if (filters?.status && filters.status !== 'all' as any) {
      result = result.filter(c => c.status === filters.status);
    }

    if (filters?.assignee) {
      result = result.filter(c => c.assignee.toLowerCase().includes(filters.assignee!.toLowerCase()));
    }

    if (filters?.startDate) {
      result = result.filter(c => c.filingDate >= filters.startDate!);
    }

    if (filters?.endDate) {
      result = result.filter(c => c.filingDate <= filters.endDate!);
    }

    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getCaseById(id: string): LegalCase | undefined {
    return this.data.cases.find(c => c.id === id);
  }

  public createCase(input: Omit<LegalCase, 'id' | 'createdAt' | 'updatedAt'>, actor?: User): LegalCase {
    const now = new Date().toISOString();
    const newCase: LegalCase = {
      ...input,
      id: `case-${uuidv4().substring(0, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.cases.push(newCase);
    if (actor) {
      this.addAuditEntry(actor.id, actor.name, actor.role, 'CASE_CREATED', 'case', newCase.id, {
        radicado: newCase.caseNumber,
        area: newCase.legalArea
      });
    }
    this.persist();
    return newCase;
  }

  public updateCase(id: string, updates: Partial<Omit<LegalCase, 'id' | 'createdAt'>>, actor?: User): LegalCase | null {
    const index = this.data.cases.findIndex(c => c.id === id);
    if (index === -1) return null;

    const existing = this.data.cases[index];
    const updated: LegalCase = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.cases[index] = updated;

    if (updates.caseNumber || updates.title) {
      this.data.actions.forEach(a => {
        if (a.caseId === id) {
          if (updates.caseNumber) a.caseNumber = updates.caseNumber;
          if (updates.title) a.caseTitle = updates.title;
        }
      });
      this.data.documents.forEach(d => {
        if (d.caseId === id) {
          if (updates.caseNumber) d.caseNumber = updates.caseNumber;
          if (updates.title) d.caseTitle = updates.title;
        }
      });
    }

    if (actor) {
      this.addAuditEntry(actor.id, actor.name, actor.role, 'CASE_UPDATED', 'case', id, { updates: Object.keys(updates) });
    }

    this.persist();
    return updated;
  }

  public deleteCase(id: string, actor?: User): boolean {
    const prevCount = this.data.cases.length;
    this.data.cases = this.data.cases.filter(c => c.id !== id);
    if (this.data.cases.length < prevCount) {
      this.data.actions = this.data.actions.filter(a => a.caseId !== id);
      if (actor) {
        this.addAuditEntry(actor.id, actor.name, actor.role, 'CASE_DELETED', 'case', id);
      }
      this.persist();
      return true;
    }
    return false;
  }

  // --- Actuaciones Procesales y Calendario ---
  public getActions(filters?: {
    caseId?: string;
    type?: string;
    isCompleted?: boolean;
    urgency?: string;
    currentUser?: User;
  }): LegalAction[] {
    let actions = this.data.actions.map(act => {
      const calc = calculateTermStatus(
        act.date,
        act.isCompleted,
        act.proceduralTermType,
        act.legalVerificationStatus
      );
      return {
        ...act,
        daysDiff: calc.daysDiff,
        urgency: calc.urgency,
        legalVerificationNotes: act.legalVerificationNotes || calc.legalNote
      };
    });

    if (filters?.currentUser && filters.currentUser.role === 'STUDENT') {
      const allowedCaseIds = new Set(this.data.cases.filter(c => c.responsibleId === filters.currentUser!.id).map(c => c.id));
      actions = actions.filter(a => allowedCaseIds.has(a.caseId));
    }

    if (filters?.caseId) {
      actions = actions.filter(a => a.caseId === filters.caseId);
    }
    if (filters?.type && filters.type !== 'all') {
      actions = actions.filter(a => a.type === filters.type);
    }
    if (typeof filters?.isCompleted === 'boolean') {
      actions = actions.filter(a => a.isCompleted === filters.isCompleted);
    }
    if (filters?.urgency) {
      actions = actions.filter(a => a.urgency === filters.urgency);
    }

    return actions.sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  public getActionById(id: string): LegalAction | undefined {
    const act = this.data.actions.find(a => a.id === id);
    if (!act) return undefined;
    const calc = calculateTermStatus(
      act.date,
      act.isCompleted,
      act.proceduralTermType,
      act.legalVerificationStatus
    );
    return {
      ...act,
      daysDiff: calc.daysDiff,
      urgency: calc.urgency
    };
  }

  public createAction(input: Omit<LegalAction, 'id' | 'createdAt' | 'updatedAt' | 'daysDiff' | 'urgency'>, actor?: User): LegalAction {
    const now = new Date().toISOString();
    const newAct: LegalAction = {
      ...input,
      id: `act-${uuidv4().substring(0, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.actions.push(newAct);

    const c = this.getCaseById(input.caseId);
    if (c) {
      c.nextAction = input.title;
      c.deadlineDate = input.date;
      c.updatedAt = now;
    }

    if (actor) {
      this.addAuditEntry(actor.id, actor.name, actor.role, 'ACTION_RECORDED', 'case', input.caseId, {
        title: newAct.title,
        dueDate: newAct.date
      });
    }

    this.persist();

    const calc = calculateTermStatus(
      newAct.date,
      newAct.isCompleted,
      newAct.proceduralTermType,
      newAct.legalVerificationStatus
    );
    return {
      ...newAct,
      daysDiff: calc.daysDiff,
      urgency: calc.urgency
    };
  }

  public updateAction(id: string, updates: Partial<Omit<LegalAction, 'id' | 'createdAt'>>, actor?: User): LegalAction | null {
    const index = this.data.actions.findIndex(a => a.id === id);
    if (index === -1) return null;

    const existing = this.data.actions[index];
    const updated: LegalAction = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.actions[index] = updated;

    if (actor) {
      this.addAuditEntry(actor.id, actor.name, actor.role, 'ACTION_UPDATED', 'action', id);
    }

    this.persist();

    const calc = calculateTermStatus(
      updated.date,
      updated.isCompleted,
      updated.proceduralTermType,
      updated.legalVerificationStatus
    );
    return {
      ...updated,
      daysDiff: calc.daysDiff,
      urgency: calc.urgency
    };
  }

  public toggleActionCompleted(id: string, actor?: User): LegalAction | null {
    const act = this.data.actions.find(a => a.id === id);
    if (!act) return null;

    act.isCompleted = !act.isCompleted;
    act.completedAt = act.isCompleted ? new Date().toISOString() : undefined;
    act.updatedAt = new Date().toISOString();

    if (actor) {
      this.addAuditEntry(actor.id, actor.name, actor.role, act.isCompleted ? 'ACTION_COMPLETED' : 'ACTION_REOPENED', 'action', id);
    }

    this.persist();

    const calc = calculateTermStatus(
      act.date,
      act.isCompleted,
      act.proceduralTermType,
      act.legalVerificationStatus
    );
    return {
      ...act,
      daysDiff: calc.daysDiff,
      urgency: calc.urgency
    };
  }

  public deleteAction(id: string, actor?: User): boolean {
    const prevCount = this.data.actions.length;
    this.data.actions = this.data.actions.filter(a => a.id !== id);
    if (this.data.actions.length < prevCount) {
      if (actor) {
        this.addAuditEntry(actor.id, actor.name, actor.role, 'ACTION_DELETED', 'action', id);
      }
      this.persist();
      return true;
    }
    return false;
  }

  // --- Gestión Documental ---
  public getDocuments(caseId?: string, search?: string, currentUser?: User): LegalDocumentRecord[] {
    let docs = [...this.data.documents];
    if (currentUser && currentUser.role === 'STUDENT') {
      const allowedCaseIds = new Set(this.data.cases.filter(c => c.responsibleId === currentUser.id).map(c => c.id));
      docs = docs.filter(d => allowedCaseIds.has(d.caseId));
    }
    if (caseId) {
      docs = docs.filter(d => d.caseId === caseId);
    }
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d => 
        d.title.toLowerCase().includes(q) ||
        d.originalFilename.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.caseNumber.toLowerCase().includes(q)
      );
    }
    return docs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  public getDocumentById(id: string): LegalDocumentRecord | undefined {
    return this.data.documents.find(d => d.id === id);
  }

  public createDocument(input: Omit<LegalDocumentRecord, 'id'>, actor?: User): LegalDocumentRecord {
    const newDoc: LegalDocumentRecord = {
      ...input,
      id: `doc-${uuidv4().substring(0, 8)}`,
      uploadedBy: actor?.id
    };
    this.data.documents.push(newDoc);
    if (actor) {
      this.addAuditEntry(actor.id, actor.name, actor.role, 'DOCUMENT_UPLOADED', 'document', newDoc.id, {
        fileName: newDoc.originalFilename,
        caseId: newDoc.caseId
      });
    }
    this.persist();
    return newDoc;
  }

  public deleteDocument(id: string, actor?: User): boolean {
    const prevCount = this.data.documents.length;
    this.data.documents = this.data.documents.filter(d => d.id !== id);
    if (this.data.documents.length < prevCount) {
      if (actor) {
        this.addAuditEntry(actor.id, actor.name, actor.role, 'DOCUMENT_DELETED', 'document', id);
      }
      this.persist();
      return true;
    }
    return false;
  }

  // --- Borradores Jurídicos ---
  public getDrafts(caseId?: string): LegalDraft[] {
    let drafts = [...this.data.drafts];
    if (caseId) {
      drafts = drafts.filter(d => d.caseId === caseId);
    }
    return drafts.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public getDraftById(id: string): LegalDraft | undefined {
    return this.data.drafts.find(d => d.id === id);
  }

  public createDraft(input: Omit<LegalDraft, 'id' | 'createdAt' | 'updatedAt'>, actor?: User): LegalDraft {
    const now = new Date().toISOString();
    const newDraft: LegalDraft = {
      ...input,
      id: `draft-${uuidv4().substring(0, 8)}`,
      createdAt: now,
      updatedAt: now
    };
    this.data.drafts.push(newDraft);
    if (actor) {
      this.addAuditEntry(actor.id, actor.name, actor.role, 'DRAFT_GENERATED', 'draft', newDraft.id, {
        templateType: newDraft.templateType
      });
    }
    this.persist();
    return newDraft;
  }

  public updateDraft(id: string, updates: Partial<Omit<LegalDraft, 'id' | 'createdAt'>>): LegalDraft | null {
    const index = this.data.drafts.findIndex(d => d.id === id);
    if (index === -1) return null;
    this.data.drafts[index] = {
      ...this.data.drafts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.drafts[index];
  }

  public deleteDraft(id: string): boolean {
    const prevCount = this.data.drafts.length;
    this.data.drafts = this.data.drafts.filter(d => d.id !== id);
    if (this.data.drafts.length < prevCount) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Métricas y Dashboard ---
  public getMetrics(currentUser?: User): DashboardMetrics {
    const cases = this.getCases({ currentUser });
    const actions = this.getActions({ currentUser });

    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === 'activo').length;
    const inProgressCases = cases.filter(c => c.status === 'en_tramite').length;
    const suspendedCases = cases.filter(c => c.status === 'suspendido').length;
    const inRulingCases = cases.filter(c => c.status === 'en_fallo').length;
    const closedCases = cases.filter(c => c.status === 'cerrado').length;

    const pendingActions = actions.filter(a => !a.isCompleted);
    const urgentActions = pendingActions.filter(a => 
      a.urgency === 'vencido' || a.urgency === 'hoy' || a.urgency === 'critico'
    );
    const upcomingDeadlinesCount = urgentActions.length;
    const pendingActionsCount = pendingActions.length;
    const completedActionsCount = actions.filter(a => a.isCompleted).length;

    const pendingSourcesCount = this.data.sources.filter(s => s.status === 'PENDING_REVIEW').length;
    const verifiedSourcesCount = this.data.sources.filter(s => s.status === 'VERIFIED').length;

    const areaLabels: Record<string, string> = {
      laboral: 'Laboral y Seguridad Social',
      civil: 'Civil y Contratos',
      penal: 'Penal y Garantías',
      administrativo: 'Administrativo y Contencioso',
      constitucional: 'Constitucional y Tutelas',
      familia: 'Familia e Infancia',
      comercial: 'Comercial y Societario',
      tributario: 'Tributario y Aduanero'
    };

    const areaCounts: Record<string, number> = {};
    Object.keys(areaLabels).forEach(k => { areaCounts[k] = 0; });
    cases.forEach(c => {
      if (c.legalArea !== 'GENERAL') {
        areaCounts[c.legalArea] = (areaCounts[c.legalArea] || 0) + 1;
      }
    });

    const casesByArea = Object.entries(areaCounts).map(([area, count]) => ({
      area: area as LegalArea,
      count,
      label: areaLabels[area] || area
    }));

    const assigneeMap: Record<string, { activeCount: number; totalCount: number }> = {};
    cases.forEach(c => {
      if (!assigneeMap[c.assignee]) {
        assigneeMap[c.assignee] = { activeCount: 0, totalCount: 0 };
      }
      assigneeMap[c.assignee].totalCount += 1;
      if (c.status !== 'cerrado') {
        assigneeMap[c.assignee].activeCount += 1;
      }
    });

    const workloadByAssignee = Object.entries(assigneeMap).map(([assignee, counts]) => ({
      assignee,
      activeCount: counts.activeCount,
      totalCount: counts.totalCount
    }));

    const months = ['May 2026', 'Jun 2026', 'Jul 2026', 'Ago 2026', 'Sep 2026', 'Oct 2026'];
    const monthlyEvolution = months.map(m => {
      let opened = 0;
      let closed = 0;
      cases.forEach(c => {
        const d = new Date(c.filingDate);
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const caseMonth = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        if (caseMonth === m) opened += 1;
        if (c.status === 'cerrado') {
          const u = new Date(c.updatedAt);
          const closeMonth = `${monthNames[u.getMonth()]} ${u.getFullYear()}`;
          if (closeMonth === m) closed += 1;
        }
      });
      return { month: m, opened, closed };
    });

    return {
      totalCases,
      activeCases,
      inProgressCases,
      suspendedCases,
      inRulingCases,
      closedCases,
      upcomingDeadlinesCount,
      pendingActionsCount,
      completedActionsCount,
      pendingSourcesCount,
      verifiedSourcesCount,
      casesByArea,
      workloadByAssignee,
      monthlyEvolution,
      urgentActions,
      recentAudit: this.data.audit.slice(0, 10)
    };
  }
}

export const store = new JsonDataStore();
