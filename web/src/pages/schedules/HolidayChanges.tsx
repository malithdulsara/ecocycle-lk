import { ArrowRight, CalendarOff, Trash2 } from 'lucide-react';
import type { ScheduleChange } from '../../types/schedule';
import { formatShortDate } from '../../utils/schedule';

interface Props {
  changes: ScheduleChange[];
  onDelete: (change: ScheduleChange) => void;
}

// List of upcoming holiday changes of a council
export function HolidayChanges({ changes, onDelete }: Readonly<Props>) {
  if (changes.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
        <CalendarOff className="size-5 text-slate-400" />
        No holiday changes coming up. Add one for Poya days or public holidays.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {changes.map((change) => (
        <li key={change.id} className="flex items-center gap-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
              <span>{formatShortDate(change.changeDate)}</span>
              {change.changeType === 'RESCHEDULED' && change.newDate && (
                <>
                  <ArrowRight className="size-4 text-slate-400" />
                  <span>{formatShortDate(change.newDate)}</span>
                </>
              )}
              {change.changeType === 'CANCELLED' ? (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                  No collection
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  Moved
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-slate-500">{change.reason}</p>
          </div>
          <button
            onClick={() => onDelete(change)}
            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label={`Delete change on ${change.changeDate}`}
          >
            <Trash2 className="size-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}