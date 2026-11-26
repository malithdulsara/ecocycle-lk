import { Clock } from 'lucide-react';
import type { Complaint, ComplaintStatus } from '../../types/complaint';
import { COMPLAINT_STATUS_LABELS, describeSla, isClosed } from '../../utils/complaint';

const STATUS_CLASSES: Record<ComplaintStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  ASSIGNED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  RESOLVED: 'bg-brand-100 text-brand-800',
  REJECTED: 'bg-slate-100 text-slate-600',
};

export function ComplaintStatusBadge({ status }: Readonly<{ status: ComplaintStatus }>) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[status]}`}>
      {COMPLAINT_STATUS_LABELS[status]}
    </span>
  );
}

// Time left to fix it. Red when the deadline has passed. Nothing for closed complaints.
export function SlaBadge({ complaint }: Readonly<{ complaint: Pick<Complaint, 'status' | 'slaDueAt'> }>) {
  if (isClosed(complaint.status)) {
    return null;
  }
  const { text, overdue } = describeSla(complaint.slaDueAt);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        overdue ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
      }`}
    >
      <Clock className="size-3" />
      {text}
    </span>
  );
}