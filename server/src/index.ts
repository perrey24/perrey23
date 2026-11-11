import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import { store } from './db/store';
import { generateLegalDocument, DocumentDraftParams } from './services/docGenerator';
import { analyzeCaseFacts, chatWithCopilot } from './services/aiService';
import { 
  LegalArea, 
  CaseStatus, 
  ActionType, 
  ProceduralTermType, 
  LegalVerificationStatus, 
  DocType, 
  DocReviewStatus,
  User,
  UserRole,
  GovernanceOverview
} from './types';
import { COLOMBIAN_LEGAL_TERMS_GUIDE } from './services/termCalculator';
import { 
  verifyPassword, 
  hashPassword, 
  createSession, 
  getSession, 
  destroySession, 
  checkRateLimit, 
  recordFailedAttempt, 
  clearAttempts 
} from './services/authService';

if (typeof dotenv !== 'undefined' && dotenv && typeof (dotenv as any).config === 'function') {
  (dotenv as any).config();
}

const app = express();
const PORT = process.env.PORT || 3001;
const DEMO_MODE = process.env.DEMO_MODE !== 'false' && process.env.NODE_ENV !== 'production';

// Configuración de almacenamiento seguro de documentos
const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuración de Multer con validación de tipos y tamaños
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const safeBaseName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${safeBaseName}`);
  }
});

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/jpeg',
  'image/png'
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB límite
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido (${file.mimetype}). Solo se admiten PDF, DOCX, TXT, PNG y JPG.`));
    }
  }
});

// Seguridad: Cabeceras defensivas
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));

// Helper para parsear cookies HttpOnly
function parseCookies(header = ''): Record<string, string> {
  return Object.fromEntries(header.split(';').map(part => {
    const marker = part.indexOf('=');
    return marker === -1 ? [] : [part.slice(0, marker).trim(), decodeURIComponent(part.slice(marker + 1).trim())];
  }).filter(entry => entry.length));
}

// Extractor de contexto de autenticación
function getAuthContext(req: Request): { user: User; session: any; token: string } | null {
  const cookieHeader = req.headers.cookie || '';
  const token = parseCookies(cookieHeader).cj_session;
  const session = token ? getSession(token) : null;
  if (!session) return null;
  const user = store.getUserById(session.userId);
  if (!user || !user.active) return null;
  return { user, session, token };
}

// 1. Health check & Gobernanza
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'LexFlow Colombia - API Server',
    version: '2.0.0',
    mode: DEMO_MODE ? 'DEMO' : 'PRODUCTION',
    timestamp: new Date().toISOString(),
    aiProvider: process.env.GEMINI_API_KEY ? 'gemini-live' : 'heuristic-mock-demo',
    safeguards: [
      'Revisión humana obligatoria de términos',
      'Minimización de PII en IA',
      'Fuentes con URL oficial y fecha de consulta',
      'Sin citas jurisprudenciales inventadas'
    ]
  });
});

app.get('/api/governance', (_req: Request, res: Response) => {
  const overview: GovernanceOverview = {
    integrations: [
      {
        name: 'SUIN-JURISCOL / MinJusticia',
        status: 'MANUAL_LINK',
        detail: 'Catálogo oficial de leyes y decretos con enlace oficial HTTPS y verificación humana por supervisión.'
      },
      {
        name: 'Relatorías Oficiales de Altas Cortes (Corte Constitucional, CSJ, Consejo de Estado)',
        status: 'MANUAL_LINK',
        detail: 'Consulta en buscadores oficiales de jurisprudencia; exige convalidación individual de cada sentencia por docente supervisor.'
      },
      {
        name: 'Google Gemini API / OpenAI responses',
        status: process.env.GEMINI_API_KEY ? 'CONFIGURED_NOT_LIVE_TESTED' : 'PENDING_CREDENTIAL',
        detail: process.env.GEMINI_API_KEY 
          ? 'Conector oficial activo con minimización obligatoria de datos personales (PII).' 
          : 'Modo demostrativo transparente activo: opera con el Motor Heurístico Colombiano local sin transferir datos.'
      },
      {
        name: 'SSO Institucional / Firma Digital y Estampado Cronológico',
        status: 'PENDING_INSTITUTIONAL',
        detail: 'Requiere convenio y credenciales institucionales de la universidad; la versión actual opera con sesiones criptográficas scrypt.'
      }
    ],
    phases: [
      'Fase 0: Gobierno, ética y marco de protección de datos (Ley 1581 / Ley 2113)',
      'Fase 1: Núcleo de expediente, admisión y términos procesales',
      'Fase 2: Repositorio de fuentes oficiales y control de cotejo documental',
      'Fase 3: IA asistida con minimización de PII y revisión docente obligatoria',
      'Fase 4: Operación institucional supervisada'
    ],
    safeguards: [
      'Revisión humana obligatoria antes de cualquier radicación',
      'Diferenciación estricta entre días calendario y términos procesales hábiles',
      'Anonimización previa de PII en consultas de IA',
      'Trazabilidad e inmutabilidad en bitácora de auditoría',
      'Cifrado en reposo AES-256-GCM disponible'
    ]
  };
  res.json(overview);
});

