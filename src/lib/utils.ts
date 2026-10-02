import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInMinutes, parse, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDateVN(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'dd/MM/yyyy');
  } catch {
    return '';
  }
}

export function formatTimeVN(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'HH:mm');
  } catch {
    return '';
  }
}

export function formatDateTimeVN(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(d)) return '';
    return format(d, 'HH:mm dd/MM/yyyy');
  } catch {
    return '';
  }
}

/**
 * Calculates Standard hours and Night hours (between 22:00 and 06:00).
 * Iterates by minutes or intervals for precision across midnight boundaries.
 */
export function calculateWorkHours(checkIn: Date, checkOut: Date) {
  if (checkOut <= checkIn) {
    return { totalHours: 0, standardHours: 0, nightHours: 0 };
  }

  const totalMinutes = differenceInMinutes(checkOut, checkIn);
  let nightMinutes = 0;
  let standardMinutes = 0;

  // Step minute-by-minute or in 5-minute chunks for efficiency
  const step = 1; // 1 minute resolution
  const current = new Date(checkIn);

  while (current < checkOut) {
    const hour = current.getHours();
    // Night is between 22:00 (hour 22) and 06:00 (hours 22, 23, 0, 1, 2, 3, 4, 5)
    const isNight = hour >= 22 || hour < 6;

    if (isNight) {
      nightMinutes += step;
    } else {
      standardMinutes += step;
    }

    current.setMinutes(current.getMinutes() + step);
  }

  const totalHours = Number((totalMinutes / 60).toFixed(2));
  const standardHours = Number((standardMinutes / 60).toFixed(2));
  const nightHours = Number((nightMinutes / 60).toFixed(2));

  return {
    totalHours,
    standardHours,
    nightHours,
  };
}

/**
 * Calculates late and early minutes compared to scheduled shift.
 */
export function calculateAttendanceDeviations(
  actualCheckIn: Date,
  actualCheckOut: Date | null,
  shiftDateStr: string,
  startTimeStr: string, // "06:00"
  endTimeStr: string    // "14:00" or "06:00" next day
) {
  let lateMinutes = 0;
  let earlyMinutes = 0;

  try {
    const scheduledStart = parse(`${shiftDateStr} ${startTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());
    if (isValid(scheduledStart)) {
      const diffStart = differenceInMinutes(actualCheckIn, scheduledStart);
      if (diffStart > 0) {
        lateMinutes = diffStart;
      }
    }

    if (actualCheckOut) {
      let scheduledEnd = parse(`${shiftDateStr} ${endTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());
      // Handle night shift crossing midnight (e.g., 22:00 -> 06:00 next day)
      if (endTimeStr < startTimeStr) {
        scheduledEnd = new Date(scheduledEnd.getTime() + 24 * 60 * 60 * 1000);
      }

      if (isValid(scheduledEnd)) {
        const diffEnd = differenceInMinutes(scheduledEnd, actualCheckOut);
        if (diffEnd > 0) {
          earlyMinutes = diffEnd;
        }
      }
    }
  } catch (err) {
    console.error('Error calculating deviations:', err);
  }

  return { lateMinutes, earlyMinutes };
}
