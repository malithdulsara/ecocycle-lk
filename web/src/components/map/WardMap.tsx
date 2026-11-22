import { useEffect } from 'react';
import { CircleMarker, MapContainer, Polygon, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import { latLngBounds, type LatLngTuple } from 'leaflet';
import type { LngLat, Ward } from '../../types/admin';

// Colombo, used when there are no wards to show yet
const DEFAULT_CENTER: LatLngTuple = [6.9271, 79.8612];

// Backend sends [longitude, latitude], Leaflet wants [latitude, longitude]
function toLatLng([lng, lat]: LngLat): LatLngTuple {
  return [lat, lng];
}

interface Props {
  wards: Ward[];
  selectedWardId: number | null;
  onSelectWard: (ward: Ward) => void;
  // Drawing mode: the points of the ward being drawn
  drawing: boolean;
  drawPoints: LngLat[];
  onMapClick: (point: LngLat) => void;
}

// Moves the map so that all wards (or the selected ward) are visible
function FitToWards({ wards, selectedWardId }: Readonly<{ wards: Ward[]; selectedWardId: number | null }>) {
  const map = useMap();

  useEffect(() => {
    const visible = selectedWardId ? wards.filter((w) => w.id === selectedWardId) : wards;
    const points = visible.flatMap((w) => (w.boundary ?? []).map(toLatLng));
    if (points.length > 0) {
      map.fitBounds(latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
    }
  }, [map, wards, selectedWardId]);

  return null;
}

// Sends map clicks to the parent while drawing
function ClickHandler({ enabled, onMapClick }: Readonly<{ enabled: boolean; onMapClick: (point: LngLat) => void }>) {
  useMapEvents({
    click(event) {
      if (enabled) {
        // 6 decimal places is about 10 cm, more than enough
        onMapClick([Number(event.latlng.lng.toFixed(6)), Number(event.latlng.lat.toFixed(6))]);
      }
    },
  });
  return null;
}

export function WardMap({ wards, selectedWardId, onSelectWard, drawing, drawPoints, onMapClick }: Readonly<Props>) {
  const drawLatLngs = drawPoints.map(toLatLng);

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={12}
      className={`h-full w-full rounded-2xl ${drawing ? 'cursor-crosshair' : ''}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToWards wards={wards} selectedWardId={selectedWardId} />
      <ClickHandler enabled={drawing} onMapClick={onMapClick} />

      {/* Saved wards */}
      {wards
        .filter((ward) => ward.boundary)
        .map((ward) => {
          const selected = ward.id === selectedWardId;
          return (
            <Polygon
              key={ward.id}
              positions={(ward.boundary ?? []).map(toLatLng)}
              pathOptions={{
                color: selected ? '#047857' : '#10b981',
                weight: selected ? 3 : 2,
                fillOpacity: selected ? 0.35 : 0.15,
              }}
              eventHandlers={{
                click: () => {
                  if (!drawing) {
                    onSelectWard(ward);
                  }
                },
              }}
            >
              <Tooltip sticky>
                {ward.name} ({ward.wardCode})
              </Tooltip>
            </Polygon>
          );
        })}

      {/* The ward being drawn right now (orange) */}
      {drawing && drawLatLngs.length >= 3 && (
        <Polygon positions={drawLatLngs} pathOptions={{ color: '#f59e0b', weight: 2, dashArray: '6 6', fillOpacity: 0.2 }} />
      )}
      {drawing && drawLatLngs.length === 2 && <Polyline positions={drawLatLngs} pathOptions={{ color: '#f59e0b' }} />}
      {drawing &&
        drawLatLngs.map((point) => (
          <CircleMarker
            key={point.join(',')}
            center={point}
            radius={5}
            pathOptions={{ color: '#b45309', fillColor: '#fbbf24', fillOpacity: 1, weight: 2 }}
          />
        ))}
    </MapContainer>
  );
}