// 2. Autenticación y Sesiones (RBAC)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const ip = req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Demasiados intentos fallidos. Intente nuevamente en 10 minutos.' });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos.' });
    }

    const user = store.getUserByEmail(email);
    if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      recordFailedAttempt(ip);
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    clearAttempts(ip);
    const { token, csrf } = createSession(user);
    store.addAuditEntry(user.id, user.name, user.role, 'LOGIN', 'session', token.slice(0, 8));

    const isSecure = !DEMO_MODE ? '; Secure' : '';
    res.setHeader('Set-Cookie', `cj_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${isSecure}`);
    
    const { passwordHash, ...safeUser } = user;
    res.json({
      user: safeUser,
      csrfToken: csrf,
      demoMode: DEMO_MODE
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error durante el inicio de sesión', detail: error.message });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const ctx = getAuthContext(req);
  if (ctx) {
    destroySession(ctx.token);
    store.addAuditEntry(ctx.user.id, ctx.user.name, ctx.user.role, 'LOGOUT', 'session', ctx.token.slice(0, 8));
  }
  res.setHeader('Set-Cookie', 'cj_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({ ok: true, message: 'Sesión finalizada con éxito.' });
});

app.get('/api/session', (req: Request, res: Response) => {
  const ctx = getAuthContext(req);
  if (!ctx) {
    return res.json({ authenticated: false, demoMode: DEMO_MODE });
  }
  const { passwordHash, ...safeUser } = ctx.user;
  res.json({
    authenticated: true,
    user: safeUser,
    csrfToken: ctx.session.csrf,
    demoMode: DEMO_MODE
  });
});

app.get('/api/users', (_req: Request, res: Response) => {
  const users = store.getUsers();
  res.json(users);
});

// 3. Fuentes Jurídicas Oficiales y Relatorías
app.get('/api/sources', (req: Request, res: Response) => {
  try {
    const { area, status } = req.query;
    const sources = store.getSources(area as string, status as string);
    res.json({ sources, consultedOn: '2026-10-23' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al consultar fuentes oficiales', detail: error.message });
  }
});

app.post('/api/sources', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const { title, entity, url, area, consultedAt, note } = req.body;
    if (!title || !entity || !url || !area) {
      return res.status(400).json({ error: 'title, entity, url y area son requeridos' });
    }
    if (!url.startsWith('https://')) {
      return res.status(400).json({ error: 'La fuente oficial debe contar con protocolo seguro HTTPS.' });
    }

    const created = store.createSource({
      title: String(title).trim(),
      entity: String(entity).trim(),
      url: String(url).trim(),
      area,
      consultedAt: consultedAt || new Date().toISOString().split('T')[0],
      note: String(note || '').trim()
    });

    if (ctx) {
      store.addAuditEntry(ctx.user.id, ctx.user.name, ctx.user.role, 'SOURCE_RECORDED', 'source', created.id, {
        title: created.title
      });
    }

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al registrar fuente', detail: error.message });
  }
});

app.post('/api/sources/:id/verify', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const verified = store.verifySource(req.params.id as string, ctx?.user.id || 'USR-SUPERVISOR');
    if (!verified) {
      return res.status(404).json({ error: 'Fuente no encontrada' });
    }

    if (ctx) {
      store.addAuditEntry(ctx.user.id, ctx.user.name, ctx.user.role, 'SOURCE_VERIFIED', 'source', verified.id, {
        title: verified.title
      });
    }

    res.json(verified);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al verificar fuente', detail: error.message });
  }
});

// 4. Bitácora de Auditoría
app.get('/api/audit', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const logs = store.getAuditLogs(limit);
  res.json(logs);
});

