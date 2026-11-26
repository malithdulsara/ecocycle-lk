import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types/complaint';

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  MISSED_PICKUP: 'Missed pickup',
  OVERFLOWING_BIN: 'Overflowing bin',
  BURNING_WASTE: 'Burning waste',
  ILLEGAL_DUMPING: 'Illegal dumping',
  DAMAGED_BIN: 'Damaged bin',
  STAFF_BEHAVIOUR: 'Staff behaviour',
  OTHER: 'Other',
};

// In the order shown on the complaint form
export const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'MISSED_PICKUP',
  'ILLEGAL_DUMPING',
  'OVERFLOWING_BIN',
  'BURNING_WASTE',
  'DAMAGED_BIN',
  'STAFF_BEHAVIOUR',
  'OTHER',
];

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};

// Marker colours on the complaints map
export const COMPLAINT_STATUS_COLORS: Record<ComplaintStatus, string> = {
  OPEN: '#dc2626',
  ASSIGNED: '#4f46e5',
  IN_PROGRESS: '#d97706',
  RESOLVED: '#059669',
  REJECTED: '#64748b',
};

export const COMPLAINT_PRIORITY_LABELS: Record<ComplaintPriority, string> = {
  HIGH: 'High (24 hours)',
  MEDIUM: 'Medium (48 hours)',
  LOW: 'Low (72 hours)',
};

export function isClosed(status: ComplaintStatus): boolean {
  return status === 'RESOLVED' || status === 'REJECTED';
}

// "2026-11-26T12:37:31Z" -> "26 Nov, 6:07 pm" in the user's time zone
export function formatDateTime(instant: string): string {
  return new Date(instant).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// 30 hours -> "1 day 6 h", 5 hours -> "5 h", 20 minutes -> "20 min"
function formatDuration(milliseconds: number): string {
  const minutes = Math.round(milliseconds / 60_000);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} h`;
  }
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  const dayText = days === 1 ? '1 day' : `${days} days`;
  return rest > 0 ? `${dayText} ${rest} h` : dayText;
}

// { text: "Due in 5 h", overdue: false } or { text: "Overdue by 1 day 2 h", overdue: true }
export function describeSla(slaDueAt: string): { text: string; overdue: boolean } {
  const left = new Date(slaDueAt).getTime() - Date.now();
  return left >= 0
    ? { text: `Due in ${formatDuration(left)}`, overdue: false }
    : { text: `Overdue by ${formatDuration(-left)}`, overdue: true };
}