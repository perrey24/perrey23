import { isColombianJudicialNonWorkingDay } from './colombianHolidays';

export interface TermCalculationResult {
  daysDiff: number; // Negativo = retraso, 0 = hoy, Positivo = días restantes
  urgency: 'vencido' | 'hoy' | 'critico' | 'proximo' | 'a_tiempo' | 'cumplido';
  label: string;
  isProceduralTerm: boolean;
  verificationStatus: 'verificado' | 'pendiente_verificacion';
  legalNote: string;
}

/**
 * Calcula la diferencia en días y determina la urgencia y estado jurídico.
 * @param targetDateStr Fecha límite en formato YYYY-MM-DD
 * @param isCompleted Si la actuación ya fue cumplida
 * @param termType 'dias_calendario' o 'termino_procesal'
 * @param verificationStatus 'verificado' o 'pendiente_verificacion'
 * @param referenceDate Fecha base para el cálculo (por defecto la fecha actual)
 */
export function calculateTermStatus(
  targetDateStr: string,
  isCompleted: boolean,
  termType: 'dias_calendario' | 'termino_procesal',
  verificationStatus: 'verificado' | 'pendiente_verificacion' = 'pendiente_verificacion',
  referenceDate: Date = new Date()
): TermCalculationResult {
  if (isCompleted) {
    return {
      daysDiff: 0,
      urgency: 'cumplido',
      label: 'Cumplido',
      isProceduralTerm: termType === 'termino_procesal',
      verificationStatus,
      legalNote: 'Actuación marcada como ejecutada y verificada por el profesional responsable.'
    };
  }

  // Normalizar fechas a medianoche local
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const parts = targetDateStr.split('-');
  const targetYear = parseInt(parts[0], 10);
  const targetMonth = parseInt(parts[1], 10) - 1;
  const targetDay = parseInt(parts[2], 10);
  const target = new Date(targetYear, targetMonth, targetDay, 0, 0, 0, 0);

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysDiff = Math.round((target.getTime() - ref.getTime()) / msPerDay);

  let urgency: 'vencido' | 'hoy' | 'critico' | 'proximo' | 'a_tiempo' = 'a_tiempo';
  let label = '';

  if (daysDiff < 0) {
    urgency = 'vencido';
    label = `Vencido hace ${Math.abs(daysDiff)} día${Math.abs(daysDiff) === 1 ? '' : 's'}`;
  } else if (daysDiff === 0) {
    urgency = 'hoy';
    label = 'Vence HOY';
  } else if (daysDiff <= 3) {
    urgency = 'critico';
    label = `${daysDiff} día${daysDiff === 1 ? '' : 's'} restante${daysDiff === 1 ? '' : 's'} (Urgente)`;
  } else if (daysDiff <= 7) {
    urgency = 'proximo';
    label = `${daysDiff} días restantes`;
  } else {
    urgency = 'a_tiempo';
    label = `${daysDiff} días restantes`;
  }

  // Generar nota jurídica contextual
  let legalNote = '';
  if (termType === 'dias_calendario') {
    legalNote = 'Contador de días calendario corridos (no constituye término procesal judicial hábil).';
  } else {
    if (verificationStatus === 'pendiente_verificacion') {
      legalNote = '⚠️ Pendiente de verificación jurídica: Este cálculo es preliminar sobre fecha fija registrada. Para constituir término procesal vinculante debe validarse: fecha y constancia de notificación por estado/electrónica (Ley 2213 de 2022), ejecutoria del auto, días hábiles judiciales (CGP Art. 118 / CPACA Art. 119) y posibles suspensiones.';
    } else {
      legalNote = '✅ Término procesal verificado: Se han cotejado las reglas procesales, constancia de notificación y días hábiles de la rama judicial.';
    }
  }

  return {
    daysDiff,
    urgency,
    label,
    isProceduralTerm: termType === 'termino_procesal',
    verificationStatus,
    legalNote
  };
}

/**
 * Guía de términos legales colombianos más frecuentes para auxilio al usuario.
 */
export const COLOMBIAN_LEGAL_TERMS_GUIDE = [
  {
    code: 'TUTELA_1A_INSTANCIA',
    rule: 'Decreto 2591 de 1991, Art. 29',
    name: 'Fallo de Tutela (Primera Instancia)',
    businessDays: 10,
    termType: 'dias_habiles',
    notes: 'Término improrrogable de 10 días hábiles judiciales desde la radicación.'
  },
  {
    code: 'PETICION_GENERAL',
    rule: 'Ley 1755 de 2015, Art. 14 (Sustitutivo CPACA)',
    name: 'Derecho de Petición de Interés General o Particular',
    businessDays: 15,
    termType: 'dias_habiles',
    notes: '15 días hábiles siguientes a la recepción para dar respuesta de fondo.'
  },
  {
    code: 'PETICION_DOCUMENTOS',
    rule: 'Ley 1755 de 2015, Art. 14 num. 1',
    name: 'Petición de Información y Documentos',
    businessDays: 10,
    termType: 'dias_habiles',
    notes: '10 días hábiles. Si no se responde en este término, se entenderá que la solicitud ha sido aceptada y no se podrá negar la entrega.'
  },
  {
    code: 'PETICION_CONSULTAS',
    rule: 'Ley 1755 de 2015, Art. 14 num. 2',
    name: 'Petición de Conceptos / Consultas',
    businessDays: 30,
    termType: 'dias_habiles',
    notes: '30 días hábiles para emitir concepto jurídico por parte de la autoridad.'
  },
  {
    code: 'CGP_EJECUTORIA_AUTO',
    rule: 'Código General del Proceso, Art. 302',
    name: 'Ejecutoria de Autos por Estado',
    businessDays: 3,
    termType: 'dias_habiles',
    notes: 'Quedan ejecutoriados y adquieren firmeza 3 días hábiles después de surtida la notificación por estado.'
  },
  {
    code: 'CGP_REPOSICION_APELACION',
    rule: 'Código General del Proceso, Arts. 318 y 322',
    name: 'Recurso de Reposición y Apelación de Autos',
    businessDays: 3,
    termType: 'dias_habiles',
    notes: 'Debe interponerse y sustentarse dentro de los 3 días hábiles siguientes a la notificación del auto.'
  },
  {
    code: 'NOTIF_ELECTRONICA_LEY2213',
    rule: 'Ley 2213 de 2022, Art. 8',
    name: 'Notificación Personal Electrónica',
    businessDays: 2,
    termType: 'dias_habiles',
    notes: 'La notificación personal se entiende surtida transcurridos 2 días hábiles siguientes al envío del mensaje de datos. Los términos empiezan a correr a partir del día siguiente al que se surtió la notificación.'
  }
];