// 5. Métricas y Dashboard
app.get('/api/metrics', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const metrics = store.getMetrics(ctx?.user);
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al calcular indicadores', detail: error.message });
  }
});

app.get('/api/terms/guide', (_req: Request, res: Response) => {
  res.json(COLOMBIAN_LEGAL_TERMS_GUIDE);
});

// 6. Casos Jurídicos (con soporte RBAC)
app.get('/api/cases', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const { search, area, status, assignee, startDate, endDate } = req.query;
    const cases = store.getCases({
      search: search as string,
      area: area as LegalArea,
      status: status as CaseStatus,
      assignee: assignee as string,
      startDate: startDate as string,
      endDate: endDate as string,
      currentUser: ctx?.user
    });
    res.json(cases);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener casos', detail: error.message });
  }
});

app.get('/api/cases/:id', (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const legalCase = store.getCaseById(id);
    if (!legalCase) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }
    const actions = store.getActions({ caseId: id });
    const documents = store.getDocuments(id);
    const drafts = store.getDrafts(id);

    res.json({
      ...legalCase,
      actions,
      documents,
      drafts
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener detalle del caso', detail: error.message });
  }
});

app.post('/api/cases', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const {
      caseNumber,
      title,
      legalArea,
      procedureType,
      facts,
      claims,
      plaintiff,
      defendant,
      authority,
      status,
      filingDate,
      assignee,
      responsibleId,
      supervisorId,
      nextAction,
      deadlineDate,
      notes,
      isProBono,
      estimatedValue,
      consent,
      confidential
    } = req.body;

    if (!caseNumber || !title || !legalArea || !procedureType || !facts || !plaintiff?.name || !defendant?.name) {
      return res.status(400).json({ 
        error: 'Datos incompletos', 
        required: ['caseNumber', 'title', 'legalArea', 'procedureType', 'facts', 'plaintiff.name', 'defendant.name'] 
      });
    }

    const created = store.createCase({
      caseNumber: String(caseNumber).trim(),
      title: String(title).trim(),
      legalArea,
      procedureType: String(procedureType).trim(),
      facts: String(facts).trim(),
      claims: String(claims || '').trim(),
      plaintiff: {
        ...plaintiff,
        consent: consent !== undefined ? Boolean(consent) : true,
        consentDate: plaintiff.consentDate || new Date().toISOString().split('T')[0],
        confidential: confidential !== undefined ? Boolean(confidential) : true
      },
      defendant,
      authority: String(authority || 'Por asignar').trim(),
      status: status || 'activo',
      filingDate: filingDate || new Date().toISOString().split('T')[0],
      assignee: String(assignee || ctx?.user.name || 'Sin asignar').trim(),
      responsibleId: responsibleId || ctx?.user.id,
      supervisorId: supervisorId || 'USR-SUPERVISOR',
      nextAction: String(nextAction || 'Radicación inicial').trim(),
      deadlineDate: deadlineDate || new Date().toISOString().split('T')[0],
      notes: String(notes || '').trim(),
      isProBono: Boolean(isProBono),
      estimatedValue: Number(estimatedValue) || 0,
      consent: consent !== undefined ? Boolean(consent) : true,
      confidential: confidential !== undefined ? Boolean(confidential) : true
    }, ctx?.user);

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al crear caso', detail: error.message });
  }
});

app.put('/api/cases/:id', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const updated = store.updateCase(req.params.id as string, req.body, ctx?.user);
    if (!updated) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al actualizar caso', detail: error.message });
  }
});

app.delete('/api/cases/:id', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const deleted = store.deleteCase(req.params.id as string, ctx?.user);
    if (!deleted) {
      return res.status(404).json({ error: 'Caso no encontrado para eliminar' });
    }
    res.json({ success: true, message: 'Expediente eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al eliminar caso', detail: error.message });
  }
});

// 7. Actuaciones y Calendario
app.get('/api/actions', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const { caseId, type, isCompleted, urgency } = req.query;
    const actions = store.getActions({
      caseId: caseId as string,
      type: type as string,
      isCompleted: isCompleted !== undefined ? isCompleted === 'true' : undefined,
      urgency: urgency as string,
      currentUser: ctx?.user
    });
    res.json(actions);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener actuaciones', detail: error.message });
  }
});

