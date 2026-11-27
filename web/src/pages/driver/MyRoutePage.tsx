import { useState } from 'react';
import { CircleStop, MapPin, Play, Radio, Route, TriangleAlert, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { truckApi } from '../../api/truckApi';
import { EmptyState } from '../../components/EmptyState';
import { LocationMap } from '../../components/map/LocationMap';
import { RouteStatusBadge } from '../../components/tracking/RouteStatusBadge';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import { useLocationSharing } from '../../hooks/useLocationSharing';
import { useTick } from '../../hooks/useTick';
import type { CollectionRoute } from '../../types/tracking';
import { secondsSince } from '../../utils/tracking';

// Driver: today's routes. While a route is in progress, the phone's GPS is sent to the fleet map.
export function MyRoutePage() {
  useTick(5000);
  const { data: routes, loading, reload } = useApiData(truckApi.getMyToday, []);
  const [busyId, setBusyId] = useState<number | null>(null);

  const activeRoute = routes.find((r) => r.status === 'IN_PROGRESS') ?? null;
  const sharing = useLocationSharing(activeRoute !== null);

  async function change(route: CollectionRoute, action: 'start' | 'finish') {
    setBusyId(route.id);
    try {
      if (action === 'start') {
        await truckApi.start(route.id);
        toast.success('Route started. Your location is now shared.');
      } else {
        await truckApi.finish(route.id);
        toast.success('Route finished. Location sharing stopped.');
      }
      reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  const secondsAgo = sharing.lastSentAt === null ? null : secondsSince(sharing.lastSentAt);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My route" description="Start your route to share the truck's location with the council." />

      {/* Live sharing panel */}
      {activeRoute && (
        <div className="mb-6 space-y-3 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
              <Radio className="size-5 animate-pulse" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900">Sharing your location</p>
              <p className="text-sm text-slate-600">
                {secondsAgo === null ? 'Waiting for GPS...' : `Last sent ${secondsAgo} s ago · ${sharing.sentCount} points`}
              </p>
            </div>
          </div>
          {sharing.error && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-100 px-3 py-2 text-sm text-amber-900">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {sharing.error}
            </p>
          )}
          <LocationMap value={sharing.position} className="h-56" />
          <p className="text-xs text-slate-500">Keep this page open while you drive.</p>
        </div>
      )}

      {routes.length === 0 ? (
        <EmptyState icon={Route} title="No routes today" message="The council officer has not given you a route for today." />
      ) : (
        <div className="space-y-3">
          {routes.map((route) => (
            <div key={route.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <MapPin className="size-4 text-brand-600" /> {route.wardName}
                    </span>
                    <RouteStatusBadge status={route.status} />
                  </div>
                  <p className="text-sm text-slate-500">{route.councilName}</p>
                  <p className="flex items-center gap-1.5 text-sm text-slate-600">
                    <Truck className="size-4 text-slate-400" />
                    <span className="font-mono">{route.registrationNumber}</span>
                  </p>
                </div>
                {route.status === 'PLANNED' && (
                  <Button
                    loading={busyId === route.id}
                    disabled={activeRoute !== null}
                    onClick={() => change(route, 'start')}
                  >
                    <Play className="size-4" /> Start route
                  </Button>
                )}
                {route.status === 'IN_PROGRESS' && (
                  <Button variant="secondary" loading={busyId === route.id} onClick={() => change(route, 'finish')}>
                    <CircleStop className="size-4" /> Finish route
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}