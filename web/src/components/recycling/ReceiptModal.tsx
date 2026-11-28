import { Printer, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import type { DropOff } from '../../types/recycling';
import { formatDateTime } from '../../utils/complaint';
import { DropOffItemsTable } from './DropOffItemsTable';
import { DropOffStatusBadge } from './RecyclingBadges';

interface Props {
  dropOff: DropOff;
  onClose: () => void;
}

// The digital receipt of a drop-off
export function ReceiptModal({ dropOff, onClose }: Readonly<Props>) {
  return (
    <Modal open title={`Receipt ${dropOff.receiptNumber}`} description={formatDateTime(dropOff.createdAt)} onClose={onClose}>
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Household</dt>
            <dd className="font-medium text-slate-900">{dropOff.householdName}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Centre</dt>
            <dd className="font-medium text-slate-900">{dropOff.centreName}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Weighed by</dt>
            <dd className="font-medium text-slate-900">{dropOff.operatorName}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Status</dt>
            <dd>
              <DropOffStatusBadge status={dropOff.status} />
            </dd>
          </div>
        </dl>

        <DropOffItemsTable
          items={dropOff.items}
          totalWeightKg={dropOff.totalWeightKg}
          totalPoints={dropOff.totalPoints}
        />

        {dropOff.status === 'PENDING_REVIEW' && (
          <p className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            This is a large drop-off, so a recycler manager checks it before the points are added.
          </p>
        )}
        {dropOff.reviewNote && (
          <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="font-medium">{dropOff.reviewedByName ?? 'Reviewer'}:</span> {dropOff.reviewNote}
          </p>
        )}

        <div className="flex justify-end gap-3 print:hidden">
          <Button variant="secondary" onClick={() => globalThis.print()}>
            <Printer className="size-4" /> Print
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}