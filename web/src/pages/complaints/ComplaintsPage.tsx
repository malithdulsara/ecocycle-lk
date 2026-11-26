import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { Inbox, List, Map as MapIcon, UserRoundCheck } from 'lucide-react';
import { complaintApi } from '../../api/complaintApi';
import { userApi } from '../../api/userApi';
import { ComplaintStatusBadge, SlaBadge } from '../../components/complaint/ComplaintBadges';
import { EmptyState } from '../../components/EmptyState';
import { PageLoader } from '../../components/Spinner';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { Complaint, ComplaintStatus } from '../../types/complaint';
import { COMPLAINT_CATEGORY_LABELS, COMPLAINT_STATUS_LABELS, formatDateTime } from '../../utils/complaint';
import { ComplaintDetailModal } from './ComplaintDetailModal';
import { ComplaintsMap } from './ComplaintsMap';

type Filter = ComplaintStatus | 'ACTIVE' | 'OVERDUE' | 'ALL';
type View = 'list' | 'map';

const FILTERS: Filter[] = ['ACTIVE', 'OVERDUE', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'ALL'];

const FILTER_LABELS: Record<Filter, string> = {
  ...COMPLAINT_STATUS_LABELS,
  ACTIVE: 'Not closed',
  OVERDUE: 'Overdue',
  ALL: 'All',
};

function matches(complaint: Complaint, filter: Filter): boolean {
  switch (filter) {
    case 'ALL':
      return true;
    case 'ACTIVE':
      return complaint.status !== 'RESOLVED' && complaint.status !== 'REJECTED';
    case 'OVERDUE':
      return complaint.overdue;
    default:
      return complaint.status === filter;
  }
}

// Colour of the number on a tab. The overdue number is red so it stands out.
function countClass(tab: Filter, selected: boolean, count: number): string {
  if (selected) {
    return 'bg-white/20';
  }
  return tab === 'OVERDUE' && count > 0 ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500';
}

// Council officer / admin: all complaints as a list or on a map
export function ComplaintsPage() {
  const [assignedToMe, setAssignedToMe] = useState(false);
  const loadComplaints = useCallback(() => complaintApi.getAll(assignedToMe), [assignedToMe]);
  const { data: complaints, setData: setComplaints, loading } = useApiData(loadComplaints, []);
  const { data: officers } = useApiData(userApi.getOfficers, []);
  const [filter, setFilter] = useState<Filter>('ACTIVE');
  const [view, setView] = useState<View>('list');
  const [openId, setOpenId] = useState<number | null>(null);

  // How many complaints match each tab (for the numbers on the tabs)
  const counts = useMemo(() => {
    const result = {} as Record<Filter, number>;
    for (const f of FILTERS) {
      result[f] = complaints.filter((c) => matches(c, f)).length;
    }
    return result;
  }, [complaints]);

  const visible = complaints.filter((c) => matches(c, filter));
  const openComplaint = complaints.find((c) => c.id === openId) ?? null;

  // Put the updated complaint back into the list
  function replace(updated: Complaint) {
    setComplaints((list) => list.map((c) => (c.id === updated.id ? updated : c)));
  }

  const viewToggle = (
    <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <ToggleButton active={view === 'list'} onClick={() => setView('list')}>
        <List className="size-4" /> List
      </ToggleButton>
      <ToggleButton active={view === 'map'} onClick={() => setView('map')}>
        <MapIcon className="size-4" /> Map
      </ToggleButton>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Complaints"
        description="Missed pickups, illegal dumping and other problems reported by the public."
        actions={viewToggle}
      />

      <button
        type="button"
        aria-pressed={assignedToMe}
        onClick={() => setAssignedToMe((value) => !value)}
        className={`mb-3 inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
          assignedToMe
            ? 'border-brand-500 bg-brand-50 text-brand-800'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        <UserRoundCheck className="size-4" />
        {assignedToMe ? 'Showing only complaints assigned to me' : 'Show only complaints assigned to me'}
      </button>

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
            {FILTER_LABELS[f]}
            <span className={`rounded-full px-1.5 text-xs ${countClass(f, filter === f, counts[f])}`}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading && <PageLoader />}

      {!loading && view === 'map' && <ComplaintsMap complaints={visible} onOpen={setOpenId} />}

      {!loading && view === 'list' && visible.length === 0 && (
        <EmptyState icon={Inbox} title="Nothing here" message="No complaints in this list." />
      )}

      {!loading && view === 'list' && visible.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-200 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Complaint</th>
                <th className="px-5 py-3">Area</th>
                <th className="px-5 py-3">Reported by</th>
                <th className="px-5 py-3">Officer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((complaint) => (
                <tr key={complaint.id} className="hover:bg-slate-50/60">
                  <td className="max-w-xs px-5 py-3">
                    <p className="font-medium text-slate-900">
                      {COMPLAINT_CATEGORY_LABELS[complaint.category]}
                      <span className="ml-2 font-mono text-xs font-normal text-slate-400">{complaint.trackingCode}</span>
                    </p>
                    <p className="truncate text-xs text-slate-500">{complaint.description}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{complaint.wardName}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {complaint.anonymous ? 'Guest' : complaint.reporterName}
                    <span className="block text-xs text-slate-400">{formatDateTime(complaint.createdAt)}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{complaint.officerName ?? '-'}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <ComplaintStatusBadge status={complaint.status} />
                      <SlaBadge complaint={complaint} />
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setOpenId(complaint.id)}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      {complaint.status === 'OPEN' ? 'Review' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openComplaint && (
        <ComplaintDetailModal
          key={`${openComplaint.id}-${openComplaint.status}-${openComplaint.officerId}`}
          complaint={openComplaint}
          officers={officers}
          onClose={() => setOpenId(null)}
          onChanged={replace}
        />
      )}
    </div>
  );
}

interface ToggleProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToggleButton({ active, onClick, children }: Readonly<ToggleProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        active ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}