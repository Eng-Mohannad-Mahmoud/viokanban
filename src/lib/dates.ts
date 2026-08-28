export interface TrelloDateInfo {
  status: 'complete' | 'overdue' | 'due-soon' | 'upcoming' | 'start-only' | 'none';
  displayText: string;
  badgeLabel?: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  isCompleted: boolean;
  colorClass: string;
  iconType: 'clock' | 'alert' | 'check' | 'calendar';
}

/**
 * Evaluates Trello-like date status and formats text & badges
 */
export function getTrelloDateInfo(
  startDate?: string,
  dueDate?: string,
  dueTime?: string,
  dueComplete?: boolean,
  cardCompleted?: boolean
): TrelloDateInfo | null {
  if (!startDate && !dueDate) {
    return null;
  }

  const isCompleted = Boolean(dueComplete || cardCompleted);

  // If only start date is provided
  if (startDate && !dueDate) {
    const sDate = parseLocalDate(startDate);
    const text = sDate
      ? sDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : startDate;

    return {
      status: 'start-only',
      displayText: `Starts ${text}`,
      isOverdue: false,
      isDueSoon: false,
      isCompleted,
      colorClass: isCompleted
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : 'bg-purple-950/70 text-purple-200 border-purple-500/30',
      iconType: isCompleted ? 'check' : 'calendar',
    };
  }

  if (!dueDate) return null;

  const now = new Date();
  const dueDateTime = getDueDateTime(dueDate, dueTime);

  // Date difference in ms
  const diffMs = dueDateTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Check if today / tomorrow / yesterday
  const isToday = isSameDay(dueDateTime, now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = isSameDay(dueDateTime, tomorrow);

  const isPast = diffMs < 0;

  // Build display label
  let dateText = '';
  if (startDate) {
    const sDate = parseLocalDate(startDate);
    const startStr = sDate
      ? sDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      : startDate;
    const dueStr = dueDateTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dateText = `${startStr} - ${dueStr}`;
  } else if (isToday) {
    dateText = 'Today';
  } else if (isTomorrow) {
    dateText = 'Tomorrow';
  } else {
    const currentYear = now.getFullYear();
    const dueYear = dueDateTime.getFullYear();
    if (dueYear !== currentYear) {
      dateText = dueDateTime.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } else {
      dateText = dueDateTime.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  if (dueTime) {
    const [h, m] = dueTime.split(':');
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = m.padStart(2, '0');
    dateText += ` at ${formattedHours}:${formattedMinutes} ${ampm}`;
  }

  if (isCompleted) {
    return {
      status: 'complete',
      displayText: dateText,
      badgeLabel: 'Complete',
      isOverdue: false,
      isDueSoon: false,
      isCompleted: true,
      colorClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/35',
      iconType: 'check',
    };
  }

  if (isPast) {
    return {
      status: 'overdue',
      displayText: dateText,
      badgeLabel: 'Overdue',
      isOverdue: true,
      isDueSoon: false,
      isCompleted: false,
      colorClass: 'bg-rose-500/25 text-rose-300 border-rose-500/40 hover:bg-rose-500/35',
      iconType: 'alert',
    };
  }

  // Due within next 24 hours or today
  if (isToday || (diffHours >= 0 && diffHours <= 24)) {
    return {
      status: 'due-soon',
      displayText: dateText,
      badgeLabel: isToday ? 'Due today' : 'Due soon',
      isOverdue: false,
      isDueSoon: true,
      isCompleted: false,
      colorClass: 'bg-amber-500/25 text-amber-300 border-amber-500/40 hover:bg-amber-500/35',
      iconType: 'clock',
    };
  }

  // Normal upcoming date
  return {
    status: 'upcoming',
    displayText: dateText,
    isOverdue: false,
    isDueSoon: false,
    isCompleted: false,
    colorClass: 'bg-purple-950/70 text-purple-200 border-purple-500/30 hover:bg-purple-900/60',
    iconType: 'clock',
  };
}

function parseLocalDate(dateStr: string): Date | null {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  } catch {
    return null;
  }
}

function getDueDateTime(dueDate: string, dueTime?: string): Date {
  const parts = dueDate.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  let hours = 23;
  let minutes = 59;

  if (dueTime) {
    const tParts = dueTime.split(':');
    if (tParts.length >= 2) {
      hours = parseInt(tParts[0], 10);
      minutes = parseInt(tParts[1], 10);
    }
  }

  return new Date(year, month, day, hours, minutes, 0, 0);
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Returns preset date strings (YYYY-MM-DD) for quick picker options
 */
export function getDatePresets(): { label: string; date: string }[] {
  const format = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const in3Days = new Date(today);
  in3Days.setDate(in3Days.getDate() + 3);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    { label: 'Today', date: format(today) },
    { label: 'Tomorrow', date: format(tomorrow) },
    { label: 'In 3 days', date: format(in3Days) },
    { label: 'Next week', date: format(nextWeek) },
  ];
}
