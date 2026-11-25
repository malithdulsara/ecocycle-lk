import type { PickupStatus } from '../types/pickup';

export const PICKUP_STATUS_LABELS: Record<PickupStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  ASSIGNED: 'Driver assigned',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};