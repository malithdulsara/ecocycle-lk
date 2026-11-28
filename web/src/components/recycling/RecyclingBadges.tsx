import type { DropOffStatus, RedemptionStatus } from '../../types/recycling';
import { DROP_OFF_STATUS_LABELS, REDEMPTION_STATUS_LABELS } from '../../utils/recycling';

const DROP_OFF_CLASSES: Record<DropOffStatus, string> = {
  CREDITED: 'bg-brand-100 text-brand-800',
  PENDING_REVIEW: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-700',
};

const REDEMPTION_CLASSES: Record<RedemptionStatus, string> = {
  ISSUED: 'bg-sky-100 text-sky-800',
  COLLECTED: 'bg-slate-100 text-slate-600',
};

const BADGE = 'inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold';

export function DropOffStatusBadge({ status }: Readonly<{ status: DropOffStatus }>) {
  return <span className={`${BADGE} ${DROP_OFF_CLASSES[status]}`}>{DROP_OFF_STATUS_LABELS[status]}</span>;
}

export function RedemptionStatusBadge({ status }: Readonly<{ status: RedemptionStatus }>) {
  return <span className={`${BADGE} ${REDEMPTION_CLASSES[status]}`}>{REDEMPTION_STATUS_LABELS[status]}</span>;
}