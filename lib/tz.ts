// Utilidades de zona horaria — toda la lógica de fechas usa Colombia (UTC-5).
// El kiosco del guardia siempre está en Colombia, pero el admin puede estar
// en otra TZ. Siempre forzamos America/Bogota para evitar inconsistencias.

export const TZ = 'America/Bogota';

const ymd = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const ym = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
});

/** Devuelve "YYYY-MM-DD" para la fecha en zona Colombia. */
export function colDateStr(d: Date | string | number = new Date()): string {
  return ymd.format(new Date(d)); // ya viene "2026-05-08"
}

/** Devuelve "YYYY-MM" para el mes en zona Colombia. */
export function colMonthKey(d: Date | string | number = new Date()): string {
  // ym.format puede dar "05/2026" o "2026-05" según runtime — normalizo:
  return colDateStr(d).slice(0, 7);
}

/** Date de medianoche del día Colombia (00:00:00 -05:00). */
export function colStartOfDay(d: Date | string | number = new Date()): Date {
  return new Date(`${colDateStr(d)}T00:00:00-05:00`);
}

/** Date del primer día del mes Colombia. */
export function colStartOfMonth(d: Date | string | number = new Date()): Date {
  return new Date(`${colMonthKey(d)}-01T00:00:00-05:00`);
}

/** Compara si dos timestamps caen en el mismo día Colombia. */
export function colSameDay(a: Date | string | number, b: Date | string | number): boolean {
  return colDateStr(a) === colDateStr(b);
}
