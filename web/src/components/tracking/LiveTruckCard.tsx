import { useCallback, useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { latLngBounds, type LatLngTuple } from 'leaflet';
import { Radio, Truck } from 'lucide-react';
import { trackingApi } from '../../api/trackingApi';
import { useApiData } from '../../hooks/useApiData';
import { useLiveTopic } from '../../hooks/useLiveTopic';
import { useTick } from '../../hooks/useTick';
import type { TruckEta, TruckPosition, WardTrucks } from '../../types/tracking';
import { distanceKm, etaMinutes, formatEta, formatLastSeen } from '../../utils/tracking';
import { TruckMarker } from './TruckMarker';

const NOTHING: WardTrucks | null = null;

// No address / outside every ward: just hide the card (the schedule page already explains it)
async function loadMyWard(): Promise<WardTrucks | null> {
  try {
    return await trackingApi.getMyWard();
  } catch {
    return null;
  }
}

function withEta(truck: TruckPosition, home: WardTrucks): TruckEta {
  if (truck.latitude === null || truck.longitude === null) {
    return { truck, distanceKm: null, etaMinutes: null };
  }
  const km = distanceKm(truck.latitude, truck.longitude, home.homeLatitude, home.homeLongitude);
  return { truck, distanceKm: Math.round(km * 100) / 100, etaMinutes: etaMinutes(km) };
}

// Shows the house and the trucks together
function FitHomeAndTrucks({ home, trucks }: Readonly<{ home: LatLngTuple; trucks: TruckEta[] }>) {
  const map = useMap();
  const truckPoints = trucks
    .filter((t) => t.truck.latitude !== null && t.truck.longitude !== null)
    .map((t) => `${t.truck.latitude},${t.truck.longitude}`)
    .join(';');
  useEffect(() => {
    const points: LatLngTuple[] = [home];
    for (const pair of truckPoints.split(';').filter(Boolean)) {
      const [lat, lng] = pair.split(',').map(Number);
      points.push([lat, lng]);
    }
    map.fitBounds(latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
  }, [map, home, truckPoints]);
  return null;
}

// Household: is a truck collecting in my ward right now, and when will it reach my house?
export function LiveTruckCard() {
  useTick(30_000);
  const { data, setData, loading } = useApiData(loadMyWard, NOTHING);

  // Live updates for my ward
  const onPosition = useCallback(
    (position: TruckPosition) => {
      setData((current) => {
        if (!current) {
          return current;
        }
        const others = current.trucks.filter((t) => t.truck.truckId !== position.truckId);
        const trucks = position.routeStatus === 'IN_PROGRESS' ? [...others, withEta(position, current)] : others;
        trucks.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
        return { ...current, trucks };
      });
    },
    [setData],
  );
  const connected = useLiveTopic(data ? `/topic/wards/${data.wardId}` : null, onPosition);

  if (loading || !data) {
    return null;
  }

  const home: LatLngTuple = [data.homeLatitude, data.homeLongitude];
  const nearest = data.trucks[0] ?? null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
              nearest ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Truck className="size-5" />
          </span>
          <div>
            {nearest ? (
              <>
                <p className="font-semibold text-slate-900">
                  The truck is{' '}
                  {nearest.etaMinutes === null ? 'on its way' : `${formatEta(nearest.etaMinutes)} away`}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-mono">{nearest.truck.registrationNumber}</span>
                  {nearest.distanceKm !== null && ` · ${nearest.distanceKm.toFixed(1)} km`} · updated{' '}
                  {formatLastSeen(nearest.truck.lastSeenAt)}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-slate-900">No truck in {data.wardName} right now</p>
                <p className="text-sm text-slate-600">This card updates by itself when a truck starts its route.</p>
              </>
            )}
          </div>
        </div>
        {connected && (
          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-brand-700">
            <Radio className="size-3.5 animate-pulse" /> Live
          </span>
        )}
      </div>

      {nearest && (
        <MapContainer center={home} zoom={15} className="h-56 w-full border-t border-slate-100">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <CircleMarker
            center={home}
            radius={8}
            pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#059669', fillOpacity: 1 }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]}>
              Home
            </Tooltip>
          </CircleMarker>
          {data.trucks.map((eta) => (
            <TruckMarker key={eta.truck.truckId} truck={eta.truck} />
          ))}
          <FitHomeAndTrucks home={home} trucks={data.trucks} />
        </MapContainer>
      )}
    </div>
  );
}