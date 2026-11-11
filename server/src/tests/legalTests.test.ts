import { describe, it, expect, beforeEach } from 'vitest';
import { calculateTermStatus } from '../services/termCalculator';
import { isColombianJudicialNonWorkingDay, addBusinessDays, getColombianHolidays } from '../services/colombianHolidays';
import { generateLegalDocument } from '../services/docGenerator';
import { JsonDataStore } from '../db/store';
import { analyzeCaseFacts, minimizePii } from '../services/aiService';
import { hashPassword, verifyPassword, createSession, getSession, checkRateLimit, recordFailedAttempt, clearAttempts } from '../services/authService';
import { User } from '../types';
import path from 'path';
import fs from 'fs';

describe('LexFlow Colombia - Pruebas de Lógica Jurídica y Términos Procesales', () => {
  it('Debe identificar festivos y fines de semana colombianos (Ley Emiliani)', () => {
    // 2026-07-20 (Día de la Independencia) es festivo
    const holidayDate = new Date(2026, 6, 20); // Mes 6 = Julio
    expect(isColombianJudicialNonWorkingDay(holidayDate)).toBe(true);

    // Un sábado o domingo cualquiera es inhábil judicial
    const sunday = new Date(2026, 9, 18); // Octubre 18, 2026 = Domingo
    expect(isColombianJudicialNonWorkingDay(sunday)).toBe(true);

    // Un martes laboral ordinario no festivo es hábil
    const regularTuesday = new Date(2026, 9, 20); // Octubre 20, 2026 = Martes
    expect(isColombianJudicialNonWorkingDay(regularTuesday)).toBe(false);
  });

  it('Debe calcular términos procesales y advertir cuando están pendientes de verificación jurídica', () => {
    const today = new Date(2026, 9, 19); // 2026-10-19

    // Caso 1: Término procesal con fecha en 3 días (urgente)
    const res = calculateTermStatus('2026-10-22', false, 'termino_procesal', 'pendiente_verificacion', today);
    expect(res.daysDiff).toBe(3);
    expect(res.urgency).toBe('critico');
    expect(res.isProceduralTerm).toBe(true);
    expect(res.verificationStatus).toBe('pendiente_verificacion');
    expect(res.legalNote).toContain('Pendiente de verificación jurídica');

    // Caso 2: Contador de días calendario corridos
    const calRes = calculateTermStatus('2026-10-25', false, 'dias_calendario', 'verificado', today);
    expect(calRes.isProceduralTerm).toBe(false);
    expect(calRes.legalNote).toContain('Contador de días calendario');

    // Caso 3: Actuación ya cumplida
    const doneRes = calculateTermStatus('2026-10-15', true, 'termino_procesal', 'verificado', today);
    expect(doneRes.urgency).toBe('cumplido');
    expect(doneRes.label).toBe('Cumplido');

    // Caso 4: Vencido
    const overdueRes = calculateTermStatus('2026-10-10', false, 'termino_procesal', 'verificado', today);
    expect(overdueRes.daysDiff).toBeLessThan(0);
    expect(overdueRes.urgency).toBe('vencido');
  });

  it('Debe estructurar correctamente un borrador de Acción de Tutela con todas sus partes', () => {
    const draft = generateLegalDocument({
      templateType: 'accion_tutela',
      city: 'Medellín',
      date: '2026-10-19',
      recipientName: 'Juez Constitucional de Reparto',
      authorName: 'Carlos Mario Restrepo',
      authorIdType: 'CC',
      authorIdNumber: '70.123.456',
      authorEmail: 'carlos.restrepo@demo.com',
      authorPhone: '+57 300 111 2233',
      authorAddress: 'Calle 50 # 40-10',
      subject: 'Amparo de los Derechos Fundamentales a la Salud y Vida Digna',
      facts: [
        'El accionante se encuentra afiliado a la EPS en calidad de cotizante.',
        'El médico tratante prescribió tratamiento especializado urgente que no ha sido suministrado.'
      ],
      claims: [
        'Tutelar los derechos fundamentales invocados.',
        'Ordenar a la accionada autorizar el procedimiento en 48 horas.'
      ],
      annexes: [
        'Copia de la cédula de ciudadanía.',
        'Fórmula médica y orden MIPRES.'
      ]
    });

    expect(draft.title).toContain('ACCIÓN DE TUTELA');
    expect(draft.content).toContain('1. IDENTIFICACIÓN Y COMPARECENCIA');
    expect(draft.content).toContain('2. HECHOS Y ANTECEDENTES');
    expect(draft.content).toContain('3. FUNDAMENTOS JURÍDICOS');
    expect(draft.content).toContain('4. PETICIONES / PRETENSIONES');
    expect(draft.content).toContain('5. RELACIÓN DE PRUEBAS Y ANEXOS');
    expect(draft.content).toContain('6. NOTIFICACIONES Y CANALES DIGITALES (LEY 2213 DE 2022)');
    expect(draft.content).toContain('JURAMENTO'); // Requisito legal de Tutela Dec. 2591
    expect(draft.content).toContain('CARLOS MARIO RESTREPO');
    expect(draft.disclaimer).toContain('BORRADOR PRELIMINAR');
  });
});

