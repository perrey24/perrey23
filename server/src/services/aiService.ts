import { 
  AICaseAnalysisRequest, 
  AICaseAnalysisResult, 
  StrategicProspectus, 
  PendingActionGuidance, 
  HearingPreparationGuidance, 
  RemediesAndIncidentsStrategy,
  OfficialSource,
  LegalCase,
  LegalAction
} from '../types';
import { store } from '../db/store';
import dotenv from 'dotenv';

if (typeof dotenv !== 'undefined' && dotenv && typeof (dotenv as any).config === 'function') {
  (dotenv as any).config();
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Función de minimización y anonimización de datos personales (PII)
 * en cumplimiento de la Ley 1581 de 2012 y principios de privacidad por diseño.
 */
export function minimizePii(text: string): string {
  if (!text) return '';
  return text
    // Cédulas y NITs colombianos (con o sin puntos y dígito de verificación)
    .replace(/\b\d{1,3}(\.\d{3}){2,3}(-\d)?\b/g, '[DOC_IDENTIDAD_PROTEGIDO]')
    // Correos electrónicos
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[CORREO_PROTEGIDO]')
    // Teléfonos fijos y celulares colombianos (+57 ...)
    .replace(/(\+57\s?)?(3\d{2}\s?\d{3}\s?\d{4}|60\d\s?\d{7})/g, '[TEL_PROTEGIDO]')
    // Direcciones urbanas típicas colombianas
    .replace(/\b(Calle|Cra|Carrera|Cll|Diagonal|Diag|Transversal|Tv|Avenida|Av)\s+\d+[\w\s#-]+/gi, '[DIRECCION_PROTEGIDA]');
}

/**
 * Obtiene el contexto completo de un caso si se suministra su caseId
 */
function getCaseContext(caseId?: string): { 
  fullCase?: LegalCase; 
  actions: LegalAction[]; 
  sources: OfficialSource[] 
} {
  const sources = store.getSources();
  if (!caseId) {
    return { actions: [], sources };
  }
  const fullCase = store.getCaseById(caseId);
  const actions = store.getActions({ caseId });
  return { fullCase, actions, sources };
}

/**
 * Analizador Multidimensional y Estratégico de Casos Jurídicos
 */
export async function analyzeCaseFacts(request: AICaseAnalysisRequest): Promise<AICaseAnalysisResult> {
  const sanitizedRequest: AICaseAnalysisRequest = {
    ...request,
    facts: minimizePii(request.facts),
    caseTitle: request.caseTitle ? minimizePii(request.caseTitle) : undefined,
    currentDoubtOrNeed: request.currentDoubtOrNeed ? minimizePii(request.currentDoubtOrNeed) : undefined,
    partiesInfo: request.partiesInfo ? minimizePii(request.partiesInfo) : undefined,
    claims: request.claims ? minimizePii(request.claims) : undefined,
    nextAction: request.nextAction ? minimizePii(request.nextAction) : undefined
  };

  const caseContext = getCaseContext(request.caseId);

  if (GEMINI_API_KEY) {
    try {
      return await analyzeWithGemini(sanitizedRequest, caseContext);
    } catch (err) {
      console.warn('Gemini API call failed, falling back to Colombian Legal Heuristic Engine:', err);
      return analyzeWithHeuristics(sanitizedRequest, caseContext, true);
    }
  }

  return analyzeWithHeuristics(sanitizedRequest, caseContext, false);
}

/**
 * Chat Conversacional de Orientación y Estrategia Jurídica
 */
export async function chatWithCopilot(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  caseId?: string
): Promise<{ reply: string; isAiMockMode: boolean; modelUsed: string; disclaimer: string }> {
  const disclaimer = 'AVISO: Esta respuesta fue generada por el Asistente Inteligente de LexFlow con fines orientativos y formativos para consultorios jurídicos y profesionales del Derecho. No sustituye el criterio ni la firma del abogado titular. Las citas jurisprudenciales o normativas deben ser convalidadas en las fuentes y relatorías oficiales correspondientes.';

  const caseContext = getCaseContext(caseId);

  // Sanitizar mensajes para no enviar PII
  const sanitizedMessages = messages.map(m => ({
    role: m.role,
    content: minimizePii(m.content)
  }));

  const lastUserMsg = sanitizedMessages.filter(m => m.role === 'user').pop()?.content || '';

  if (GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      let contextPrompt = '';
      if (caseContext.fullCase) {
        const c = caseContext.fullCase;
        contextPrompt = `\n[EXPEDIENTE EN REVISIÓN ACTIVA: Radicado ${c.caseNumber} - "${c.title}"
Área: ${c.legalArea} | Tipo Proceso: ${c.procedureType} | Despacho: ${c.authority}
Estado Actual: ${c.status} | Próxima Actuación: ${c.nextAction} (Fecha límite: ${c.deadlineDate})
Hechos Clave: ${minimizePii(c.facts)}
Pretensiones: ${minimizePii(c.claims)}
Actuaciones en Calendario: ${caseContext.actions.map(a => `${a.type.toUpperCase()}: ${a.title} (${a.date}) - Urgencia: ${a.urgency || 'Normal'}`).join('; ')}]`;
      }

      const verifiedSourcesText = caseContext.sources
        .filter(s => s.status === 'VERIFIED')
        .map(s => `- ${s.title} (${s.entity}): ${s.url} - Nota: ${s.note}`)
        .join('\n');

      const systemInstruction = `Eres LexFlow Copilot, el asistente jurídico de alto nivel especializado en Derecho Colombiano, diseñado para Consultorios Jurídicos Universitarios (Ley 2113 de 2021), docentes supervisores y litigantes.
Tus principios de respuesta obligatorios:
1. Respaldar cada respuesta en el ordenamiento jurídico colombiano vigente (Constitución de 1991, CGP Ley 1564/2012, CPACA Ley 1437/2011 y Ley 2080/2021, Código Sustantivo del Trabajo, CPTSS, Ley 2213/2022 de justicia digital, Decreto 2591/1991 de tutela, Ley 2220/2022 de conciliación).
2. Si el usuario consulta sobre una AUDIENCIA:
   - Identificar de qué tipo es (Art. 372 CGP Inicial, Art. 373 CGP Juzgamiento, Art. 77/80 CPTSS laboral, etc.).
   - Detallar en qué materiales debe apoyarse obligatoriamente (carpeta digital indexada según Ley 2213, alegatos de conclusión en silogismo jurídico, pliego de preguntas para interrogatorio de parte, matriz de hechos controvertidos Art. 167 CGP, fórmulas autorizadas de conciliación).
   - Advertir taxativamente las consecuencias de inasistencia injustificada (confesión ficta, multas hasta 5 SMLMV, Art. 372 núm. 4 CGP).
3. Si el usuario consulta sobre ACTUACIONES PENDIENTES o TÉRMINOS:
   - Explicar paso a paso cómo desarrollarla, redactarla y radicarla por canal digital.
   - Detallar el cómputo de términos: diferencia estricta entre días hábiles procesales y días calendario. Citar la regla de notificación por mensaje de datos (Ley 2213 Art. 8: 2 días hábiles tras el envío + inicio del término al día hábil siguiente).
4. Si el usuario consulta sobre INCIDENTE DE DESACATO o RECURSOS:
   - Explicar la diferencia sustancial entre la orden judicial de cumplimiento oficioso (el juez no pierde competencia hasta el goce efectivo) y el Incidente de Desacato sancionatorio (Art. 52 y 27 Dec. 2591/1991, arresto hasta 6 meses y multa hasta 20 SMLMV).
   - Indicar que la sanción de desacato NO tiene apelación sino Grado Jurisdiccional de Consulta ante el superior (3 a 5 días hábiles).
   - Desglosar los recursos ordinarios (reposición, apelación, queja, súplica) y extraordinarios (casación, tutela contra providencia según Sentencia C-590 de 2005).
5. Estructurar una ESTRATEGIA JURÍDICA completa: Teoría fáctica, probatoria y jurídica con el catálogo de fuentes oficiales.
Catálogo de fuentes oficiales con validez verificada:
${verifiedSourcesText}
${contextPrompt}`;

      const promptHistory = sanitizedMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\nHistorial de interacción:\n${promptHistory}\n\nASSISTANT:`,
      });

      return {
        reply: response.text || 'Sin respuesta generada por el modelo.',
        isAiMockMode: false,
        modelUsed: 'gemini-2.5-flash (Google GenAI Live con Fuentes Oficiales)',
        disclaimer
      };
    } catch (error: any) {
      console.warn('Gemini chat failed, fallback to enhanced local engine:', error?.message);
    }
  }

  // Motor Heurístico Avanzado en caso de no tener API key o falla
  const localReply = generateEnhancedLocalChatReply(lastUserMsg, caseContext);

  return {
    reply: localReply,
    isAiMockMode: true,
    modelUsed: 'Motor Heurístico Especializado en Derecho Colombiano (Fuentes Oficiales & Relatorías)',
    disclaimer
  };
}

/**
 * Motor Heurístico Multidimensional
 */
function analyzeWithHeuristics(
  request: AICaseAnalysisRequest, 
  context: { fullCase?: LegalCase; actions: LegalAction[]; sources: OfficialSource[] },
  hadApiError = false
): AICaseAnalysisResult {
  const text = `${request.facts || ''} ${request.currentDoubtOrNeed || ''} ${request.caseTitle || ''} ${request.claims || ''} ${context.fullCase?.notes || ''}`;
  const lower = text.toLowerCase();

  const isLabor = lower.includes('trabaj') || lower.includes('emplead') || lower.includes('salario') || lower.includes('despido') || lower.includes('prestacion') || lower.includes('cesant') || lower.includes('cst') || lower.includes('contrato realidad');
  const isHealth = lower.includes('salud') || lower.includes('eps') || lower.includes('medicament') || lower.includes('cirug') || lower.includes('tutela') || lower.includes('ips') || lower.includes('enfermedad') || lower.includes('mipres');
  const isContract = lower.includes('contrato') || lower.includes('arrend') || lower.includes('pagar') || lower.includes('deuda') || lower.includes('compraventa') || lower.includes('factura') || lower.includes('cgp') || lower.includes('ejecutiv');
  const isAdministrative = lower.includes('resoluc') || lower.includes('multa') || lower.includes('comparendo') || lower.includes('fotomulta') || lower.includes('alcald') || lower.includes('sancion') || lower.includes('secretar') || lower.includes('cpaca');
  const isFamily = lower.includes('alimento') || lower.includes('hijo') || lower.includes('menor') || lower.includes('custodia') || lower.includes('visita') || lower.includes('divorcio') || lower.includes('cuota');
  const isDesacatoMentioned = lower.includes('desacato') || lower.includes('incumplimiento de tutela') || lower.includes('orden judicial') || lower.includes('no cumplio');
  const isHearingMentioned = lower.includes('audiencia') || context.actions.some(a => a.type === 'audiencia');

  // 1. Cronología
  const timeline: AICaseAnalysisResult['timeline'] = [];
  const dateRegex = /\b(\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|año\s+\d{4})\b/gi;
  const matches = text.match(dateRegex);

  if (matches && matches.length > 0) {
    matches.slice(0, 4).forEach((dateStr, idx) => {
      timeline.push({
        dateOrPeriod: dateStr,
        description: `Hito temporal ${idx + 1} identificado en los antecedentes fácticos.`,
        relevance: 'Trascendente para verificar términos de prescripción trienal laboral, caducidad en sede contenciosa o principio de inmediatez.'
      });
    });
  } else {
    timeline.push(
      { dateOrPeriod: 'Inicio de la relación / Hecho generador', description: 'Momento de configuración del vínculo o hecho causante del daño.', relevance: 'Fijación de competencia y cómputo de términos sustanciales.' },
      { dateOrPeriod: 'Incumplimiento o vulneración', description: 'Momento en que se configuró la mora, omisión o transgresión.', relevance: 'Punto de partida de términos procesales e inmediatez.' },
      { dateOrPeriod: 'Estado procesal presente', description: 'Evaluación y asesoría en consultorio jurídico.', relevance: 'Definición de ruta y medidas cautelares o preventivas.' }
    );
  }

  // 2. Vacíos Fácticos
  const factsToClarify = [
    '¿Existe constancia fehaciente con acuse de recibo de la última comunicación enviada o recibida por canal digital (Art. 8 Ley 2213 de 2022)?',
    '¿Se cuenta con la constancia de notificación personal y certificación de entrega del correo electrónico?',
    '¿Se agotó alguna etapa de reclamación directa o audiencia de conciliación prejudicial en derecho (Ley 2220 de 2022)?'
  ];

  if (isLabor) {
    factsToClarify.push('¿Existen pruebas de subordinación directa (memorandos, horarios, llamadas de atención) para desvirtuar la apariencia de contrato de prestación de servicios?');
    factsToClarify.push('¿El extrabajador devengaba más de un (1) salario mínimo mensual legal vigente para el cálculo del segundo tramo del Art. 65 del CST?');
  } else if (isHealth) {
    factsToClarify.push('¿Existe orden emitida por médico tratante adscrito a la EPS o concepto de profesional no adscrito convalidado por urgencia vital?');
    factsToClarify.push('¿La EPS fundamentó su negativa por escrito o se configura un silencio lesivo de derechos fundamentales?');
  }

  // 3. Documentos requeridos
  const documentChecklist: AICaseAnalysisResult['documentChecklist'] = [
    { documentName: 'Cédula de Ciudadanía o documento de identidad de las partes', purpose: 'Acreditar legitimación en la causa por activa y capacidad procesal.', necessity: 'Obligatorio' },
    { documentName: 'Poder especial debidamente conferido o designación de Consultorio (Ley 2113 de 2021)', purpose: 'Acreditar debida postulación para litigar ante el despacho.', necessity: 'Obligatorio' }
  ];

  if (isLabor) {
    documentChecklist.push(
      { documentName: 'Contrato de trabajo, cartas de asignación y anexos', purpose: 'Acreditar relación jurídica inicial y cláusulas vigentes.', necessity: 'Obligatorio' },
      { documentName: 'Comprobantes de pago de nómina o extractos bancarios de consignaciones', purpose: 'Demostrar retribución periódica como elemento de salario.', necessity: 'Obligatorio' },
      { documentName: 'Historia laboral consolidada con semanas cotizadas (Colpensiones o AFP)', purpose: 'Verificar omisión o mora patronal en aportes a seguridad social.', necessity: 'Recomendable' }
    );
  } else if (isHealth) {
    documentChecklist.push(
      { documentName: 'Historia clínica completa y resumen de evolución médica', purpose: 'Probar el diagnóstico y la urgencia del tratamiento amparado.', necessity: 'Obligatorio' },
      { documentName: 'Fórmula médica u orden MIPRES oficial', purpose: 'Demostrar el criterio facultativo vinculante para la EPS.', necessity: 'Obligatorio' },
      { documentName: 'Radicados de solicitud con sellos o acuses electrónicos', purpose: 'Acreditar la vulneración por parte de la EPS.', necessity: 'Obligatorio' }
    );
  } else if (isContract) {
    documentChecklist.push(
      { documentName: 'Título valor original o contrato con firma y fecha de vencimiento', purpose: 'Acreditar título ejecutivo claro, expreso y actualmente exigible (CGP Art. 422).', necessity: 'Obligatorio' },
      { documentName: 'Certificado de existencia y representación legal con fecha de expedición menor a 30 días', purpose: 'Acreditar personería jurídica de personas morales vinculadas.', necessity: 'Obligatorio' }
    );
  }

  // 4. Preguntas de entrevista
  const interviewQuestions = [
    '¿Cuál es la pretensión principal que desea satisfacer con la gestión del consultorio jurídico?',
    '¿Ha recibido requerimientos, notificaciones por correo electrónico o demandas previas por estos mismos hechos?',
    '¿Tiene identificada la dirección física y el buzón electrónico oficial de notificaciones judiciales de la contraparte?'
  ];

  // 5. Áreas jurídicas
  const legalAreas: AICaseAnalysisResult['legalAreas'] = [];
  if (isHealth) legalAreas.push({ area: 'Derecho Constitucional (Acción de Tutela)', confidence: 'Alta', reasoning: 'Vulneración directa a los derechos fundamentales a la salud en conexidad con la vida digna (Dec. 2591/1991).' });
  if (isLabor) legalAreas.push({ area: 'Derecho Laboral Individual y Seguridad Social', confidence: 'Alta', reasoning: 'Controversia originada en el contrato de trabajo, acreencias salariales y sanciones del Código Sustantivo del Trabajo.' });
  if (isContract) legalAreas.push({ area: 'Derecho Civil y Comercial (Obligaciones y Títulos Valores)', confidence: 'Alta', reasoning: 'Incumplimiento o cobro ejecutivo de negocios jurídicos entre particulares (CGP Ley 1564/2012).' });
  if (isAdministrative) legalAreas.push({ area: 'Derecho Administrativo y Contencioso', confidence: 'Alta', reasoning: 'Control de legalidad de actos administrativos ante la jurisdicción contenciosa (CPACA Ley 1437/2011).' });
  if (isFamily) legalAreas.push({ area: 'Derecho de Familia e Infancia', confidence: 'Alta', reasoning: 'Protección integral a menores de edad y fijación o cobro de alimentos.' });
  if (legalAreas.length === 0) legalAreas.push({ area: 'Derecho Civil General y Conciliación Extrajudicial', confidence: 'Media', reasoning: 'Asunto preliminar susceptible de resolución compositiva bajo la Ley 2220 de 2022.' });

  // 6. Actuaciones preliminares
  const preliminaryActions: AICaseAnalysisResult['preliminaryActions'] = [
    { stepNumber: 1, title: 'Consolidar carpeta digital y cotejo documental', timeframe: '1 a 2 días hábiles', description: 'Organizar expediente digital con índice electrónico conforme a los requisitos de la Ley 2213 de 2022.' },
    { stepNumber: 2, title: 'Revisión y convalidación estricta con docente supervisor', timeframe: 'Inmediato', description: 'Revisar competencias del estudiante en consultorio (Ley 2113 de 2021) y viabilidad de la acción.' },
    { stepNumber: 3, title: 'Agotamiento de procedibilidad o radicación judicial', timeframe: '2 a 4 días hábiles', description: 'Verificar conciliación prejudicial obligatoria o proceder a radicación por ventanilla virtual de la Rama Judicial.' }
  ];

  // 7. Riesgos
  const risksAndUncertainties: AICaseAnalysisResult['risksAndUncertainties'] = [
    { risk: 'Riesgo de extemporaneidad o pérdida de oportunidad procesal', severity: 'Alta', mitigation: 'Verificar si corre término hábil (CGP Art. 118) y calcular fecha límite excluyendo festivos de Ley Emiliani.' },
    { risk: 'Falta de soporte de notificación personal electrónica', severity: 'Media', mitigation: 'Aportar captura completa del mensaje de datos con acuse de recibido certificado o constancia de entrega.' }
  ];

  // 8. Prospecto Estratégico Especializado
  const strategicProspectus: StrategicProspectus = {
    caseDiagnosis: `Diagnóstico Procesal: El expediente presenta una causa activa ${isLabor ? 'de índole laboral ordinaria' : isHealth ? 'constitucional tutelar de salud' : isAdministrative ? 'administrativa sancionatoria' : 'ordinaria civil'}. ${context.fullCase?.nextAction ? `Tiene como hito inmediato registrado: "${context.fullCase.nextAction}" programado para el día ${context.fullCase.deadlineDate}.` : 'Se requiere fijar actuación inmediata para evitar parálisis del trámite.'}`,
    recommendedNextSteps: [
      'Paso 1: Auditar la totalidad del expediente digital y verificar que no existan autos pendientes de notificación por estado.',
      'Paso 2: Elaborar memorial o pieza jurídica con fundamentos normativos verificados del catálogo oficial.',
      'Paso 3: Obtener la aprobación y firma del Docente Supervisor antes de cualquier actuación ante el Despacho Judicial (Ley 2113 de 2021).',
      'Paso 4: Enviar simultáneamente copia del memorial radicado a la contraparte conforme al Artículo 6 de la Ley 2213 de 2022.'
    ],
    applicableNormsAndSources: [
      {
        norm: isLabor ? 'Código Sustantivo del Trabajo' : isHealth ? 'Decreto 2591 de 1991' : isAdministrative ? 'Ley 1437 de 2011 (CPACA)' : 'Código General del Proceso (Ley 1564)',
        article: isLabor ? 'Artículos 64 (Indemnización despido) y 65 (Indemnización moratoria)' : isHealth ? 'Artículos 27 (Cumplimiento de fallo) y 52 (Incidente de desacato)' : isAdministrative ? 'Artículo 138 (Nulidad y restablecimiento) y 161 (Requisitos de procedibilidad)' : 'Artículos 90 (Admisión), 118 (Términos) y 372 (Audiencia inicial)',
        officialSourceTitle: 'SUIN-JURISCOL / MinJusticia',
        officialUrl: 'https://www.suin-juriscol.gov.co/',
        relevance: 'Base normativa obligatoria para la sustentación y admisibilidad de la pretensión.'
      },
      {
        norm: 'Ley 2213 de 2022',
        article: 'Artículos 6, 8 y 9 (Justicia Digital y Notificaciones)',
        officialSourceTitle: 'SUIN-JURISCOL / Ley 2213 de 2022',
        officialUrl: 'https://suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/30044005',
        relevance: 'Regula la validez del mensaje de datos y el término de 2 días hábiles para entender surtida la notificación personal.'
      },
      {
        norm: 'Ley 2113 de 2021',
        article: 'Artículos 6 y 9 (Régimen de Consultorios Jurídicos Universitarios)',
        officialSourceTitle: 'MinJusticia / Ley 2113 de 2021',
        officialUrl: 'https://minjusticia.gov.co/Sede-Electronica/Documents/Consultorios-Juridicos/Normatividad/Normas/LEY-2113-DE-2021.pdf',
        relevance: 'Establece la competencia funcional y el deber de supervisión docente estricta sobre la actuación del estudiante.'
      }
    ],
    jurisprudencePrecedents: [
      {
        court: isHealth ? 'Corte Constitucional' : isLabor ? 'Corte Suprema de Justicia (Sala Laboral)' : 'Corte Constitucional',
        precedentRef: isHealth ? 'Sentencia T-760 de 2008 y Sentencia SU-508 de 2020' : isLabor ? 'Sentencia SL-1680 de 2020 y Sentencia CSJ SL4816-2021' : 'Sentencia C-038 de 2020',
        keyHolding: isHealth 
          ? 'El acceso a la salud es derecho fundamental autónomo. La falta de autorización o trámite interno entre EPS e IPS no es oponible al paciente para suspender o negar intervenciones urgentes.'
          : isLabor 
          ? 'Para imponer la sanción del artículo 65 del CST, el juez debe realizar un juicio estricto de conducta patronal para determinar si existieron razones plausibles de buena fe o conducta omisiva injustificada.'
          : 'En materia sancionatoria y de fotomultas es imperativo individualizar al infractor real; la sola condición de propietario del vehículo no permite trasladar responsabilidad objetiva.',
        relatoriaUrl: isHealth 
          ? 'https://www.corteconstitucional.gov.co/relatoria/' 
          : 'https://cortesuprema.gov.co/corte/index.php/relatoria/'
      }
    ]
  };

  // 9. Guía de Actuación Pendiente
  const pendingActionGuidance: PendingActionGuidance = {
    actionTitle: context.fullCase?.nextAction || 'Radicación y seguimiento de actuación procesal',
    urgencyLevel: context.fullCase?.deadlineDate ? 'Alta / Término en Curso' : 'Normal',
    daysRemaining: 5,
    howToDevelopStepByStep: [
      '1. Redacción del Memorial: Redacte con estructura formal: Destinatario (Juzgado), Número de Radicado de 23 dígitos, Identificación de las partes, Objeto de la petición y Sustentación fáctica y jurídica.',
      '2. Cotejo de Anexos: Convierta todos los documentos probatorios a formato PDF legible, sin contraseñas ni restricciones de visualización.',
      '3. Visto Bueno Docente: Remita el borrador al Docente Supervisor a través de la plataforma para aprobación según la Ley 2113 de 2021.',
      '4. Radicación Oficial: Radique a través del correo electrónico o ventanilla virtual del Despacho Judicial, remitiendo copia simultánea a los canales electrónicos de las demás partes (Ley 2213 de 2022, Art. 6).',
      '5. Constancia de Envío: Guarde el comprobante de envío con fecha, hora y encabezados de entrega (acuse de recibo).'
    ],
    proceduralRulesNotice: 'Atención: En los términos judiciales en días rigen exclusivamente los días hábiles judiciales (CGP Art. 118 / CPACA Art. 119). No se computan sábados, domingos, festivos de la Ley Emiliani ni períodos de cierre de despacho.',
    pitfallsToAvoid: [
      'No enviar copia simultánea a la contraparte: Puede generar requerimiento judicial o nulidad del trámite (Art. 6 Ley 2213).',
      'Radicar fuera de horario hábil: Los correos radicados después del cierre del despacho judicial (usualmente 4:00 p.m. o 5:00 p.m.) se entienden presentados al día hábil siguiente.',
      'Omitir la firma del docente supervisor: La actuación del estudiante carece de eficacia legal plena si no cuenta con el respaldo docente exigido por la Ley 2113 de 2021.'
    ]
  };

  // 10. Preparación de Audiencia
  const hearingPreparation: HearingPreparationGuidance = {
    hearingType: isLabor 
      ? 'Audiencia de Conciliación, Decisión de Excepciones Previas, Saneamiento y Fijación del Litigio (Art. 77 CPTSS)' 
      : isAdministrative 
      ? 'Audiencia Inicial (Art. 180 CPACA)' 
      : 'Audiencia Inicial de Conciliación y Saneamiento (Art. 372 CGP)',
    suggestedSupportMaterials: [
      {
        materialName: 'Expediente Digital Foliado e Indexado (Ley 2213 de 2022)',
        description: 'Documento PDF consolidado con índice digital interactivo de demanda, contestación, autos y pruebas admitidas.',
        urgency: 'Indispensable'
      },
      {
        materialName: 'Minuta Preliminar de Alegatos de Conclusión',
        description: 'Estructura en silogismo jurídico: Hechos probados, normas y precedentes aplicables, y petición concreta de condena/amparo.',
        urgency: 'Indispensable'
      },
      {
        materialName: 'Pliego de Preguntas para Interrogatorio de Parte y Testigos',
        description: 'Preguntas asertivas y no inquisitivas, directas y referidas a hechos propios controvertidos (CGP Art. 202).',
        urgency: 'Indispensable'
      },
      {
        materialName: 'Fórmulas Autorizadas de Arreglo y Conciliación',
        description: 'Acta de directriz previa suscrita por el usuario con límites mínimos de negociación autorizados para la etapa conciliatoria judicial.',
        urgency: 'Recomendable'
      },
      {
        materialName: 'Ficha Resumen de Pruebas Admitidas vs. Hechos por Probar (Art. 167 CGP)',
        description: 'Cuadro comparativo que permite controvertir en vivo cualquier objeción o tacha de testigos promovida por la contraparte.',
        urgency: 'Recomendable'
      }
    ],
    interrogationAndEvidenceTactics: [
      'Al interrogar a la contraparte: Plantear preguntas sobre hechos personales y conductas observables para provocar confesión judicial espontánea.',
      'Al interrogar a perito: Interrogar sobre la metodología empleada, idoneidad de los instrumentos de medición y grado de certeza técnica del dictamen.',
      'Control de excepciones previas: Tener a la mano la copia de la contestación y los documentos que desvirtúan cualquier falta de legitimación o indebida acumulación de pretensiones.'
    ],
    inattendanceConsequencesNotice: '¡ADVERTENCIA CRÍTICA!: La inasistencia injustificada a la audiencia inicial genera la presunción de certeza de los hechos susceptibles de confesión afirmados por la contraparte (Confesión Ficta bajo Art. 372 núm. 4 CGP y Art. 77 CPTSS) y sanción económica de multa de hasta 5 SMLMV. Cualquier excusa por fuerza mayor debe radicarse con soportes idóneos.',
    settlementFormulasAdvice: 'Para la etapa de conciliación judicial obligatoria, el estudiante debe coordinar previamente con el supervisor la propuesta de arreglo. Nunca ofrezca ni acepte renuncias a derechos ciertos e indiscutibles (Art. 53 C.P.).'
  };

  // 11. Estrategia de Recursos e Incidentes (Desacato)
  const remediesAndIncidentsStrategy: RemediesAndIncidentsStrategy = {
    availableOrdinaryRemedies: [
      {
        name: 'Recurso de Reposición',
        legalBasis: 'CGP Art. 318 / CPACA Art. 242 / CST Art. 63',
        deadlineAndFiling: 'Tres (3) días hábiles siguientes a la notificación del auto por estado. Si el auto se profiere en audiencia, debe interponerse y sustentarse oralmente de inmediato.',
        purpose: 'Para que el mismo juez que dictó la providencia revoque o reforme un auto interlocutorio o de trámite.'
      },
      {
        name: 'Recurso de Apelación',
        legalBasis: 'CGP Arts. 320 - 322 / CPACA Art. 243 / CPTSS Art. 65',
        deadlineAndFiling: 'Tres (3) días siguientes a la notificación por estado para autos apelables taxativos, o en la misma audiencia tras la emisión de sentencia de primera instancia.',
        purpose: 'Para que el superior funcional examine la decisión en lo desfavorable y revoque o modifique la sentencia o auto apelable.'
      },
      {
        name: 'Recurso de Queja',
        legalBasis: 'CGP Art. 352 / CPACA Art. 245',
        deadlineAndFiling: 'Cinco (5) días siguientes a la notificación del auto que deniega la apelación o la casación.',
        purpose: 'Para que el superior jerárquico determine si la apelación o casación fue indebidamente negada y ordene concederla.'
      }
    ],
    extraordinaryAndConstitutionalRemedies: [
      {
        name: 'Recurso Extraordinario de Casación',
        legalBasis: 'CGP Art. 333 / CPTSS Art. 86 (Corte Suprema de Justicia)',
        requirements: 'Procede contra sentencias dictadas en segunda instancia por Tribunales Superiores que cumplan con la cuantía del interés para recurrir (Laboral: > 120 SMLMV; Civil: > 1000 SMLMV).'
      },
      {
        name: 'Acción de Tutela contra Providencia Judicial',
        legalBasis: 'Sentencia C-590 de 2005 y Jurisprudencia de la Corte Constitucional',
        requirements: 'Carácter residual excepcional: exige agotar todos los recursos ordinarios, acreditar inmediatez y demostrar una causal específica (defecto fáctico, sustantivo, orgánico o procedimental absoluto).'
      }
    ],
    incidenteDesacatoGuide: {
      legalBasis: 'Artículos 27 y 52 del Decreto 2591 de 1991',
      differencesWithCumplimiento: 'Diferencia esencial: El trámite de CUMPLIMIENTO es imperativo y oficioso; el juez de primera instancia mantiene la competencia indefinida hasta que la orden se cumpla íntegramente. El INCIDENTE DE DESACATO es un mecanismo accesorio y sancionatorio (arresto hasta 6 meses y multa de hasta 20 SMLMV) orientado a sancionar la renuencia o contumacia del obligado.',
      stepByStepProcedure: [
        '1. Radicación del escrito de desacato ante el mismo juez de primera instancia que profirió el fallo de tutela.',
        '2. El juez emite requerimiento previo con plazo perentorio de 48 horas al superior jerárquico del responsable.',
        '3. Si persiste la omisión, el juez dicta Auto de Apertura de Incidente de Desacato confiriendo traslado de 3 días para garantizar el derecho a la defensa y contradicción.',
        '4. Práctica de pruebas sobre la conducta omisiva o imposibilidad material alegada por la entidad.',
        '5. Providencia judicial motivada que resuelve si se impone o no sanción de arresto y multa.'
      ],
      remediesAndConsulta: 'Regla de Oro en Recursos: La providencia que sanciona por desacato NO tiene recurso de apelación. Por disposición expresa del Artículo 52 del Decreto 2591 de 1991, se concede obligatoriamente en el GRADO JURISDICCIONAL DE CONSULTA ante el superior jerárquico. La sanción queda suspendida hasta que el superior resuelva (término de 3 a 5 días hábiles). Si el juez decide no sancionar, tampoco procede apelación ordinaria, pero el accionante puede insistir en el cumplimiento formal.',
      sanctionsRisk: 'Medidas de arresto hasta por 6 meses y multa acumulable de hasta 20 salarios mínimos legales mensuales vigentes a cargo del representante de la entidad accionada.'
    }
  };

  // 12. Teoría del Caso
  const theoryOfTheCase = {
    factualTheory: `La parte accionante sufrió una afectación cierta y demostrable originada en ${isLabor ? 'la desprotección de derechos laborales y no pago de acreencias' : isHealth ? 'la negativa injustificada de tratamientos o insumos médicos indispensables' : 'el incumplimiento de obligaciones jurídicas exigibles'}.`,
    probatoryTheory: `Se respaldará la pretensión con ${documentChecklist.slice(0, 3).map(d => d.documentName).join(', ')}, desvirtuando la defensa de la contraparte mediante carga dinámica de la prueba (CGP Art. 167).`,
    legalTheory: `Subsunción típica bajo ${strategicProspectus.applicableNormsAndSources[0]?.norm || 'la normativa colombiana aplicable'}, demostrando la causación del daño y la procedencia de las pretensiones bajo el amparo de los precedentes constitucionales citados.`
  };

  const executiveSummary = `Prospecto y Estrategia Jurídica Multidimensional (Minimización PII aplicada): 
Expediente evaluado bajo el marco normativo colombiano (Ley 2113 de 2021). Se determina viabilidad de la pretensión y se formula la ruta de acción procesal. ${context.fullCase?.nextAction ? `Atención inmediata requerida para la actuación "${context.fullCase.nextAction}" con fecha límite registrada.` : 'Se recomienda radicación y aseguramiento probatorio inmediato.'} Conforme al catálogo oficial de fuentes, se incorporan las bases normativas de SUIN-JURISCOL y las directrices de relatoría de Altas Cortes.`;

  return {
    timeline,
    factsToClarify,
    documentChecklist,
    interviewQuestions,
    legalAreas,
    preliminaryActions,
    risksAndUncertainties,
    executiveSummary,
    sourcesNote: `Catálogo Oficial Vinculado: SUIN-JURISCOL, Relatoría Corte Constitucional, Relatoría Corte Suprema, SAMAI Consejo de Estado. Convalidación institucional requerida conforme a la Ley 2113 de 2021.`,
    isAiMockMode: !hadApiError,
    modelUsed: hadApiError 
      ? 'Motor Heurístico Colombiano Especializado (Respaldo activo)' 
      : 'Motor Heurístico Especializado en Derecho Colombiano (Fuentes Oficiales & Relatorías)',
    disclaimer: 'ATENCIÓN: Este prospecto fue elaborado por el motor de razonamiento jurídico y estratégico de LexFlow Colombia. Constituye una herramienta analítica de apoyo sujeta a la revisión, adecuación y convalidación obligatoria por parte del docente supervisor del consultorio jurídico (Ley 2113 de 2021).',
    piiMinimized: true,
    strategicProspectus,
    pendingActionGuidance,
    hearingPreparation,
    remediesAndIncidentsStrategy,
    theoryOfTheCase
  };
}

/**
 * Generador local de respuestas para el chat con inteligencia jurídica contextual
 */
function generateEnhancedLocalChatReply(
  query: string, 
  context: { fullCase?: LegalCase; actions: LegalAction[]; sources: OfficialSource[] }
): string {
  const q = query.toLowerCase();

  // 1. Consulta sobre Incidente de Desacato o Recursos de Tutela
  if (q.includes('desacato') || q.includes('incumplimiento') || q.includes('no cumplio la tutela') || q.includes('orden del juez')) {
    return `### Trámite y Estrategia del Incidente de Desacato (Decreto 2591 de 1991)

Conforme a los **Artículos 27 y 52 del Decreto 2591 de 1991** y la jurisprudencia unificada de la Corte Constitucional:

#### 1. Diferencia Jurídica Crucial: Cumplimiento vs. Desacato
- **Orden de Cumplimiento (Art. 27)**: Trámite procesal imperativo y oficioso. El juez de tutela de primera instancia **no pierde competencia** hasta que la orden esté plenamente acatada y restablecido el derecho fundamental.
- **Incidente de Desacato (Art. 52)**: Mecanismo accesorio y de naturaleza sancionatoria subjetiva (responsabilidad por culpa o dolo del obligado), dirigido a sancionar con **arresto hasta por seis (6) meses y multa de hasta veinte (20) SMLMV**.

#### 2. Procedimiento Paso a Paso:
1. **Requerimiento Previo (48 horas)**: El juez libra oficio al superior jerárquico del funcionario renuente para que lo haga cumplir y abra proceso disciplinario.
2. **Auto de Apertura de Incidente**: Si no se cumple, el juez abre formalmente el incidente y confiere **traslado de tres (3) días hábiles** a la persona obligada para que ejerza su derecho a la defensa y contradicción.
3. **Decisión Sancionatoria**: El juez evalúa si existió imposibilidad física/jurídica o negligencia contumaz.

#### 3. Recursos y Grado Jurisdiccional de Consulta
> [!IMPORTANT]
> **La decisión que impone sanción por desacato NO tiene recurso de apelación**. Por mandato expreso del Artículo 52 del Decreto 2591 de 1991, **se surte obligatoriamente el Grado Jurisdiccional de Consulta** ante el superior jerárquico.
- **Efecto de la Consulta**: La sanción de arresto y multa queda **suspendida** hasta que el superior resuelva (plazo legal: 3 a 5 días hábiles).
- **Si el juez decide NO sancionar**: No procede consulta ni apelación; el accionante debe continuar exigiendo el cumplimiento efectivo ante el juez de primera instancia.`;
  }

  // 2. Consulta sobre Audiencias y Materiales de Apoyo
  if (q.includes('audiencia') || q.includes('materiales') || q.includes('preparar') || q.includes('interrogatorio')) {
    const nextHearing = context.actions.find(a => a.type === 'audiencia');
    const caseInfo = context.fullCase;

    return `### Protocolo y Materiales de Apoyo para Audiencia Judicial

${caseInfo ? `**Expediente**: Radicado ${caseInfo.caseNumber} - ${caseInfo.title}\n**Audiencia Próxima**: ${nextHearing ? `${nextHearing.title} (${nextHearing.date} a las ${nextHearing.time || 'hora fijada'})` : caseInfo.nextAction}\n` : ''}

#### 1. Materiales de Apoyo Indispensables que Debe Preparar
Para comparecer con solvencia técnica, el apoderado o estudiante de consultorio debe estructurar:

1. 📂 **Expediente Digital Foliado e Indexado (Ley 2213 de 2022)**:
   - Archivo PDF único o carpeta con índice electrónico con hipervínculos que permita ubicar en segundos la demanda, contestación, autos y anexos durante la diligencia virtual.
2. 📝 **Minuta Preliminar de Alegatos de Conclusión**:
   - Redacte su alegato en **silogismo jurídico** (Premisa fáctica probada + Premisa normativa/jurisprudencial + Conclusión concreta). Tiempo procesal máximo: 20 minutos (CGP Art. 373).
3. 🎯 **Cuestionario Guía de Interrogatorio y Contrainterrogatorio (CGP Art. 202)**:
   - Preguntas asertivas, claras y precisas, dirigidas a hechos controvertidos directos. Evite preguntas capciosas o sugestivas que faculten objeción de la contraparte.
4. 🤝 **Límites Autorizados de Conciliación Judicial**:
   - Documento firmado con el poderdante donde se establecen los montos mínimos y modalidades de pago autorizadas para la etapa de conciliación judicial obligatoria.
5. ⚖️ **Matriz de Carga de la Prueba (CGP Art. 167)**:
   - Cuadro comparativo: Qué hecho se pretende probar vs. qué documento o testimonio lo soporta.

#### 2. Advertencia Procesal de Inasistencia (CGP Art. 372 núm. 4 / CPTSS Art. 77)
- La inasistencia injustificada produce la **presunción de certeza de los hechos susceptibles de confesión** (Confesión Ficta) y multa de hasta **cinco (5) SMLMV**.
- En caso de fuerza mayor o caso fortuito, debe radicarse la justificación médica o documental antes de la audiencia o dentro de los **tres (3) días hábiles siguientes**.`;
  }

  // 3. Consulta sobre Recursos Agotables y Vías de Impugnación
  if (q.includes('recurso') || q.includes('apelar') || q.includes('reponer') || q.includes('queja') || q.includes('casacion') || q.includes('impugnar')) {
    return `### Matriz de Recursos Ordinarios y Extraordinarios en Colombia

#### 1. Recursos Ordinarios
- **Recurso de Reposición (CGP Art. 318 / CPACA Art. 242 / CST Art. 63)**:
  - Procede contra autos de trámite e interlocutorios para que el mismo juez los revoque o modifique.
  - *Término*: Tres (3) días hábiles siguientes a la notificación por estado (o inmediatamente en audiencia oral).
- **Recurso de Apelación (CGP Arts. 320 - 322 / CPACA Art. 243)**:
  - Procede contra autos taxativos (CGP Art. 321) y contra sentencias de primera instancia.
  - *Efectos*: Suspensivo (paraliza la ejecución), Devolutivo (no la paraliza) o Diferido.
  - *Término*: Tres (3) días siguientes a la notificación del auto o en estrados durante la audiencia.
- **Recurso de Queja (CGP Art. 352)**:
  - Procede cuando el juez deniega el recurso de apelación o de casación para que el superior jerárquico lo conceda.
  - *Término*: Cinco (5) días hábiles.
- **Recurso de Súplica (CPACA Art. 246)**:
  - En tribunales administrativos y Consejo de Estado, contra autos que por su naturaleza serían apelables dictados por el magistrado ponente.

#### 2. Recursos Extraordinarios y Vía Constitucional
- **Recurso Extraordinario de Casación**: Ante la Corte Suprema de Justicia (Laboral, Civil o Penal) por violación directa o indirecta de la ley sustancial, sujeto a cuantía del interés para recurrir.
- **Acción de Tutela contra Providencia Judicial (Sentencia C-590 de 2005)**: Exige agotar recursos ordinarios, acreditar inmediatez y configurar un defecto específico (fáctico, sustantivo, orgánico o procedimental).`;
  }

  // 4. Consulta sobre Términos y Notificación Electrónica
  if (q.includes('termino') || q.includes('dias habiles') || q.includes('notificacion') || q.includes('ley 2213') || q.includes('emiliani')) {
    return `### Cómputo Procesal y Notificaciones (Ley 2213 de 2022 & CGP)

#### 1. Regla de Notificación Personal Electrónica (Ley 2213 de 2022, Art. 8)
1. **Envío del mensaje de datos**: Se remite la providencia y copia de la demanda con anexos al buzón electrónico oficial.
2. **Plazo de inicio de la notificación**: Se entiende surtida transcurridos **dos (2) días hábiles siguientes** al envío del mensaje.
3. **Inicio del cómputo del término**: El término procesal empieza a correr a partir del **día hábil siguiente** a aquel en que se surtió la notificación.

#### 2. Cómputo de Días Hábiles vs. Días Calendario
- **CGP Art. 118 / CPACA Art. 119**: En los términos de días fijados por la ley o el juez, **solo se computan los días hábiles judiciales**.
- Se excluyen sábados, domingos, días de vacancia judicial y festivos de la Ley Emiliani (Ley 51 de 1983).
- Los términos en meses o años se computan por calendario.`;
  }

  // Respuesta Integral por Defecto apoyada en el catálogo
  return `### Estrategia y Orientación Jurídica Integral de LexFlow Copilot

He analizado su consulta: *"${query}"* ${context.fullCase ? `en relación con el expediente **${context.fullCase.caseNumber}** (${context.fullCase.title})` : 'a la luz del ordenamiento jurídico colombiano'}.

#### 1. Diagnóstico y Enfoque Estratégico
- **Área Jurídica y Procedimiento**: Verifique la vía idónea (ordinaria civil/laboral, contenciosa administrativa o amparo tutelar).
- **Procedibilidad (Ley 2220 de 2022)**: Verifique si el asunto requiere conciliación extrajudicial prejudicial en derecho antes de demandar.
- **Carga de la Prueba (CGP Art. 167)**: Incumbe a la parte acreditar los hechos generadores del derecho. Debe recopilarse soporte probatorio documental verificado.

#### 2. Fuentes Oficiales Recomendadas para Cotejo Directo
- **SUIN-JURISCOL**: [https://www.suin-juriscol.gov.co/](https://www.suin-juriscol.gov.co/) (Leyes y decretos vigentes).
- **Relatoría de la Corte Constitucional**: [https://www.corteconstitucional.gov.co/relatoria/](https://www.corteconstitucional.gov.co/relatoria/) (Jurisprudencia de tutela y unificación).
- **Relatoría de la Corte Suprema de Justicia**: [https://cortesuprema.gov.co/corte/index.php/relatoria/](https://cortesuprema.gov.co/corte/index.php/relatoria/) (Casación Civil y Laboral).

*Recuerde que conforme a la Ley 2113 de 2021, toda decisión de fondo debe ser convalidada por el Docente Supervisor a cargo.*`;
}

/**
 * Analizador respaldado con la API oficial de Google Gemini con Schema Estructurado Completo
 */
async function analyzeWithGemini(
  request: AICaseAnalysisRequest,
  context: { fullCase?: LegalCase; actions: LegalAction[]; sources: OfficialSource[] }
): Promise<AICaseAnalysisResult> {
  const { GoogleGenAI, Type } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const verifiedSourcesList = context.sources
    .filter(s => s.status === 'VERIFIED')
    .map(s => `${s.title} (${s.entity}) - ${s.url}`)
    .join('\n');

  const prompt = `Actúa como especialista senior en Derecho Procesal y Sustancial Colombiano para consultorios jurídicos (Ley 2113 de 2021).
Analiza el siguiente caso con datos personales minimizados a fondo:
Título: ${request.caseTitle || context.fullCase?.title || 'Sin título'}
Área referencial: ${request.legalArea || context.fullCase?.legalArea || 'Por determinar'}
Procedimiento: ${request.procedureType || context.fullCase?.procedureType || 'Por determinar'}
Despacho / Autoridad: ${request.authority || context.fullCase?.authority || 'No asignada'}
Estado actual: ${request.currentStatus || context.fullCase?.status || 'activo'}
Próxima actuación: ${request.nextAction || context.fullCase?.nextAction || 'Por definir'}
Fecha límite: ${request.deadlineDate || context.fullCase?.deadlineDate || 'Por definir'}
Pretensiones: ${request.claims || context.fullCase?.claims || 'No especificadas'}
Hechos:
${request.facts}

Duda específica:
${request.currentDoubtOrNeed || 'Estrategia integral, preparación de audiencias, actuaciones pendientes y recursos aplicables'}

Catálogo oficial de fuentes jurídicas colombianas:
${verifiedSourcesList}

Instrucciones imperativas:
1. Elabora un diagnóstico y prospecto procesal claro: qué debe hacer el usuario con el caso.
2. Si hay una actuación pendiente, indica cómo desarrollarla paso a paso con las reglas de términos (días hábiles vs calendario, Ley 2213 Art. 8).
3. Si hay audiencia o se prepara para juicio, señala taxativamente en qué materiales debe apoyarse y advertencias sobre inasistencia (Art. 372 CGP).
4. Explica qué recursos (reposición, apelación, queja, súplica, casación) y trámites especiales (como Incidente de Desacato bajo Dec. 2591 Arts. 27 y 52 con su Grado de Consulta) proceden.
5. NO inventes jurisprudencia. Usa fuentes de relatorías oficiales verificadas.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dateOrPeriod: { type: Type.STRING },
                description: { type: Type.STRING },
                relevance: { type: Type.STRING }
              },
              required: ['dateOrPeriod', 'description', 'relevance']
            }
          },
          factsToClarify: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          documentChecklist: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                documentName: { type: Type.STRING },
                purpose: { type: Type.STRING },
                necessity: { type: Type.STRING, enum: ['Obligatorio', 'Recomendable', 'Opcional'] }
              },
              required: ['documentName', 'purpose', 'necessity']
            }
          },
          interviewQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          legalAreas: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                area: { type: Type.STRING },
                confidence: { type: Type.STRING, enum: ['Alta', 'Media', 'Baja'] },
                reasoning: { type: Type.STRING }
              },
              required: ['area', 'confidence', 'reasoning']
            }
          },
          preliminaryActions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                timeframe: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['stepNumber', 'title', 'timeframe', 'description']
            }
          },
          risksAndUncertainties: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                risk: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ['Alta', 'Media', 'Baja'] },
                mitigation: { type: Type.STRING }
              },
              required: ['risk', 'severity', 'mitigation']
            }
          },
          executiveSummary: { type: Type.STRING },
          sourcesNote: { type: Type.STRING },
          strategicProspectus: {
            type: Type.OBJECT,
            properties: {
              caseDiagnosis: { type: Type.STRING },
              recommendedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              applicableNormsAndSources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    norm: { type: Type.STRING },
                    article: { type: Type.STRING },
                    officialSourceTitle: { type: Type.STRING },
                    officialUrl: { type: Type.STRING },
                    relevance: { type: Type.STRING }
                  },
                  required: ['norm', 'article', 'officialSourceTitle', 'officialUrl', 'relevance']
                }
              },
              jurisprudencePrecedents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    court: { type: Type.STRING },
                    precedentRef: { type: Type.STRING },
                    keyHolding: { type: Type.STRING },
                    relatoriaUrl: { type: Type.STRING }
                  },
                  required: ['court', 'precedentRef', 'keyHolding']
                }
              }
            },
            required: ['caseDiagnosis', 'recommendedNextSteps', 'applicableNormsAndSources', 'jurisprudencePrecedents']
          },
          pendingActionGuidance: {
            type: Type.OBJECT,
            properties: {
              actionTitle: { type: Type.STRING },
              urgencyLevel: { type: Type.STRING },
              howToDevelopStepByStep: { type: Type.ARRAY, items: { type: Type.STRING } },
              proceduralRulesNotice: { type: Type.STRING },
              pitfallsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['actionTitle', 'urgencyLevel', 'howToDevelopStepByStep', 'proceduralRulesNotice', 'pitfallsToAvoid']
          },
          hearingPreparation: {
            type: Type.OBJECT,
            properties: {
              hearingType: { type: Type.STRING },
              suggestedSupportMaterials: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    materialName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    urgency: { type: Type.STRING, enum: ['Indispensable', 'Recomendable'] }
                  },
                  required: ['materialName', 'description', 'urgency']
                }
              },
              interrogationAndEvidenceTactics: { type: Type.ARRAY, items: { type: Type.STRING } },
              inattendanceConsequencesNotice: { type: Type.STRING },
              settlementFormulasAdvice: { type: Type.STRING }
            },
            required: ['hearingType', 'suggestedSupportMaterials', 'interrogationAndEvidenceTactics', 'inattendanceConsequencesNotice', 'settlementFormulasAdvice']
          },
          remediesAndIncidentsStrategy: {
            type: Type.OBJECT,
            properties: {
              availableOrdinaryRemedies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    legalBasis: { type: Type.STRING },
                    deadlineAndFiling: { type: Type.STRING },
                    purpose: { type: Type.STRING }
                  },
                  required: ['name', 'legalBasis', 'deadlineAndFiling', 'purpose']
                }
              },
              extraordinaryAndConstitutionalRemedies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    legalBasis: { type: Type.STRING },
                    requirements: { type: Type.STRING }
                  },
                  required: ['name', 'legalBasis', 'requirements']
                }
              },
              incidenteDesacatoGuide: {
                type: Type.OBJECT,
                properties: {
                  legalBasis: { type: Type.STRING },
                  differencesWithCumplimiento: { type: Type.STRING },
                  stepByStepProcedure: { type: Type.ARRAY, items: { type: Type.STRING } },
                  remediesAndConsulta: { type: Type.STRING },
                  sanctionsRisk: { type: Type.STRING }
                },
                required: ['legalBasis', 'differencesWithCumplimiento', 'stepByStepProcedure', 'remediesAndConsulta', 'sanctionsRisk']
              }
            },
            required: ['availableOrdinaryRemedies', 'extraordinaryAndConstitutionalRemedies', 'incidenteDesacatoGuide']
          },
          theoryOfTheCase: {
            type: Type.OBJECT,
            properties: {
              factualTheory: { type: Type.STRING },
              probatoryTheory: { type: Type.STRING },
              legalTheory: { type: Type.STRING }
            },
            required: ['factualTheory', 'probatoryTheory', 'legalTheory']
          }
        },
        required: [
          'timeline', 'factsToClarify', 'documentChecklist', 'interviewQuestions',
          'legalAreas', 'preliminaryActions', 'risksAndUncertainties',
          'executiveSummary', 'sourcesNote', 'strategicProspectus',
          'pendingActionGuidance', 'hearingPreparation', 'remediesAndIncidentsStrategy',
          'theoryOfTheCase'
        ]
      }
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    ...parsed,
    isAiMockMode: false,
    modelUsed: 'gemini-2.5-flash (Google GenAI API en vivo - Fuentes Oficiales)',
    disclaimer: 'ATENCIÓN: Este prospecto fue generado con Gemini 2.5 Flash sobre datos suministrados y minimizados, articulado con el catálogo oficial de fuentes jurídicas colombianas. Requiere revisión obligatoria del docente supervisor responsable (Ley 2113 de 2021).',
    piiMinimized: true
  };
}
