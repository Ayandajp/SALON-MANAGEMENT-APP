import type { DateRange } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getDateRangeFilter(range: DateRange, customStart?: string, customEnd?: string) {
  const now = new Date();
  let start: Date;
  let end: Date = now;

  switch (range) {
    case 'today':
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'custom':
      start = customStart ? new Date(customStart) : new Date(0);
      end = customEnd ? new Date(customEnd) : new Date();
      break;
    default:
      start = new Date(0);
  }

  return { start, end };
}

export function isInDateRange(dateStr: string, start: Date, end: Date): boolean {
  const date = new Date(dateStr);
  return date >= start && date <= end;
}
