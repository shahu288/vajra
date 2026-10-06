/**
 * Returns the current date in local YYYY-MM-DD format.
 * Essential for querying daily logs.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculates current streak length from a sorted list of completed dates.
 * completedDates: array of date strings ("YYYY-MM-DD") sorted descending (latest first).
 */
export function calculateCurrentStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // If the user hasn't completed anything today or yesterday, their streak is broken.
  if (completedDates[0] !== todayStr && completedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = parseLocalDateString(completedDates[0]);

  for (let i = 0; i < completedDates.length; i++) {
    const checkDateStr = completedDates[i];
    const checkDate = parseLocalDateString(checkDateStr);
    
    // Calculate difference in calendar days
    const diffTime = Math.abs(currentDate.getTime() - checkDate.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (i === 0) {
      streak = 1;
    } else if (diffDays === 1) {
      streak++;
      currentDate = checkDate;
    } else if (diffDays === 0) {
      // Duplicate entry, skip without breaking
      continue;
    } else {
      // Gap in streak
      break;
    }
  }

  return streak;
}

/**
 * Formats standard time picker strings (HH:MM:SS) for displaying.
 */
export function formatTimePickerValue(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  
  const hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour}:${minute} ${ampm}`;
}
