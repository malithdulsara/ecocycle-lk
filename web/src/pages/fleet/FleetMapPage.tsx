import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import { latLngBounds, type LatLngTuple } from 'leaflet';
import { Gauge, MapPin, Radio, Truck as TruckIcon, UserRound } from 'lucide-react';
import { trackingApi } from '../../api/trackingApi';
import { truckApi } from '../../api/truckApi';
import { EmptyState } from '../../components/EmptyState';
import { TruckMarker } from '../../components/tracking/TruckMarker';
import { PageLoader } from '../../components/Spinner';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import { useLiveTopic } from '../../hooks/useLiveTopic';
import { useTick } from '../../hooks/useTick';
import type { TrailPoint, TruckPosition } from '../../types/tracking';
import { formatLastSeen, isOffline } from '../../utils/tracking';

const DEFAULT_CENTER: LatLngTuple = [6.9271, 79.8612];
const NO_TRAIL: TrailPoint[] = [];

// Zooms to show every truck, once, when the page opens
function FitOnce({ trucks }: Readonly<{ trucks: TruckPosition[] }>) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    const points = trucks
      .filter((t) => t.latitude !== null && t.longitude !== null)
      .map((t): LatLngTuple => [t.latitude as number, t.longitude as number]);
    if (done.current || points.length === 0) {
      return;
    }
    done.current = true;
    map.fitBounds(latLngBounds(points), { padding: [60, 60], maxZoom: 15 });
  }, [map, trucks]);
  return null;
}

// Moves the map to the selected truck
function FlyTo({ truck }: Readonly<{ truck: TruckPosition | null }>) {
  const map = useMap();
  const latitude = truck?.latitude;
  const longitude = truck?.longitude;
  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.flyTo([latitude, longitude], Math.max(map.getZoom(), 15));
    }
  }, [map, latitude, longitude]);
  return null;
}

function statusOf(truck: TruckPosition): { label: string; className: string } {
  if (truck.routeStatus !== 'IN_PROGRESS') {
    return { label: 'Not on a route', className: 'bg-slate-100 text-slate-600' };
  }
  if (isOffline(truck.lastSeenAt)) {
    return { label: 'No GPS signal', className: 'bg-amber-100 text-amber-800' };
  }
  return { label: 'Live', className: 'bg-sky-100 text-sky-800' };
}

// Officer / admin: every truck on a live map
export function FleetMapPage() {
  useTick(30_000);
  const { data: trucks, setData: setTrucks, loading } = useApiData(trackingApi.getFleet, []);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = trucks.find((t) => t.truckId === selectedId) ?? null;
  const selectedRouteId = selected?.routeStatus === 'IN_PROGRESS' ? selected.routeId : null;

  // The line the selected truck has driven today
  const loadTrail = useCallback(
    () => (selectedRouteId ? truckApi.getTrail(selectedRouteId) : Promise.resolve(NO_TRAIL)),
    [selectedRouteId],
  );
  const { data: trail, setData: setTrail } = useApiData(loadTrail, NO_TRAIL);

  // Live updates from the WebSocket
  const onPosition = useCallback(
    (position: TruckPosition) => {
      setTrucks((list) => {
        const exists = list.some((t) => t.truckId === position.truckId);
        return exists ? list.map((t) => (t.truckId === position.truckId ? position : t)) : [...list, position];
      });
      if (position.routeId === selectedRouteId && position.latitude !== null && position.longitude !== null) {
        const point = { latitude: position.latitude, longitude: position.longitude, recordedAt: position.lastSeenAt ?? '' };
        setTrail((points) => [...points, point]);
      }
    },
    [setTrucks, setTrail, selectedRouteId],
  );
  const connected = useLiveTopic('/topic/fleet', onPosition);

  if (loading) {
    return <PageLoader />;
  }

  const onRoute = trucks.filter((t) => t.routeStatus === 'IN_PROGRESS').length;

  return (
    <div>
      <PageHeader
        title="Fleet map"
        description={`${onRoute} of ${trucks.length} trucks are on a route now.`}
        actions={
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
              connected ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Radio className={`size-4 ${connected ? 'animate-pulse' : ''}`} />
            {connected ? 'Live' : 'Connecting...'}
          </span>
        }
      />

      {trucks.length === 0 ? (
        <EmptyState icon={TruckIcon} title="No trucks yet" message="An admin can add trucks in Trucks & routes." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          {/* Truck list */}
          <ul className="max-h-[30vh] space-y-2 overflow-y-auto lg:max-h-[65vh]">
            {trucks.map((truck) => {
              const status = statusOf(truck);
              const active = truck.truckId === selectedId;
              return (
                <li key={truck.truckId}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(truck.truckId)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      active ? 'border-brand-500 bg-brand-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-slate-900">{truck.registrationNumber}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    {truck.routeStatus === 'IN_PROGRESS' && (
                      <div className="mt-1.5 space-y-0.5 text-xs text-slate-500">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="size-3.5" /> {truck.wardName}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <UserRound className="size-3.5" /> {truck.driverName}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Gauge className="size-3.5" />
                          {truck.speedKmh === null ? '-' : `${Math.round(truck.speedKmh)} km/h`} ·{' '}
                          {formatLastSeen(truck.lastSeenAt)}
                        </p>
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Map */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <MapContainer center={DEFAULT_CENTER} zoom={13} className="h-[60vh] min-h-80 w-full lg:h-[65vh]">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {trail.length > 1 && (
                <Polyline
                  positions={trail.map((p): LatLngTuple => [p.latitude, p.longitude])}
                  pathOptions={{ color: '#0284c7', weight: 4, opacity: 0.6 }}
                />
              )}
              {trucks.map((truck) => (
                <TruckMarker
                  key={truck.truckId}
                  truck={truck}
                  selected={truck.truckId === selectedId}
                  onClick={() => setSelectedId(truck.truckId)}
                />
              ))}
              <FitOnce trucks={trucks} />
              <FlyTo truck={selected} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}