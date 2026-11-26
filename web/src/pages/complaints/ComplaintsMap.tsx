import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import { latLngBounds, type LatLngTuple } from 'leaflet';
import { ComplaintStatusBadge, SlaBadge } from '../../components/complaint/ComplaintBadges';
import type { Complaint, ComplaintStatus } from '../../types/complaint';
import { COMPLAINT_CATEGORY_LABELS, COMPLAINT_STATUS_COLORS, COMPLAINT_STATUS_LABELS } from '../../utils/complaint';

// Colombo, used when there are no complaints to show
const DEFAULT_CENTER: LatLngTuple = [6.9271, 79.8612];
const LEGEND: ComplaintStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

interface Props {
  complaints: Complaint[];
  onOpen: (id: number) => void;
}

// Zooms the map so that every complaint is visible
function FitToComplaints({ complaints }: Readonly<{ complaints: Complaint[] }>) {
  const map = useMap();
  useEffect(() => {
    if (complaints.length === 0) {
      return;
    }
    const bounds = latLngBounds(complaints.map((c): LatLngTuple => [c.latitude, c.longitude]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [map, complaints]);
  return null;
}

// Council officer / admin: every complaint as a coloured dot. Overdue ones have a thick red ring.
export function ComplaintsMap({ complaints, onOpen }: Readonly<Props>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer center={DEFAULT_CENTER} zoom={13} className="h-[60vh] min-h-80 w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints.map((complaint) => (
          <CircleMarker
            key={complaint.id}
            center={[complaint.latitude, complaint.longitude]}
            radius={complaint.overdue ? 11 : 9}
            pathOptions={{
              color: complaint.overdue ? '#b91c1c' : '#ffffff',
              weight: complaint.overdue ? 4 : 2,
              fillColor: COMPLAINT_STATUS_COLORS[complaint.status],
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="min-w-44 space-y-1.5">
                <p className="font-semibold text-slate-900">{COMPLAINT_CATEGORY_LABELS[complaint.category]}</p>
                <div className="flex flex-wrap gap-1">
                  <ComplaintStatusBadge status={complaint.status} />
                  <SlaBadge complaint={complaint} />
                </div>
                <p className="line-clamp-2 text-xs text-slate-600">{complaint.description}</p>
                <button
                  type="button"
                  onClick={() => onOpen(complaint.id)}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  Open
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        <FitToComplaints complaints={complaints} />
      </MapContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
        {LEGEND.map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span className="size-3 rounded-full" style={{ backgroundColor: COMPLAINT_STATUS_COLORS[status] }} />
            {COMPLAINT_STATUS_LABELS[status]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full border-[3px] border-red-700 bg-white" />
          Overdue
        </span>
      </div>
    </div>
  );
}