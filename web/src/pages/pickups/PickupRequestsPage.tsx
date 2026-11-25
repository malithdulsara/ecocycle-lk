import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';
import { pickupApi } from '../../api/pickupApi';
import { userApi } from '../../api/userApi';
import { EmptyState } from '../../components/EmptyState';
import { PickupStatusBadge } from '../../components/pickup/PickupStatusBadge';
import { WasteTypeDot } from '../../components/schedule/WasteTypeDot';
import { PageLoader } from '../../components/Spinner';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { PickupRequest, PickupStatus } from '../../types/pickup';
import { PICKUP_STATUS_LABELS } from '../../utils/pickup';
import { formatShortDate } from '../../utils/schedule';
import { PickupDetailModal } from './PickupDetailModal';

type Filter = PickupStatus | 'ALL';

const FILTERS: Filter[] = ['PENDING', 'APPROVED', 'ASSIGNED', 'COMPLETED', 'REJECTED', 'CANCELLED', 'ALL'];

function loadAll() {
  return pickupApi.getAll();
}

// Council officer / admin: review, approve and assign pickup requests
export function PickupRequestsPage() {
  const { data: requests, setData: setRequests, loading } = useApiData(loadAll, []);
  const { data: drivers } = useApiData(userApi.getDrivers, []);
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [openId, setOpenId] = useState<number | null>(null);

  // How many requests have each status (for the numbers on the tabs)
  const counts = useMemo(() => {
    const result: Record<Filter, number> = {
      ALL: requests.length,
      PENDING: 0,
      APPROVED: 0,
      ASSIGNED: 0,
      COMPLETED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };
    for (const request of requests) {
      result[request.status] += 1;
    }
    return result;
  }, [requests]);

  const visible = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter);
  const openRequest = requests.find((r) => r.id === openId) ?? null;

  // Put the updated request back into the list
  function replace(updated: PickupRequest) {
    setRequests((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <PageHeader title="Pickup requests" description="Special and bulk pickups requested by households." />

      {/* Status tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              filter === f
                ? 'bg-brand-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'All' : PICKUP_STATUS_LABELS[f]}
            <span
              className={`rounded-full px-1.5 text-xs ${filter === f ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Inbox} title="Nothing here" message="No pickup requests with this status." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-200 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Request</th>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Requested by</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/60">
                  <td className="max-w-xs px-5 py-3">
                    <p className="flex items-center gap-2 font-medium text-slate-900">
                      <WasteTypeDot color={request.wasteType.color} />
                      {request.wasteType.name}
                      <span className="text-xs font-normal text-slate-400">#{request.id}</span>
                    </p>
                    <p className="truncate text-xs text-slate-500">{request.description}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{request.wardName}</td>
                  <td className="px-5 py-3 text-slate-600">{request.requesterName}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatShortDate(request.scheduledDate ?? request.preferredDate)}
                    {!request.scheduledDate && <span className="block text-xs text-slate-400">preferred</span>}
                  </td>
                  <td className="px-5 py-3">
                    <PickupStatusBadge status={request.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setOpenId(request.id)}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      {request.status === 'PENDING' ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openRequest && (
        <PickupDetailModal
          key={`${openRequest.id}-${openRequest.status}`}
          request={openRequest}
          drivers={drivers}
          onClose={() => setOpenId(null)}
          onChanged={replace}
        />
      )}
    </div>
  );
}