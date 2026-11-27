import type { RouteStatus } from '../../types/tracking';
import { ROUTE_STATUS_LABELS } from '../../utils/tracking';

const STATUS_CLASSES: Record<RouteStatus, string> = {
  PLANNED: 'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-sky-100 text-sky-800',
  COMPLETED: 'bg-brand-100 text-brand-800',
};

export function RouteStatusBadge({ status }: Readonly<{ status: RouteStatus }>) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {ROUTE_STATUS_LABELS[status]}
    </span>
  );
}