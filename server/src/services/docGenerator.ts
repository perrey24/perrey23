import { DraftTemplateType } from '../types';

export interface DocumentDraftParams {
  templateType: DraftTemplateType;
  city: string;
  date: string;
  recipientName: string;
  recipientTitle?: string;
  recipientEntity?: string;
  recipientAddress?: string;
  recipientEmail?: string;
  authorName: string;
  authorIdType: string;
  authorIdNumber: string;
  authorRole?: string;
  authorEmail: string;
  authorPhone: string;
  authorAddress: string;
  authorProfessionalCard?: string; // T.P. de Abogado si aplica
  representedName?: string; // Si actúa como apoderado judicial
  representedIdType?: string;
  representedIdNumber?: string;
  subject: string;
  facts: string[];
  claims: string[];
  annexes: string[];
  legalGrounds?: string[];
  verifiedGroundsNotes?: string;
  notificationChannels?: string;
}

export function generateLegalDocument(params: DocumentDraftParams): {
  title: string;
  content: string;
  disclaimer: string;
} {
  const disclaimer = `⚠️ AVISO LEGAL DE RESPONSABILIDAD: El presente texto constituye un BORRADOR PRELIMINAR ESTRUCTURADO elaborado con la asistencia del sistema LexFlow Colombia. No constituye asesoría jurídica definitiva ni garantiza éxito procesal. Debe ser revisado, complementado, adaptado a las circunstancias particulares del caso y validado por un abogado titulado con Tarjeta Profesional vigente conforme a la Ley 1123 de 2007 antes de su radicación ante despachos judiciales o autoridades administrativas.`;

  const headerDate = `${params.city || 'Bogotá D.C.'}, ${params.date || new Date().toISOString().split('T')[0]}`;

  let recipientBlock = `Señor(a):\n`;
  if (params.recipientName) recipientBlock += `${params.recipientName.toUpperCase()}\n`;
  if (params.recipientTitle) recipientBlock += `${params.recipientTitle}\n`;
  if (params.recipientEntity) recipientBlock += `${params.recipientEntity}\n`;
  if (params.recipientAddress) recipientBlock += `${params.recipientAddress}\n`;
  if (params.recipientEmail) recipientBlock += `Canal de Notificación Electrónica: ${params.recipientEmail}\n`;
  recipientBlock += `${params.city || 'Ciudad'}.\n`;

  let identificationBlock = '';
  if (params.representedName) {
    identificationBlock = `Yo, ${params.authorName}, mayor de edad, identificado(a) con ${params.authorIdType} N° ${params.authorIdNumber}, abogado(a) en ejercicio portador(a) de la Tarjeta Profesional N° ${params.authorProfessionalCard || '[N° DE TARJETA PROFESIONAL]'} del Consejo Superior de la Judicatura, obrando en mi condición de apoderado(a) especial de ${params.representedName}, identificado(a) con ${params.representedIdType} N° ${params.representedIdNumber}, conforme al poder que adjunto a la presente actuación, comparezco respetuosamente ante su Despacho para manifestar:`;
  } else {
    identificationBlock = `Yo, ${params.authorName}, mayor de edad, identificado(a) con ${params.authorIdType} N° ${params.authorIdNumber}, domiciliado(a) en la ciudad de ${params.city || 'Bogotá D.C.'}, obrando en nombre propio, comparezco respetuosamente ante usted con el fin de manifestar:`;
  }

  const formatList = (items: string[], prefix: string = '') => {
    if (!items || items.length === 0) return '*(No se registraron elementos adicionales)*';
    return items
      .filter(item => item && item.trim().length > 0)
      .map((item, idx) => `${prefix}${idx + 1}. ${item.trim()}`)
      .join('\n\n');
  };

  const factsText = formatList(params.facts, 'PRIMERO: ');
  const claimsText = formatList(params.claims, '');
  const annexesText = formatList(params.annexes, '');

  let defaultLegalGrounds = '';
  let documentTitle = '';

  switch (params.templateType) {
    case 'derecho_peticion':
      documentTitle = `DERECHO DE PETICIÓN - ${params.subject.toUpperCase()}`;
      defaultLegalGrounds = `- Artículo 23 de la Constitución Política de Colombia (Derecho fundamental de toda persona a presentar peticiones respetuosas a las autoridades y a obtener pronta resolución).
- Ley Estatutaria 1755 de 2015, por medio de la cual se regula el Derecho Fundamental de Petición y se sustituye un título del Código de Procedimiento Administrativo y de lo Contencioso Administrativo (CPACA).
- Ley 1437 de 2011 (Código de Procedimiento Administrativo y de lo Contencioso Administrativo - CPACA), en sus normas vigentes sobre notificaciones y trámites administrativos.
- [PENDIENTE DE REVISIÓN]: Citar resoluciones o decretos sectoriales específicos si la materia lo amerita.`;
      break;

    case 'accion_tutela':
      documentTitle = `ACCIÓN DE TUTELA - PROTECCIÓN DE DERECHOS FUNDAMENTALES`;
      defaultLegalGrounds = `- Artículo 86 de la Constitución Política de Colombia (Acción de Tutela como mecanismo constitucional preferente y sumario para la protección inmediata de derechos fundamentales).
- Decreto 2591 de 1991, reglamentario de la acción de tutela (Arts. 1, 5, 10, 14, 29).
- Decreto 1069 de 2015 y Decreto 333 de 2021 (Reglas de reparto de la acción de tutela).
- Precedente Constitucional aplicable: [PENDIENTE DE REVISIÓN JURISPRUDENCIAL - Ingrese número de sentencia de unificación SU o de tutela T de la Corte Constitucional debidamente cotejada].`;
      break;

    case 'solicitud_conciliacion':
      documentTitle = `SOLICITUD DE CONCILIACIÓN EXTRAJUDICIAL EN DERECHO`;
      defaultLegalGrounds = `- Ley 2220 de 2022 (Estatuto de Conciliación en Colombia).
- [PENDIENTE DE REVISIÓN]: Normas sustanciales civiles, comerciales o laborales aplicables al negocio jurídico objeto de la controversia.`;
      break;

    case 'memorial_impulso':
      documentTitle = `MEMORIAL DE IMPULSO PROCESAL Y MANIFESTACIÓN`;
      defaultLegalGrounds = `- Artículo 29 de la Constitución Política de Colombia (Garantía del Debido Proceso y principio de celeridad judicial).
- Artículo 118 y concordantes del Código General del Proceso (Ley 1564 de 2012) o Ley 1437 de 2011 (según la jurisdicción).
- Ley 2213 de 2022 (Vigencia de las tecnologías de la información en las actuaciones judiciales).`;
      break;

    case 'solicitud_informacion':
      documentTitle = `SOLICITUD DE INFORMACIÓN PÚBLICA Y DOCUMENTOS`;
      defaultLegalGrounds = `- Artículo 74 de la Constitución Política de Colombia (Derecho a acceder a los documentos públicos).
- Ley Estatutaria 1712 de 2014 (Ley de Transparencia y del Derecho de Acceso a la Información Pública Nacional).
- Ley 1755 de 2015, Artículo 14 numeral 1 (Término perentorio de 10 días hábiles para entrega de documentos e información).`;
      break;

    case 'comunicacion_oficial':
      documentTitle = `COMUNICACIÓN OFICIAL / DESCARGOS ADMINISTRATIVOS`;
      defaultLegalGrounds = `- Artículo 29 de la Constitución Política de Colombia (Debido Proceso administrativo).
- Ley 1437 de 2011 (CPACA).
- [PENDIENTE DE REVISIÓN]: Normativa específica aplicable a la entidad pública destinataria.`;
      break;

    case 'checklist_documental':
      documentTitle = `LISTA DE VERIFICACIÓN DOCUMENTAL Y RADICACIÓN`;
      defaultLegalGrounds = `- Ley 2213 de 2022, Artículo 6 (Requisitos formales para la radicación digital de demandas y memoriales).
- Código General del Proceso, Artículos 82 y 84 (Requisitos de la demanda y anexos).`;
      break;
  }

  const legalGroundsCombined = params.legalGrounds && params.legalGrounds.length > 0
    ? params.legalGrounds.map(g => `- ${g}`).join('\n')
    : defaultLegalGrounds;

  const notificationsText = params.notificationChannels || `Para efectos de notificaciones y comunicaciones derivadas del presente escrito, señalo los siguientes canales conforme a la Ley 2213 de 2022:
- Correo Electrónico Principal: ${params.authorEmail || '[CORREO ELECTRÓNICO]'}
- Teléfono / WhatsApp: ${params.authorPhone || '[TELÉFONO DE CONTACTO]'}
- Dirección Física: ${params.authorAddress || '[DIRECCIÓN DE DOMICILIO]'}, ${params.city || 'Colombia'}.`;

  const juramentoTutela = params.templateType === 'accion_tutela'
    ? `\n\nJURAMENTO\nBajo la gravedad del juramento, manifiesto que no he interpuesto otra acción de tutela ante ninguna autoridad judicial por los mismos hechos y derechos aquí reclamados, dando estricto cumplimiento a lo preceptuado en el artículo 37 del Decreto 2591 de 1991.\n`
    : '';

  const fullText = `================================================================================
${documentTitle}
================================================================================
${headerDate}

${recipientBlock}

ASUNTO: ${params.subject.toUpperCase()}
REFERENCIA: ${params.representedName ? `Caso de ${params.representedName}` : 'Trámite particular'}

--------------------------------------------------------------------------------
1. IDENTIFICACIÓN Y COMPARECENCIA
--------------------------------------------------------------------------------
${identificationBlock}

--------------------------------------------------------------------------------
2. HECHOS Y ANTECEDENTES
--------------------------------------------------------------------------------
Fundamento la presente solicitud en los siguientes hechos claros, precisos y cronológicamente estructurados:

${factsText}

--------------------------------------------------------------------------------
3. FUNDAMENTOS JURÍDICOS (SUSTENTACIÓN NORMATIVA)
--------------------------------------------------------------------------------
Sustento esta actuación en las siguientes normas constitucionales y legales del ordenamiento jurídico colombiano:

${legalGroundsCombined}

${params.verifiedGroundsNotes ? `Observación sobre fundamentos: ${params.verifiedGroundsNotes}\n` : ''}
*(Nota: Las citas normativas deben ser cotejadas contra el texto vigente oficial y no se deben citar sentencias sin verificar su número y ratio decidendi).*

--------------------------------------------------------------------------------
4. PETICIONES / PRETENSIONES
--------------------------------------------------------------------------------
Con fundamento en los hechos y el derecho expuesto, solicito de manera respetuosa a su Despacho:

${claimsText}
${juramentoTutela}
--------------------------------------------------------------------------------
5. RELACIÓN DE PRUEBAS Y ANEXOS
--------------------------------------------------------------------------------
Para que sean tenidos como medios probatorios conducentes, pertinentes y útiles, aporto los siguientes documentos:

${annexesText}

--------------------------------------------------------------------------------
6. NOTIFICACIONES Y CANALES DIGITALES (LEY 2213 DE 2022)
--------------------------------------------------------------------------------
${notificationsText}

--------------------------------------------------------------------------------
7. SUSCRIPCIÓN Y FIRMA
--------------------------------------------------------------------------------
Del (de la) señor(a) funcionario(a) o destinatario(a), respetuosamente,



___________________________________________________
${params.authorName.toUpperCase()}
${params.authorIdType} N° ${params.authorIdNumber}
${params.authorProfessionalCard ? `T.P. N° ${params.authorProfessionalCard} del C. S. de la Judicatura` : ''}
${params.authorRole ? `Calidad: ${params.authorRole}` : ''}
`;

  return {
    title: documentTitle,
    content: fullText,
    disclaimer
  };
}
