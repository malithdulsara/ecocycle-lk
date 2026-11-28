import { useState } from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { dropOffApi } from '../../api/dropOffApi';
import { EmptyState } from '../../components/EmptyState';
import { DropOffItemsTable } from '../../components/recycling/DropOffItemsTable';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { TextAreaInput } from '../../components/ui/form';
import type { DropOff } from '../../types/recycling';
import { formatDateTime } from '../../utils/complaint';

interface Props {
  dropOffs: DropOff[];
  loading: boolean;
  onReviewed: (id: number) => void;
}

// One large drop-off: approve (add the points) or reject
function ReviewCard({ dropOff, onReviewed }: Readonly<{ dropOff: DropOff; onReviewed: (id: number) => void }>) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  async function review(action: 'approve' | 'reject') {
    setBusy(action);
    try {
      if (action === 'approve') {
        await dropOffApi.approve(dropOff.id, note);
        toast.success(`${dropOff.totalPoints} points added for ${dropOff.householdName}`);
      } else {
        await dropOffApi.reject(dropOff.id, note);
        toast.success('Drop-off rejected');
      }
      onReviewed(dropOff.id);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{dropOff.householdName}</p>
          <p className="text-sm text-slate-500">
            {dropOff.centreName} · weighed by {dropOff.operatorName} · {formatDateTime(dropOff.createdAt)}
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500">{dropOff.receiptNumber}</span>
      </div>
      <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" /> {dropOff.reviewReason}
      </p>
      <DropOffItemsTable items={dropOff.items} totalWeightKg={dropOff.totalWeightKg} totalPoints={dropOff.totalPoints} />
      <TextAreaInput
        id={`note-${dropOff.id}`}
        label="Note (needed to reject)"
        rows={2}
        maxLength={255}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-end gap-3">
        <Button
          variant="dangerGhost"
          loading={busy === 'reject'}
          disabled={busy !== null || !note.trim()}
          onClick={() => review('reject')}
        >
          Reject
        </Button>
        <Button loading={busy === 'approve'} disabled={busy !== null} onClick={() => review('approve')}>
          Approve and add points
        </Button>
      </div>
    </div>
  );
}

// Unusual drop-offs (very heavy, many points, many visits in a day) wait here
export function ReviewTab({ dropOffs, loading, onReviewed }: Readonly<Props>) {
  if (loading) {
    return <PageLoader />;
  }
  if (dropOffs.length === 0) {
    return (
      <EmptyState icon={ShieldCheck} title="Nothing to check" message="Large or unusual drop-offs will wait here for you." />
    );
  }
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {dropOffs.map((d) => (
        <ReviewCard key={d.id} dropOff={d} onReviewed={onReviewed} />
      ))}
    </div>
  );
}