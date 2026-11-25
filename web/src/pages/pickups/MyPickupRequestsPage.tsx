import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarCheck, CalendarDays, Info, MapPin, Plus, Truck, UserRound, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { addressApi } from '../../api/addressApi';
import { getErrorMessage } from '../../api/client';
import { pickupApi } from '../../api/pickupApi';
import { scheduleApi } from '../../api/scheduleApi';
import { EmptyState } from '../../components/EmptyState';
import { PhotoThumb } from '../../components/pickup/PhotoThumb';
import { PickupProgress } from '../../components/pickup/PickupProgress';
import { PickupStatusBadge } from '../../components/pickup/PickupStatusBadge';
import { WasteTypeDot } from '../../components/schedule/WasteTypeDot';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { PickupRequest } from '../../types/pickup';
import { formatShortDate } from '../../utils/schedule';
import { NewPickupModal } from './NewPickupModal';

// "2026-11-27T04:30:00Z" -> "Fri, 27 Nov" in the user's time zone
function formatInstantDate(instant: string): string {
  return new Date(instant).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Household: their special / bulk pickup requests
export function MyPickupRequestsPage() {
  const { data: requests, loading, reload } = useApiData(pickupApi.getMine, []);
  const { data: addresses, loading: loadingAddresses } = useApiData(addressApi.getMine, []);
  const { data: wasteTypes } = useApiData(scheduleApi.getWasteTypes, []);
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState<PickupRequest | null>(null);
  const [busy, setBusy] = useState(false);

  const servedAddresses = addresses.filter((a) => a.wardId !== null);

  async function cancelRequest() {
    if (!cancelling) {
      return;
    }
    setBusy(true);
    try {
      await pickupApi.cancel(cancelling.id);
      toast.success('Request cancelled');
      setCancelling(null);
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (loading || loadingAddresses) {
    return <PageLoader />;
  }

  // Can't request a pickup without an address inside a ward
  if (servedAddresses.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Pickup requests" description="Ask the council to collect bulky or special waste." />
        <EmptyState
          icon={MapPin}
          title="Add your address first"
          message="We need an address inside a council ward we serve before you can request a pickup."
          action={
            <NavLink
              to="/my-addresses"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <MapPin className="size-4" /> Go to My addresses
            </NavLink>
          }
        />
      </div>
    );
  }

  const newButton = (
    <Button onClick={() => setCreating(true)}>
      <Plus className="size-4" /> New request
    </Button>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Pickup requests"
        description="Ask the council to collect bulky or special waste."
        actions={requests.length > 0 ? newButton : undefined}
      />

      {requests.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No requests yet"
          message="Old furniture, garden waste or e-waste? Send a request and the council will come for it."
          action={newButton}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} onCancel={() => setCancelling(request)} />
          ))}
        </div>
      )}

      {creating && (
        <NewPickupModal
          addresses={servedAddresses}
          wasteTypes={wasteTypes}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={cancelling !== null}
        title="Cancel this request?"
        message="The council will not come for this pickup."
        confirmLabel="Cancel request"
        loading={busy}
        onConfirm={cancelRequest}
        onClose={() => setCancelling(null)}
      />
    </div>
  );
}

function RequestCard({ request, onCancel }: Readonly<{ request: PickupRequest; onCancel: () => void }>) {
  const canCancel = request.status === 'PENDING' || request.status === 'APPROVED';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <WasteTypeDot color={request.wasteType.color} />
            <span className="font-semibold text-slate-900">{request.wasteType.name}</span>
            <PickupStatusBadge status={request.status} />
            <span className="text-xs text-slate-400">#{request.id}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700">{request.description}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" /> {request.addressText}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="size-3.5" /> Preferred: {formatShortDate(request.preferredDate)}
            </span>
          </div>
        </div>
        {request.photoFileName && <PhotoThumb fileName={request.photoFileName} />}
      </div>

      <div className="mt-4">
        <PickupProgress status={request.status} />
      </div>

      {/* What the council said */}
      <div className="mt-4 space-y-2 text-sm empty:hidden">
        {request.status === 'COMPLETED' && request.completedAt && (
          <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-brand-800">
            <CalendarCheck className="size-4 shrink-0" />
            Collected on {formatInstantDate(request.completedAt)}
          </p>
        )}
        {request.scheduledDate && (request.status === 'APPROVED' || request.status === 'ASSIGNED') && (
          <p className="flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-brand-800">
            <CalendarCheck className="size-4 shrink-0" />
            Collection on {formatShortDate(request.scheduledDate)}
          </p>
        )}
        {request.driverName && request.status === 'ASSIGNED' && (
          <p className="flex items-center gap-2 text-slate-600">
            <UserRound className="size-4 shrink-0 text-slate-400" /> Driver: {request.driverName}
          </p>
        )}
        {request.staffNote && (
          <p className="flex items-start gap-2 text-slate-600">
            <Info className="mt-0.5 size-4 shrink-0 text-slate-400" /> {request.staffNote}
          </p>
        )}
        {request.rejectionReason && (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-red-700">
            <XCircle className="mt-0.5 size-4 shrink-0" /> {request.rejectionReason}
          </p>
        )}
      </div>

      {canCancel && (
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
          <Button variant="dangerGhost" className="px-3 py-1.5" onClick={onCancel}>
            Cancel request
          </Button>
        </div>
      )}
    </div>
  );
}
