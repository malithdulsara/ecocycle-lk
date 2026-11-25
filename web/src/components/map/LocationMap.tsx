import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngTuple } from 'leaflet';

// Colombo, used before a point is chosen
const DEFAULT_CENTER: LatLngTuple = [6.9271, 79.8612];

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface Props {
  value: LatLng | null;
  // Leave empty for a read-only map
  onChange?: (point: LatLng) => void;
  className?: string;
}

// Moves the map to the chosen point (e.g. after "Use my location")
function FlyToPoint({ value }: Readonly<{ value: LatLng | null }>) {
  const map = useMap();
  const latitude = value?.latitude;
  const longitude = value?.longitude;

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      map.setView([latitude, longitude], Math.max(map.getZoom(), 16));
    }
  }, [map, latitude, longitude]);

  return null;
}

function ClickToChoose({ onChange }: Readonly<{ onChange: (point: LatLng) => void }>) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });
  return null;
}

// Map with one point. Click the map to choose the point (when onChange is given).
export function LocationMap({ value, onChange, className = 'h-64' }: Readonly<Props>) {
  const center: LatLngTuple = value ? [value.latitude, value.longitude] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={value ? 16 : 13}
      className={`w-full rounded-xl border border-slate-200 ${onChange ? 'cursor-crosshair' : ''} ${className}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {value && (
        <CircleMarker
          center={[value.latitude, value.longitude]}
          radius={9}
          pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#059669', fillOpacity: 1 }}
        />
      )}
      <FlyToPoint value={value} />
      {onChange && <ClickToChoose onChange={onChange} />}
    </MapContainer>
  );
}