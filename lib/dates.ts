// Shop timezone constant for Fade & Co.
export const SHOP_TIMEZONE = 'Europe/London';

/**
 * Format a Date object into HH:mm format in Europe/London timezone
 */
export function formatTimeLondon(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SHOP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Format a Date object into readable date string (e.g. "Monday, 24 October 2026")
 */
export function formatDateLondon(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: SHOP_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Parses date string "YYYY-MM-DD" and time "HH:MM:SS" or "HH:MM" into a Date object
 * interpreting the inputs in the shop's Europe/London timezone.
 */
export function createLondonDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const tempUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  const londonStr = tempUtc.toLocaleString('en-US', { timeZone: SHOP_TIMEZONE, timeZoneName: 'shortOffset' });
  const match = londonStr.match(/GMT([+-]\d+)?/);
  let offsetHours = 0;
  if (match && match[1]) {
    offsetHours = parseInt(match[1], 10);
  }

  return new Date(Date.UTC(year, month - 1, day, hours - offsetHours, minutes, 0));
}

/**
 * Given a "YYYY-MM-DD" string, gets the day of week index (0=Sunday to 6=Saturday) in London timezone.
 */
export function getDayOfWeekForDate(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.getUTCDay();
}
