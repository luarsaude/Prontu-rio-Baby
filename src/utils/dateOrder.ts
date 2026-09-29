/**
 * Utility functions to parse and sort dates and times chronologically in ascending order
 * across all modules and tabs of Prontuário Baby.
 */

export function parseDateAndTimeToTimestamp(dateStr?: string, timeStr?: string): number {
  if (!dateStr || !dateStr.trim()) return 0;

  let cleanDate = dateStr.trim();
  // Handle strings like "28/09/2026 às 14:00" or "28/09/2026 • 14:00"
  if (cleanDate.includes(' às ')) {
    const parts = cleanDate.split(' às ');
    cleanDate = parts[0].trim();
    if (!timeStr && parts[1]) {
      timeStr = parts[1].trim();
    }
  } else if (cleanDate.includes(' • ')) {
    const parts = cleanDate.split(' • ');
    cleanDate = parts[0].trim();
    if (!timeStr && parts[1]) {
      timeStr = parts[1].trim();
    }
  }

  let day = 1;
  let month = 0; // 0-indexed
  let year = 2026;

  if (cleanDate.includes('/')) {
    const parts = cleanDate.split('/');
    if (parts.length >= 3) {
      day = parseInt(parts[0], 10) || 1;
      month = (parseInt(parts[1], 10) || 1) - 1;
      year = parseInt(parts[2].substring(0, 4), 10) || 2026;
    }
  } else if (cleanDate.includes('-')) {
    const parts = cleanDate.split('-');
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        year = parseInt(parts[0], 10) || 2026;
        month = (parseInt(parts[1], 10) || 1) - 1;
        day = parseInt(parts[2].substring(0, 2), 10) || 1;
      } else {
        day = parseInt(parts[0], 10) || 1;
        month = (parseInt(parts[1], 10) || 1) - 1;
        year = parseInt(parts[2].substring(0, 4), 10) || 2026;
      }
    }
  } else {
    const parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime())) {
      year = parsed.getFullYear();
      month = parsed.getMonth();
      day = parsed.getDate();
    }
  }

  let hours = 0;
  let minutes = 0;
  if (timeStr && timeStr.trim()) {
    const cleanTime = timeStr.trim().replace(/[^\d:]/g, '');
    const timeParts = cleanTime.split(':');
    if (timeParts.length >= 2) {
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
    }
  }

  const d = new Date(year, month, day, hours, minutes, 0, 0);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

/**
 * Comparator to sort two items in ASCENDING chronological order (earliest first, latest last).
 */
export function sortByDateAscending<
  T extends {
    date?: string;
    time?: string;
    expectedDate?: string;
    dataVacinacao?: string;
    dataAgendada?: string;
    horaAgendada?: string;
    firstDoseTime?: string;
    createdAt?: string;
  }
>(a: T, b: T): number {
  const dateA = a.date || a.expectedDate || a.dataVacinacao || a.dataAgendada || a.createdAt;
  const timeA = a.time || a.horaAgendada || a.firstDoseTime;
  const dateB = b.date || b.expectedDate || b.dataVacinacao || b.dataAgendada || b.createdAt;
  const timeB = b.time || b.horaAgendada || b.firstDoseTime;

  const tsA = parseDateAndTimeToTimestamp(dateA, timeA);
  const tsB = parseDateAndTimeToTimestamp(dateB, timeB);

  return tsA - tsB;
}
