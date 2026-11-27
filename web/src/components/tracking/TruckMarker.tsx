import { CircleMarker, Tooltip } from 'react-leaflet';
import type { TruckPosition } from '../../types/tracking';
import { isOffline } from '../../utils/tracking';

interface Props {
  truck: TruckPosition;
  selected?: boolean;
  onClick?: () => void;
}

// A truck on the map: blue when sending GPS, grey when offline. The number plate is always shown.
export function TruckMarker({ truck, selected = false, onClick }: Readonly<Props>) {
  if (truck.latitude === null || truck.longitude === null) {
    return null;
  }
  const offline = truck.routeStatus !== 'IN_PROGRESS' || isOffline(truck.lastSeenAt);
  return (
    <CircleMarker
      center={[truck.latitude, truck.longitude]}
      radius={selected ? 12 : 9}
      pathOptions={{
        color: '#ffffff',
        weight: 3,
        fillColor: offline ? '#94a3b8' : '#0284c7',
        fillOpacity: 1,
      }}
      eventHandlers={onClick ? { click: onClick } : undefined}
    >
      <Tooltip permanent direction="top" offset={[0, -10]}>
        {truck.registrationNumber}
      </Tooltip>
    </CircleMarker>
  );
}