describe('LexFlow Colombia - Autenticación y RBAC Institucional (Ley 2113 de 2021)', () => {
  it('Debe hashear y verificar contraseñas con scrypt de forma segura', async () => {
    const rawPass = 'ClaveSegura2026!';
    const hashed = await hashPassword(rawPass);
    expect(hashed).toContain(':');
    const isValid = await verifyPassword(rawPass, hashed);
    expect(isValid).toBe(true);
    const isInvalid = await verifyPassword('PasswordErrada', hashed);
    expect(isInvalid).toBe(false);
  });

  it('Debe controlar rate limiting en intentos de login fallidos', () => {
    const testIp = '192.168.1.100';
    clearAttempts(testIp);
    expect(checkRateLimit(testIp)).toBe(true);

    for (let i = 0; i < 10; i++) {
      recordFailedAttempt(testIp);
    }
    expect(checkRateLimit(testIp)).toBe(false);
    clearAttempts(testIp);
    expect(checkRateLimit(testIp)).toBe(true);
  });

  it('Debe generar tokens de sesión criptográficos con CSRF', () => {
    const dummyUser: User = {
      id: 'USR-TEST-01',
      name: 'Usuario Test',
      email: 'test@demo.local',
      role: 'STUDENT',
      active: true,
      createdAt: new Date().toISOString()
    };
    const { token, csrf } = createSession(dummyUser);
    expect(token).toBeDefined();
    expect(csrf).toBeDefined();

    const activeSession = getSession(token);
    expect(activeSession?.userId).toBe(dummyUser.id);
  });
});

describe('LexFlow Colombia - Anonimización y Minimización de PII (Ley 1581 de 2012)', () => {
  it('Debe enmascarar cédulas, correos y teléfonos colombianos antes de consultar IA', () => {
    const rawText = 'El señor Juan Pérez, con CC 70.123.456 y teléfono +57 300 123 4567, envió un correo a juan.perez@empresa.com.';
    const scrubbed = minimizePii(rawText);

    expect(scrubbed).not.toContain('70.123.456');
    expect(scrubbed).not.toContain('300 123 4567');
    expect(scrubbed).not.toContain('juan.perez@empresa.com');
    expect(scrubbed).toContain('[DOC_IDENTIDAD_PROTEGIDO]');
    expect(scrubbed).toContain('[CORREO_PROTEGIDO]');
  });
});

