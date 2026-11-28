import type { DropOffStatus, RedemptionStatus } from '../types/recycling';

export const DROP_OFF_STATUS_LABELS: Record<DropOffStatus, string> = {
  CREDITED: 'Points added',
  PENDING_REVIEW: 'Being checked',
  REJECTED: 'Rejected',
};

export const REDEMPTION_STATUS_LABELS: Record<RedemptionStatus, string> = {
  ISSUED: 'Ready to collect',
  COLLECTED: 'Collected',
};

// 1234 -> "1,234"
export function formatPoints(points: number): string {
  return points.toLocaleString('en-US');
}

// 2.5 -> "2.5 kg", 60 -> "60 kg"
export function formatKg(kg: number): string {
  return `${Number(kg.toFixed(2))} kg`;
}

// 2 -> "x2", 1.5 -> "x1.5"
export function formatMultiplier(multiplier: number): string {
  return `x${Number(multiplier.toFixed(1))}`;
}

// The centre operator's centre is remembered on this computer
const CENTRE_KEY = 'ecocycle.centreId';

export function getSavedCentreId(): number | null {
  try {
    const value = localStorage.getItem(CENTRE_KEY);
    return value ? Number(value) : null;
  } catch {
    return null;
  }
}

export function saveCentreId(id: number): void {
  try {
    localStorage.setItem(CENTRE_KEY, String(id));
  } catch {
    // Private mode: just don't remember it
  }
}