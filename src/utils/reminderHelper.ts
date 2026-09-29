import { playReminderSound, ReminderSoundId } from './reminderSounds';

export interface ParsedEventDateTime {
  eventDate: Date | null;
  notifyDate: Date | null;
  formattedEventDate: string;
  formattedEventTime: string;
}

/**
 * Standardizes DD/MM/YYYY or YYYY-MM-DD into a Date object
 */
export function parseDateTime(dateStr?: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const cleanDate = dateStr.trim();
  let year = 0;
  let month = 0;
  let day = 0;

  if (cleanDate.includes('/')) {
    const parts = cleanDate.split('/');
    if (parts.length >= 3) {
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    }
  } else if (cleanDate.includes('-')) {
    const parts = cleanDate.split('-');
    if (parts.length >= 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2].substring(0, 2), 10);
    }
  }

  if (!year || isNaN(year) || isNaN(month) || isNaN(day)) {
    const fallback = new Date(dateStr);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  let hours = 9;
  let minutes = 0;
  if (timeStr && timeStr.includes(':')) {
    const timeParts = timeStr.split(':');
    hours = parseInt(timeParts[0], 10) || 0;
    minutes = parseInt(timeParts[1], 10) || 0;
  }

  const d = new Date(year, month, day, hours, minutes, 0);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Calculates notification timestamp based on advanceHours (default 24h)
 */
export function calculateReminderTrigger(
  dateStr?: string,
  timeStr?: string,
  advanceHours: number = 24
): ParsedEventDateTime {
  const eventDate = parseDateTime(dateStr, timeStr);
  if (!eventDate) {
    return {
      eventDate: null,
      notifyDate: null,
      formattedEventDate: dateStr || '',
      formattedEventTime: timeStr || '',
    };
  }

  const notifyTimestamp = eventDate.getTime() - advanceHours * 3600 * 1000;
  const notifyDate = new Date(notifyTimestamp);

  const formattedEventDate = eventDate.toLocaleDateString('pt-BR');
  const formattedEventTime = eventDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    eventDate,
    notifyDate,
    formattedEventDate,
    formattedEventTime,
  };
}

export const ADVANCE_HOURS_OPTIONS = [
  { value: 0, label: 'No momento do compromisso (0h)', short: 'Na hora' },
  { value: 1, label: '1 hora antes', short: '1h antes' },
  { value: 2, label: '2 horas antes', short: '2h antes' },
  { value: 4, label: '4 horas antes', short: '4h antes' },
  { value: 12, label: '12 horas antes', short: '12h antes' },
  { value: 24, label: '24 horas antes (1 dia antes • Padrão)', short: '24h antes (Padrão)' },
  { value: 48, label: '48 horas antes (2 dias antes)', short: '48h antes' },
  { value: 72, label: '72 horas antes (3 dias antes)', short: '3 dias antes' },
  { value: 168, label: '1 semana antes', short: '1 sem. antes' },
];

export function getAdvanceHoursLabel(hours?: number): string {
  if (hours === undefined || hours === null) hours = 24;
  const match = ADVANCE_HOURS_OPTIONS.find((opt) => opt.value === hours);
  if (match) return match.label;
  return `${hours} horas antes`;
}

export function getAdvanceHoursShort(hours?: number): string {
  if (hours === undefined || hours === null) hours = 24;
  const match = ADVANCE_HOURS_OPTIONS.find((opt) => opt.value === hours);
  if (match) return match.short;
  return `${hours}h antes`;
}

/**
 * Ask for device notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Erro ao pedir permissão de notificação:', err);
    return 'denied';
  }
}

/**
 * Triggers native mobile/browser notification if permitted
 */
export function sendNativeNotification(
  title: string,
  body: string,
  soundId: ReminderSoundId = 'gentle_bell'
): boolean {
  // Play sound inside browser context
  playReminderSound(soundId);

  // Vibrate mobile device if supported
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {}
  }

  // OS-level notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        silent: false,
      });
      return true;
    } catch (err) {
      console.warn('Erro ao disparar notificação nativa:', err);
    }
  }

  return false;
}
