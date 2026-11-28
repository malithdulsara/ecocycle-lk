import { DropOffStatusBadge } from '../../components/recycling/RecyclingBadges';
import type { DropOff } from '../../types/recycling';
import { formatDateTime } from '../../utils/complaint';
import { formatKg, formatPoints } from '../../utils/recycling';

interface Props {
  dropOffs: DropOff[];
  onOpen: (dropOff: DropOff) => void;
}

// Centre operator: the last drop-offs they saved
export function RecentDropOffs({ dropOffs, onOpen }: Readonly<Props>) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h3 className="border-b border-slate-100 px-5 py-3 font-semibold text-slate-900">Recent drop-offs</h3>
      {dropOffs.length === 0 ? (
        <p className="px-5 py-4 text-sm text-slate-500">Nothing yet today.</p>
      ) : (
        <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
          {dropOffs.map((d) => (
            <li key={d.id}>
              <button onClick={() => onOpen(d)} className="w-full px-5 py-3 text-left hover:bg-slate-50">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-slate-900">{d.householdName}</span>
                  <span className="shrink-0 text-sm font-semibold text-slate-900">{formatPoints(d.totalPoints)} pts</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    {formatKg(d.totalWeightKg)} · {formatDateTime(d.createdAt)}
                  </span>
                  <DropOffStatusBadge status={d.status} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}