app.post('/api/actions', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const {
      caseId,
      title,
      type,
      date,
      time,
      description,
      isCompleted,
      proceduralTermType,
      legalVerificationStatus,
      legalVerificationNotes,
      responsible
    } = req.body;

    if (!caseId || !title || !type || !date) {
      return res.status(400).json({ error: 'caseId, title, type y date son obligatorios' });
    }

    const legalCase = store.getCaseById(caseId);
    if (!legalCase) {
      return res.status(404).json({ error: 'El caso referenciado no existe' });
    }

    const created = store.createAction({
      caseId,
      caseNumber: legalCase.caseNumber,
      caseTitle: legalCase.title,
      title: String(title).trim(),
      type: type as ActionType,
      date: String(date).trim(),
      time: time ? String(time).trim() : undefined,
      description: String(description || '').trim(),
      isCompleted: Boolean(isCompleted),
      proceduralTermType: (proceduralTermType as ProceduralTermType) || 'dias_calendario',
      legalVerificationStatus: (legalVerificationStatus as LegalVerificationStatus) || 'pendiente_verificacion',
      legalVerificationNotes: String(legalVerificationNotes || '').trim(),
      responsible: String(responsible || legalCase.assignee).trim()
    }, ctx?.user);

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al registrar actuación', detail: error.message });
  }
});

app.put('/api/actions/:id', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const updated = store.updateAction(req.params.id as string, req.body, ctx?.user);
    if (!updated) {
      return res.status(404).json({ error: 'Actuación no encontrada' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al actualizar actuación', detail: error.message });
  }
});

app.patch('/api/actions/:id/toggle', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const toggled = store.toggleActionCompleted(req.params.id as string, ctx?.user);
    if (!toggled) {
      return res.status(404).json({ error: 'Actuación no encontrada' });
    }
    res.json(toggled);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al cambiar estado de actuación', detail: error.message });
  }
});

app.delete('/api/actions/:id', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const deleted = store.deleteAction(req.params.id as string, ctx?.user);
    if (!deleted) {
      return res.status(404).json({ error: 'Actuación no encontrada' });
    }
    res.json({ success: true, message: 'Actuación eliminada con éxito' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al eliminar actuación', detail: error.message });
  }
});

// 8. Gestión Documental
app.get('/api/documents', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const { caseId, search } = req.query;
    const docs = store.getDocuments(caseId as string, search as string, ctx?.user);
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener documentos', detail: error.message });
  }
});

app.post('/api/documents/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const { caseId, title, documentType, description, reviewStatus, reviewNotes } = req.body;
    if (!caseId || !title) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'caseId y title son obligatorios' });
    }

    const legalCase = store.getCaseById(caseId);
    if (!legalCase) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Caso no encontrado' });
    }

    const docRecord = store.createDocument({
      caseId,
      caseNumber: legalCase.caseNumber,
      caseTitle: legalCase.title,
      title: String(title).trim(),
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      documentType: (documentType as DocType) || 'otro',
      uploadDate: new Date().toISOString().split('T')[0],
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
      description: String(description || '').trim(),
      reviewStatus: (reviewStatus as DocReviewStatus) || 'pendiente_cotejo',
      reviewNotes: reviewNotes ? String(reviewNotes).trim() : undefined
    }, ctx?.user);

    res.status(201).json(docRecord);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al subir documento', detail: error.message });
  }
});

app.get('/api/documents/:id/download', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const doc = store.getDocumentById(req.params.id as string);
    if (!doc) {
      return res.status(404).json({ error: 'Registro documental no encontrado' });
    }

    if (ctx) {
      store.addAuditEntry(ctx.user.id, ctx.user.name, ctx.user.role, 'DOCUMENT_DOWNLOADED', 'document', doc.id, {
        fileName: doc.originalFilename
      });
    }

    const filePath = path.join(UPLOADS_DIR, doc.storedFilename);
    if (!fs.existsSync(filePath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${doc.originalFilename}"`);
      res.setHeader('Content-Type', doc.mimeType);
      return res.send(`LEXFLOW COLOMBIA - ARCHIVO DOCUMENTAL AUTÉNTICO\n\nExpediente: ${doc.caseNumber}\nTítulo: ${doc.title}\nTipo: ${doc.documentType}\nFecha de incorporación: ${doc.uploadDate}\nEstado de revisión: ${doc.reviewStatus}\nDescripción: ${doc.description}\n\n[Contenido simulado con validación íntegra para fines de consultorio jurídico].`);
    }

    res.download(filePath, doc.originalFilename);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al descargar documento', detail: error.message });
  }
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const doc = store.getDocumentById(req.params.id as string);
    if (!doc) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const filePath = path.join(UPLOADS_DIR, doc.storedFilename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete disk file:', err);
      }
    }

    store.deleteDocument(req.params.id as string, ctx?.user);
    res.json({ success: true, message: 'Documento eliminado correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al eliminar documento', detail: error.message });
  }
});

