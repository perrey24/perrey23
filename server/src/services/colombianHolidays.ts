/**
 * Calendario de festivos en Colombia (Ley 51 de 1983 - Ley Emiliani)
 * y cálculo de días hábiles judiciales.
 */

// Función para calcular Pascua (Algoritmo de Meeus/Jones/Butcher)
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Mueve una fecha al siguiente lunes si no cae en lunes (Ley Emiliani)
function moveToNextMonday(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 domingo, 1 lunes...
  if (dayOfWeek === 1) return date;
  const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  return addDays(date, daysToAdd);
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Obtiene el conjunto de días festivos e inhábiles judiciales en Colombia para un año determinado.
 */
export function getColombianHolidays(year: number): Set<string> {
  const holidays = new Set<string>();

  // Festivos fijos
  holidays.add(`${year}-01-01`); // Año Nuevo
  holidays.add(`${year}-05-01`); // Día del Trabajo
  holidays.add(`${year}-07-20`); // Grito de Independencia
  holidays.add(`${year}-08-07`); // Batalla de Boyacá
  holidays.add(`${year}-12-08`); // Inmaculada Concepción
  holidays.add(`${year}-12-25`); // Navidad

  // Festivos que se trasladan al siguiente lunes (Ley Emiliani)
  holidays.add(formatDateKey(moveToNextMonday(new Date(year, 0, 6))));   // Reyes Magos (Ene 6)
  holidays.add(formatDateKey(moveToNextMonday(new Date(year, 2, 19))));  // San José (Mar 19)
  holidays.add(formatDateKey(moveToNextMonday(new Date(year, 5, 29))));  // San Pedro y San Pablo (Jun 29)
  holidays.add(formatDateKey(moveToNextMonday(new Date(year, 7, 15))));  // Asunción de la Virgen (Ago 15)
  holidays.add(formatDateKey(moveToNextMonday(new Date(year, 9, 12))));  // Día de la Raza (Oct 12)
  holidays.add(formatDateKey(moveToNextMonday(new Date(year, 10, 1))));  // Todos los Santos (Nov 1)
  holidays.add(formatDateKey(moveToNextMonday(new Date(year, 10, 11)))); // Independencia de Cartagena (Nov 11)

  // Festivos basados en Pascua
  const easter = getEasterSunday(year);
  holidays.add(formatDateKey(addDays(easter, -3))); // Jueves Santo
  holidays.add(formatDateKey(addDays(easter, -2))); // Viernes Santo
  holidays.add(formatDateKey(moveToNextMonday(addDays(easter, 43)))); // Ascensión del Señor
  holidays.add(formatDateKey(moveToNextMonday(addDays(easter, 64)))); // Corpus Christi
  holidays.add(formatDateKey(moveToNextMonday(addDays(easter, 71)))); // Sagrado Corazón de Jesús

  return holidays;
}

/**
 * Verifica si un día es inhábil judicial (fin de semana o festivo).
 */
export function isColombianJudicialNonWorkingDay(date: Date): boolean {
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return true; // Sábado o Domingo
  }
  const holidays = getColombianHolidays(date.getFullYear());
  const dateKey = formatDateKey(date);
  return holidays.has(dateKey);
}

/**
 * Añade N días hábiles a una fecha dada, respetando fines de semana y festivos en Colombia.
 */
export function addBusinessDays(startDate: Date, businessDays: number): Date {
  let count = 0;
  let current = new Date(startDate);

  while (count < businessDays) {
    current.setDate(current.getDate() + 1);
    if (!isColombianJudicialNonWorkingDay(current)) {
      count++;
    }
  }
  return current;
}
