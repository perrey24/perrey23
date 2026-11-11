import { 
  LegalCase, 
  LegalAction, 
  LegalDocumentRecord, 
  LegalDraft, 
  DashboardMetrics, 
  AICaseAnalysisRequest, 
  AICaseAnalysisResult,
  User,
  OfficialSource,
  AuditLogEntry,
  GovernanceOverview
} from '../types';

const API_BASE = '/api';

export const api = {
  // Autenticación & Sesión (RBAC)
  login: async (email: string, password: string): Promise<{ user: User; csrfToken: string; demoMode: boolean }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Credenciales inválidas');
    }
    return res.json();
  },

  logout: async (): Promise<{ ok: boolean }> => {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al cerrar sesión');
    return res.json();
  },

  getSession: async (): Promise<{ authenticated: boolean; user?: User; csrfToken?: string; demoMode?: boolean }> => {
    const res = await fetch(`${API_BASE}/session`, { credentials: 'include' });
    if (!res.ok) return { authenticated: false };
    return res.json();
  },

  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al consultar usuarios');
    return res.json();
  },

  // Gobernanza y Fuentes Oficiales
  getGovernance: async (): Promise<GovernanceOverview> => {
    const res = await fetch(`${API_BASE}/governance`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al consultar gobernanza');
    return res.json();
  },

  getSources: async (params?: { area?: string; status?: string }): Promise<OfficialSource[]> => {
    const query = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    const res = await fetch(`${API_BASE}/sources${query}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al consultar fuentes jurídicas');
    const data = await res.json();
    return data.sources || [];
  },

  createSource: async (sourceData: Partial<OfficialSource>): Promise<OfficialSource> => {
    const res = await fetch(`${API_BASE}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sourceData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al registrar fuente oficial');
    }
    return res.json();
  },

  verifySource: async (id: string): Promise<OfficialSource> => {
    const res = await fetch(`${API_BASE}/sources/${id}/verify`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al verificar fuente');
    }
    return res.json();
  },

  getAuditLogs: async (limit = 50): Promise<AuditLogEntry[]> => {
    const res = await fetch(`${API_BASE}/audit?limit=${limit}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al consultar auditoría');
    return res.json();
  },

  // Métricas del Dashboard
  getMetrics: async (): Promise<DashboardMetrics> => {
    const res = await fetch(`${API_BASE}/metrics`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al cargar indicadores');
    return res.json();
  },

  // Casos Jurídicos
  getCases: async (params?: Record<string, string>): Promise<LegalCase[]> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}/cases${query}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener lista de casos');
    return res.json();
  },

  getCaseById: async (id: string): Promise<LegalCase> => {
    const res = await fetch(`${API_BASE}/cases/${id}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener expediente');
    return res.json();
  },

  createCase: async (caseData: Partial<LegalCase>): Promise<LegalCase> => {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(caseData)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al registrar el expediente');
    }
    return res.json();
  },

  updateCase: async (id: string, updates: Partial<LegalCase>): Promise<LegalCase> => {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Error al actualizar el expediente');
    return res.json();
  },

  deleteCase: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/cases/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al eliminar el expediente');
    return res.json();
  },

  // Actuaciones y Calendario
  getActions: async (params?: Record<string, string>): Promise<LegalAction[]> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}/actions${query}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al obtener actuaciones');
    return res.json();
  },

  createAction: async (actionData: Partial<LegalAction>): Promise<LegalAction> => {
    const res = await fetch(`${API_BASE}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(actionData)
    });
    if (!res.ok) throw new Error('Error al registrar actuación');
    return res.json();
  },

  updateAction: async (id: string, updates: Partial<LegalAction>): Promise<LegalAction> => {
    const res = await fetch(`${API_BASE}/actions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Error al actualizar actuación');
    return res.json();
  },

  toggleAction: async (id: string): Promise<LegalAction> => {
    const res = await fetch(`${API_BASE}/actions/${id}/toggle`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al actualizar estado');
    return res.json();
  },

  deleteAction: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/actions/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al eliminar actuación');
    return res.json();
  },

  getTermsGuide: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/terms/guide`, { credentials: 'include' });
    if (!res.ok) return [];
    return res.json();
  },

  // Documentos
  getDocuments: async (caseId?: string, search?: string): Promise<LegalDocumentRecord[]> => {
    const params: Record<string, string> = {};
    if (caseId) params.caseId = caseId;
    if (search) params.search = search;
    const query = Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE}/documents${query}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al consultar documentos');
    return res.json();
  },

  uploadDocument: async (formData: FormData): Promise<LegalDocumentRecord> => {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error al subir documento');
    }
    return res.json();
  },

  deleteDocument: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al eliminar documento');
    return res.json();
  },

  // Borradores
  generateDraft: async (params: any): Promise<{ title: string; content: string; disclaimer: string }> => {
    const res = await fetch(`${API_BASE}/drafts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Error al generar borrador');
    return res.json();
  },

  getDrafts: async (caseId?: string): Promise<LegalDraft[]> => {
    const query = caseId ? `?caseId=${caseId}` : '';
    const res = await fetch(`${API_BASE}/drafts${query}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Error al consultar borradores');
    return res.json();
  },

  saveDraft: async (draftData: Partial<LegalDraft>): Promise<LegalDraft> => {
    const res = await fetch(`${API_BASE}/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(draftData)
    });
    if (!res.ok) throw new Error('Error al guardar borrador');
    return res.json();
  },

  deleteDraft: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/drafts/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al eliminar borrador');
    return res.json();
  },

  // Asistente Jurídico IA
  analyzeFacts: async (req: AICaseAnalysisRequest): Promise<AICaseAnalysisResult> => {
    const res = await fetch(`${API_BASE}/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(req)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Error en análisis con IA');
    }
    return res.json();
  },

  chatAi: async (messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>, caseId?: string): Promise<{
    reply: string;
    isAiMockMode: boolean;
    modelUsed: string;
    disclaimer: string;
    piiMinimized?: boolean;
  }> => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ messages, caseId })
    });
    if (!res.ok) throw new Error('Error en la comunicación con el asistente');
    return res.json();
  },

  // Reset base de datos a seed
  resetDatabase: async (): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/db/reset`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Error al reiniciar base de datos');
    return res.json();
  }
};
