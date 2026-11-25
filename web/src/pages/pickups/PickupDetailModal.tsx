import { useState, type SubmitEvent } from 'react';
import { CalendarDays, CheckCheck, MapPin, Phone, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { pickupApi } from '../../api/pickupApi';
import { LocationMap } from '../../components/map/LocationMap';
import { PhotoThumb } from '../../components/pickup/PhotoThumb';
import { PickupStatusBadge } from '../../components/pickup/PickupStatusBadge';
import { WasteTypeDot } from '../../components/schedule/WasteTypeDot';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { User } from '../../types/api';
import type { PickupRequest } from '../../types/pickup';
import { formatShortDate, todayIso } from '../../utils/schedule';

interface Props {
  request: PickupRequest;
  drivers: User[];
  onClose: () => void;
  // Called with the updated request after approve / reject / assign / complete
  onChanged: (updated: PickupRequest) => void;
}

type Action = 'approve' | 'reject' | null;

// Council officer / admin: see one request and move it to the next status
export function PickupDetailModal({ request, drivers, onClose, onChanged }: Readonly<Props>) {
  const [action, setAction] = useState<Action>(null);
  const [scheduledDate, setScheduledDate] = useState(
    request.preferredDate >= todayIso() ? request.preferredDate : todayIso(),
  );
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');
  const [driverId, setDriverId] = useState(String(request.driverId ?? drivers[0]?.id ?? ''));
  const [busy, setBusy] = useState(false);

  // Runs one API call, shows a message and gives the updated request to the page
  async function run(call: () => Promise<PickupRequest>, message: string) {
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

  async function approve(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => pickupApi.approve(request.id, scheduledDate, note.trim() || null), 'Request approved');
  }

  async function reject(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => pickupApi.reject(request.id, reason), 'Request rejected');
  }

  async function assign(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => pickupApi.assign(request.id, Number(driverId)), 'Driver assigned');
  }

  const { status } = request;
  const canApprove = status === 'PENDING';
  const canAssign = status === 'APPROVED' || status === 'ASSIGNED';
  const canComplete = status === 'ASSIGNED';
  const canReject = status === 'PENDING' || status === 'APPROVED' || status === 'ASSIGNED';
  const driverOptions = drivers.map((d) => ({ value: String(d.id), label: d.fullName }));

  return (
    <Modal open title={`Pickup request #${request.id}`} onClose={onClose}>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 pb-1">
        {/* Summary */}
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <WasteTypeDot color={request.wasteType.color} />
              <span className="font-semibold text-slate-900">{request.wasteType.name}</span>
              <PickupStatusBadge status={status} />
            </div>
            <p className="text-sm text-slate-700">{request.description}</p>
          </div>
          {request.photoFileName && <PhotoThumb fileName={request.photoFileName} className="size-24" />}
        </div>

        <dl className="grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
          <Detail icon={UserRound} label="Requested by" value={request.requesterName} />
          <Detail icon={Phone} label="Phone" value={request.requesterPhone ?? '-'} />
          <Detail icon={MapPin} label="Address" value={`${request.addressText} (${request.wardName})`} />
          <Detail icon={CalendarDays} label="Preferred date" value={formatShortDate(request.preferredDate)} />
          {request.scheduledDate && (
            <Detail icon={CalendarDays} label="Collection date" value={formatShortDate(request.scheduledDate)} />
          )}
          {request.driverName && <Detail icon={UserRound} label="Driver" value={request.driverName} />}
        </dl>

        {request.rejectionReason && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">Rejected: {request.rejectionReason}</p>
        )}

        <LocationMap value={{ latitude: request.latitude, longitude: request.longitude }} className="h-48" />

        {/* Approve */}
        {action === 'approve' && (
          <form onSubmit={approve} className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4">
            <TextInput
              id="approve-date"
              label="Collection date"
              type="date"
              min={todayIso()}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
            <TextInput
              id="approve-note"
              label="Note for the household (optional)"
              placeholder="Keep the items near the gate"
              maxLength={255}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAction(null)}>
                Back
              </Button>
              <Button type="submit" loading={busy}>
                Approve
              </Button>
            </div>
          </form>
        )}

        {/* Reject */}
        {action === 'reject' && (
          <form onSubmit={reject} className="space-y-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
            <TextInput
              id="reject-reason"
              label="Reason (the household will see this)"
              placeholder="We do not collect this type of waste"
              maxLength={255}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setAction(null)}>
                Back
              </Button>
              <Button type="submit" variant="danger" loading={busy}>
                Reject request
              </Button>
            </div>
          </form>
        )}

        {/* Assign driver */}
        {action === null && canAssign && (
          <form onSubmit={assign} className="flex items-end gap-2 rounded-xl border border-slate-200 p-4">
            <div className="flex-1">
              {drivers.length > 0 ? (
                <SelectInput
                  id="assign-driver"
                  label={status === 'ASSIGNED' ? 'Change driver' : 'Assign a driver'}
                  options={driverOptions}
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                />
              ) : (
                <p className="text-sm text-slate-500">No active drivers. An admin must add a driver account first.</p>
              )}
            </div>
            {drivers.length > 0 && (
              <Button type="submit" loading={busy}>
                {status === 'ASSIGNED' ? 'Change' : 'Assign'}
              </Button>
            )}
          </form>
        )}
      </div>

      {/* Main buttons */}
      {action === null && (canApprove || canComplete || canReject) && (
        <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          {canReject && (
            <Button variant="dangerGhost" onClick={() => setAction('reject')}>
              Reject
            </Button>
          )}
          {canComplete && (
            <Button
              variant="secondary"
              loading={busy}
              onClick={() => run(() => pickupApi.complete(request.id), 'Marked as collected')}
            >
              <CheckCheck className="size-4" /> Mark as collected
            </Button>
          )}
          {canApprove && <Button onClick={() => setAction('approve')}>Approve</Button>}
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