describe('LexFlow Colombia - Almacén de Datos, Fuentes Oficiales y Auditoría', () => {
  const testDbDir = path.join(__dirname, '../../test-data');
  let testStore: JsonDataStore;

  beforeEach(() => {
    if (fs.existsSync(testDbDir)) {
      fs.rmSync(testDbDir, { recursive: true, force: true });
    }
    testStore = new JsonDataStore(testDbDir);
  });

  it('Debe inicializar datos semilla y calcular métricas derivadas correctamente', () => {
    const cases = testStore.getCases();
    expect(cases.length).toBeGreaterThan(0);

    const metrics = testStore.getMetrics();
    expect(metrics.totalCases).toBe(cases.length);
    expect(metrics.activeCases + metrics.inProgressCases + metrics.suspendedCases + metrics.inRulingCases + metrics.closedCases).toBe(metrics.totalCases);
    expect(metrics.casesByArea.length).toBeGreaterThan(0);
    expect(metrics.workloadByAssignee.length).toBeGreaterThan(0);
  });

  it('Debe filtrar casos por estudiante asignado respetando el alcance del rol STUDENT', () => {
    const studentUser: User = {
      id: 'USR-STUDENT',
      name: 'Carlos Andrés Ruiz',
      email: 'estudiante@demo.local',
      role: 'STUDENT',
      active: true,
      createdAt: '2026-01-01'
    };
    const directorUser: User = {
      id: 'USR-DIRECTOR',
      name: 'Dra. Camila Restrepo',
      email: 'coordinacion@demo.local',
      role: 'DIRECTOR',
      active: true,
      createdAt: '2026-01-01'
    };

    const studentCases = testStore.getCases({ currentUser: studentUser });
    const allCases = testStore.getCases({ currentUser: directorUser });

    expect(allCases.length).toBeGreaterThan(studentCases.length);
    for (const c of studentCases) {
      expect(c.responsibleId).toBe(studentUser.id);
    }
  });

  it('Debe permitir registrar y convalidar fuentes jurídicas oficiales con auditoría', () => {
    const source = testStore.createSource({
      title: 'Ley 1437 de 2011 - Código de Procedimiento Administrativo (CPACA)',
      entity: 'Congreso de la República',
      url: 'https://suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/1681926',
      area: 'administrativo',
      consultedAt: '2026-10-23',
      note: 'Vigente con modificaciones de la Ley 2080 de 2021.'
    });

    expect(source.status).toBe('PENDING_REVIEW');

    // Convalidación por supervisor
    const verified = testStore.verifySource(source.id, 'USR-SUPERVISOR-01');
    expect(verified?.status).toBe('VERIFIED');
    expect(verified?.verifiedBy).toBe('USR-SUPERVISOR-01');
  });

  it('Debe registrar entradas inmutables en la bitácora de auditoría', () => {
    testStore.addAuditEntry(
      'USR-SUPERVISOR-01',
      'Dr. Andrés Gómez',
      'SUPERVISOR',
      'CASE_REVIEWED',
      'case',
      'CASE-2026-001',
      { decision: 'Aprobado para radicación' }
    );

    const logs = testStore.getAuditLogs(10);
    const match = logs.find(l => l.event === 'CASE_REVIEWED' && l.entityId === 'CASE-2026-001');
    expect(match).toBeDefined();
    expect(match?.actorRole).toBe('SUPERVISOR');
  });
});

describe('LexFlow Colombia - Asistente Jurídico Heurístico', () => {
  it('Debe analizar narración de hechos fácticos y estructurar cronología y preguntas de entrevista', async () => {
    const analysis = await analyzeCaseFacts({
      caseTitle: 'Reclamación de despido injustificado y no pago de cesantías',
      facts: 'El señor Pedro ingresó a laborar el 1 de enero de 2024 en la empresa constructora y fue despedido el 15 de agosto de 2026 sin liquidación.',
      legalArea: 'laboral'
    });

    expect(analysis.timeline).toBeDefined();
    expect(analysis.timeline.length).toBeGreaterThan(0);
    expect(analysis.factsToClarify.length).toBeGreaterThan(0);
    expect(analysis.documentChecklist.length).toBeGreaterThan(0);
    expect(analysis.interviewQuestions.length).toBeGreaterThan(0);
    expect(analysis.legalAreas.length).toBeGreaterThan(0);
    expect(analysis.risksAndUncertainties.length).toBeGreaterThan(0);
    expect(analysis.executiveSummary).toContain('Prospecto y Estrategia Jurídica');
    expect(analysis.strategicProspectus).toBeDefined();
    expect(analysis.strategicProspectus?.applicableNormsAndSources.length).toBeGreaterThan(0);
    expect(analysis.hearingPreparation).toBeDefined();
    expect(analysis.hearingPreparation?.suggestedSupportMaterials.length).toBeGreaterThan(0);
    expect(analysis.remediesAndIncidentsStrategy).toBeDefined();
    expect(analysis.remediesAndIncidentsStrategy?.incidenteDesacatoGuide).toBeDefined();
    expect(analysis.theoryOfTheCase).toBeDefined();
    expect(analysis.disclaimer).toBeDefined();
  });
});
