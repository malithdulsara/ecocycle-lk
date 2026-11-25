import type { PickupStatus } from '../../types/pickup';
import { PICKUP_STATUS_LABELS } from '../../utils/pickup';

const STATUS_CLASSES: Record<PickupStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-sky-100 text-sky-800',
  ASSIGNED: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-brand-100 text-brand-800',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
};

export function PickupStatusBadge({ status }: Readonly<{ status: PickupStatus }>) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {PICKUP_STATUS_LABELS[status]}
    </span>
  );
}