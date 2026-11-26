import { useState, type SubmitEvent } from 'react';
import { CalendarClock, Clock, Hash, MapPin, Phone, PlayCircle, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/useAuth';
import { getErrorMessage } from '../../api/client';
import { complaintApi } from '../../api/complaintApi';
import { ComplaintStatusBadge, SlaBadge } from '../../components/complaint/ComplaintBadges';
import { LocationMap } from '../../components/map/LocationMap';
import { PhotoThumb } from '../../components/pickup/PhotoThumb';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextAreaInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { User } from '../../types/api';
import type { Complaint, ComplaintPriority } from '../../types/complaint';
import {
  COMPLAINT_CATEGORY_LABELS,
  COMPLAINT_PRIORITY_LABELS,
  formatDateTime,
  isClosed,
} from '../../utils/complaint';

interface Props {
  complaint: Complaint;
  officers: User[];
  onClose: () => void;
  // Called with the updated complaint after assign / start / resolve / reject
  onChanged: (updated: Complaint) => void;
}

type Action = 'resolve' | 'reject' | null;

const PRIORITY_OPTIONS = (Object.keys(COMPLAINT_PRIORITY_LABELS) as ComplaintPriority[]).map((p) => ({
  value: p,
  label: COMPLAINT_PRIORITY_LABELS[p],
}));

// Council officer / admin: see one complaint, assign it and close it
export function ComplaintDetailModal({ complaint, officers, onClose, onChanged }: Readonly<Props>) {
  const { user } = useAuth();
  const [action, setAction] = useState<Action>(null);
  const [officerId, setOfficerId] = useState(String(complaint.officerId ?? officers[0]?.id ?? ''));
  const [priority, setPriority] = useState<ComplaintPriority>(complaint.priority);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  // Runs one API call, shows a message and gives the updated complaint to the page
  async function run(call: () => Promise<Complaint>, message: string) {
    setBusy(true);
    try {
      const updated = await call();
      toast.success(message);
      setAction(null);
      onChanged(updated);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function assign(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => complaintApi.assign(complaint.id, Number(officerId), priority), 'Complaint assigned');
  }

  async function resolve(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => complaintApi.resolve(complaint.id, note), 'Complaint resolved');
  }

  async function reject(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => complaintApi.reject(complaint.id, note), 'Complaint rejected');
  }

  const { status } = complaint;
  const closed = isClosed(status);
  // Only the assigned officer (or an admin) can start and resolve the work
  const canWork = user?.role === 'ADMIN' || (complaint.officerId !== null && complaint.officerId === user?.id);
  const canStart = status === 'ASSIGNED' && canWork;
  const canResolve = (status === 'ASSIGNED' || status === 'IN_PROGRESS') && canWork;
  const officerOptions = officers.map((o) => ({ value: String(o.id), label: o.fullName }));
  const reporter = complaint.anonymous
    ? `${complaint.reporterName ?? 'Anonymous'} (guest)`
    : (complaint.reporterName ?? '-');

  return (
    <Modal open title={COMPLAINT_CATEGORY_LABELS[complaint.category]} onClose={onClose}>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 pb-1">
        {/* Summary */}
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <ComplaintStatusBadge status={status} />
              <SlaBadge complaint={complaint} />
            </div>
            <p className="text-sm text-slate-700">{complaint.description}</p>
          </div>
          {complaint.photoFileName && <PhotoThumb fileName={complaint.photoFileName} className="size-24" />}
        </div>

        <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <Detail icon={Hash} label="Reference" value={complaint.trackingCode} />
          <Detail icon={UserRound} label="Reported by" value={reporter} />
          <Detail icon={Phone} label="Phone" value={complaint.reporterPhone ?? '-'} />
          <Detail
            icon={MapPin}
            label="Area"
            value={complaint.landmark ? `${complaint.landmark} (${complaint.wardName})` : complaint.wardName}
          />
          <Detail icon={CalendarClock} label="Sent" value={formatDateTime(complaint.createdAt)} />
          <Detail
            icon={Clock}
            label={closed ? 'Closed' : 'Fix before'}
            value={formatDateTime(complaint.resolvedAt ?? complaint.slaDueAt)}
          />
          {complaint.officerName && <Detail icon={UserRound} label="Officer" value={complaint.officerName} />}
        </dl>

        {complaint.resolutionNote && (
          <p
            className={`rounded-xl px-3 py-2 text-sm ${status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-brand-50 text-brand-800'}`}
          >
            {status === 'REJECTED' ? 'Rejected: ' : 'Resolved: '}
            {complaint.resolutionNote}
          </p>
        )}

        <LocationMap value={{ latitude: complaint.latitude, longitude: complaint.longitude }} className="h-48" />

        {/* Resolve or reject (with a note) */}
        {action !== null && (
          <form
            onSubmit={action === 'resolve' ? resolve : reject}
            className={`space-y-3 rounded-xl border p-4 ${action === 'resolve' ? 'border-brand-200 bg-brand-50/50' : 'border-red-200 bg-red-50/50'}`}
          >
            <TextAreaInput
              id="complaint-note"
              label={action === 'resolve' ? 'What was done? (the reporter will see this)' : 'Reason (the reporter will see this)'}
              placeholder={action === 'resolve' ? 'Garbage removed and the area cleaned' : 'This is private land, not council property'}
              rows={2}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAction(null)}>
                Back
              </Button>
              <Button type="submit" variant={action === 'resolve' ? 'primary' : 'danger'} loading={busy}>
                {action === 'resolve' ? 'Mark as resolved' : 'Reject complaint'}
              </Button>
            </div>
          </form>
        )}

        {/* Assign an officer (and set the priority) */}
        {action === null && !closed && (
          <form onSubmit={assign} className="rounded-xl border border-slate-200 p-4">
            {officers.length > 0 ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <SelectInput
                    id="assign-officer"
                    label={complaint.officerId ? 'Change officer' : 'Assign to officer'}
                    options={officerOptions}
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                  />
                  <SelectInput
                    id="assign-priority"
                    label="Priority (deadline)"
                    options={PRIORITY_OPTIONS}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  />
                </div>
                <Button type="submit" variant="secondary" loading={busy}>
                  {complaint.officerId ? 'Save' : 'Assign'}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active council officers. An admin must add one first.</p>
            )}
          </form>
        )}
      </div>

      {/* Main buttons */}
      {action === null && !closed && (
        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          <Button variant="dangerGhost" onClick={() => setAction('reject')}>
            Reject
          </Button>
          {canStart && (
            <Button
              variant="secondary"
              loading={busy}
              onClick={() => run(() => complaintApi.start(complaint.id), 'Work started')}
            >
              <PlayCircle className="size-4" /> Start work
            </Button>
          )}
          {canResolve && <Button onClick={() => setAction('resolve')}>Resolve</Button>}
        </div>
      )}
    </Modal>
  );
}

interface DetailProps {
  icon: typeof MapPin;
  label: string;
  value: string;
}

function Detail({ icon: Icon, label, value }: Readonly<DetailProps>) {
  return (
    <div className="flex gap-2">
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="text-slate-800">{value}</dd>
      </div>
    </div>
  );
}