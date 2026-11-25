import { useState } from 'react';
import { CalendarDays, CheckCheck, MapPin, Navigation, PackageCheck, Phone, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { pickupApi } from '../../api/pickupApi';
import { EmptyState } from '../../components/EmptyState';
import { PhotoThumb } from '../../components/pickup/PhotoThumb';
import { WasteTypeDot } from '../../components/schedule/WasteTypeDot';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { PickupRequest } from '../../types/pickup';
import { formatDayHeading } from '../../utils/schedule';

// Opens Google Maps with directions to the pickup
function directionsUrl(request: PickupRequest): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`;
}

// Driver: special pickups assigned to them
export function DriverPickupsPage() {
  const { data: pickups, setData: setPickups, loading } = useApiData(pickupApi.getAssigned, []);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Done pickups leave this list
  async function complete(pickup: PickupRequest) {
    setBusyId(pickup.id);
    try {
      await pickupApi.complete(pickup.id);
      toast.success('Pickup marked as collected');
      setPickups((list) => list.filter((p) => p.id !== pickup.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My pickups" description="Special pickups the council assigned to you." />

      {pickups.length === 0 ? (
        <EmptyState icon={PackageCheck} title="All done" message="You have no special pickups right now." />
      ) : (
        <div className="space-y-4">
          {pickups.map((pickup) => (
            <div key={pickup.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                    <CalendarDays className="size-4" />
                    {pickup.scheduledDate ? formatDayHeading(pickup.scheduledDate) : 'No date yet'}
                  </p>
                  <div className="flex items-center gap-2">
                    <WasteTypeDot color={pickup.wasteType.color} />
                    <span className="font-semibold text-slate-900">{pickup.wasteType.name}</span>
                    <span className="text-xs text-slate-400">#{pickup.id}</span>
                  </div>
                  <p className="text-sm text-slate-700">{pickup.description}</p>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0 text-slate-400" /> {pickup.addressText}
                    </p>
                    <p className="flex items-center gap-2">
                      <UserRound className="size-4 shrink-0 text-slate-400" /> {pickup.requesterName}
                      {pickup.requesterPhone && (
                        <a
                          href={`tel:${pickup.requesterPhone}`}
                          className="inline-flex items-center gap-1 font-medium text-brand-700"
                        >
                          <Phone className="size-3.5" /> {pickup.requesterPhone}
                        </a>
                      )}
                    </p>
                  </div>
                  {pickup.staffNote && <p className="text-sm text-slate-500">Note: {pickup.staffNote}</p>}
                </div>
                {pickup.photoFileName && <PhotoThumb fileName={pickup.photoFileName} className="size-24" />}
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
                <a
                  href={directionsUrl(pickup)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Navigation className="size-4" /> Directions
                </a>
                <Button loading={busyId === pickup.id} onClick={() => complete(pickup)}>
                  <CheckCheck className="size-4" /> Mark as collected
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}