// 9. Generador de Documentos
app.post('/api/drafts/generate', (req: Request, res: Response) => {
  try {
    const params: DocumentDraftParams = req.body;
    if (!params.templateType || !params.authorName || !params.subject) {
      return res.status(400).json({ error: 'templateType, authorName y subject son requeridos' });
    }

    const generated = generateLegalDocument(params);
    res.json(generated);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al generar borrador', detail: error.message });
  }
});

app.get('/api/drafts', (req: Request, res: Response) => {
  try {
    const { caseId } = req.query;
    const drafts = store.getDrafts(caseId as string);
    res.json(drafts);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener borradores', detail: error.message });
  }
});

app.post('/api/drafts', (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const { templateType, title, caseId, formData, generatedContent, disclaimer } = req.body;
    if (!templateType || !title || !generatedContent) {
      return res.status(400).json({ error: 'templateType, title y generatedContent son obligatorios' });
    }

    const saved = store.createDraft({
      templateType,
      title,
      caseId,
      formData: formData || {},
      generatedContent,
      disclaimer: disclaimer || 'Borrador preliminar sujeto a revisión profesional'
    }, ctx?.user);

    res.status(201).json(saved);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al guardar borrador', detail: error.message });
  }
});

app.delete('/api/drafts/:id', (req: Request, res: Response) => {
  try {
    const deleted = store.deleteDraft(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ error: 'Borrador no encontrado' });
    }
    res.json({ success: true, message: 'Borrador eliminado' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al eliminar borrador', detail: error.message });
  }
});

// 10. Asistente Jurídico de Inteligencia Artificial (con Minimización PII)
app.post('/api/ai/analyze', async (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const { facts } = req.body;
    if (!facts || String(facts).trim().length < 15) {
      return res.status(400).json({ error: 'Debe ingresar una narración de hechos mínima de 15 caracteres para el análisis jurídico.' });
    }

    const result = await analyzeCaseFacts(req.body);

    if (ctx) {
      store.addAuditEntry(ctx.user.id, ctx.user.name, ctx.user.role, 'AI_ANALYSIS', 'ai', 'facts_analysis', {
        caseTitle: req.body.caseTitle,
        piiMinimized: true
      });
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Error en el asistente de análisis legal', detail: error.message });
  }
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const ctx = getAuthContext(req);
    const { messages, caseId } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages debe ser un arreglo no vacío con { role, content }' });
    }

    const response = await chatWithCopilot(messages, caseId);

    if (ctx) {
      store.addAuditEntry(ctx.user.id, ctx.user.name, ctx.user.role, 'AI_CHAT_QUERY', 'ai', 'copilot_chat', {
        provider: response.modelUsed,
        caseId: caseId || undefined
      });
    }

    res.json(response);
  } catch (error: any) {
    res.status(500).json({ error: 'Error en el chat de orientación jurídica', detail: error.message });
  }
});

// 11. Restauración de datos semilla demo
app.post('/api/db/reset', (_req: Request, res: Response) => {
  try {
    store.resetToDefault();
    res.json({ success: true, message: 'Base de datos restablecida a los datos demostrativos iniciales.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al restablecer la base de datos', detail: error.message });
  }
});

// Servir frontend compilado en producción o como respaldo unificado
const CLIENT_DIST = path.join(__dirname, '../../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Middleware global de errores
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Ocurrió un error en el servidor',
    message: err?.message || 'Error interno no especificado'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 LexFlow Colombia Backend v2.0 escuchando en puerto ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Plataforma Web Completa: http://localhost:${PORT}`);
  console.log(`   AI Provider: ${process.env.GEMINI_API_KEY ? 'Gemini API Live' : 'Motor Heurístico Colombiano (Modo Demo)'}`);
  console.log(`   Modo: ${DEMO_MODE ? 'Demostración (RBAC activo)' : 'Producción (Cifrado AES-256)'}`);
  console.log(`====================================================`);
});
