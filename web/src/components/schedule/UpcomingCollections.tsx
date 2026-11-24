import { CalendarX2, Clock, Info, Recycle } from 'lucide-react';
import { EmptyState } from '../EmptyState';
import type { UpcomingCollection } from '../../types/schedule';
import { formatDayHeading, formatShortDate, formatTimeRange } from '../../utils/schedule';
import { WasteTypeDot } from './WasteTypeDot';

interface Props {
  collections: UpcomingCollection[];
}

// Groups the collections by date: [{ date, items }, ...] (the backend already sorts them)
function groupByDate(collections: UpcomingCollection[]) {
  const groups: { date: string; items: UpcomingCollection[] }[] = [];
  for (const collection of collections) {
    const last = groups.at(-1);
    if (last?.date === collection.date) {
      last.items.push(collection);
    } else {
      groups.push({ date: collection.date, items: [collection] });
    }
  }
  return groups;
}

// Next collections, one block per day. Used by "My schedule" and the public schedule page.
export function UpcomingCollections({ collections }: Readonly<Props>) {
  if (collections.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="No collections planned"
        message="The council has not added a collection schedule for this area yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      {groupByDate(collections).map((group) => (
        <section key={group.date}>
          <h3 className="mb-2 text-sm font-semibold text-slate-500">{formatDayHeading(group.date)}</h3>
          <div className="space-y-2">
            {group.items.map((item) => (
              <CollectionCard key={`${item.date}-${item.wasteType.id}-${item.originalDate ?? ''}`} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CollectionCard({ item }: Readonly<{ item: UpcomingCollection }>) {
  const cancelled = item.status === 'CANCELLED';

  return (
    <div
      className={`flex gap-4 rounded-2xl border bg-white p-4 shadow-sm ${cancelled ? 'border-red-200 bg-red-50/40' : 'border-slate-200'}`}
    >
      <div className="w-1 shrink-0 rounded-full" style={{ backgroundColor: item.wasteType.color }} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <WasteTypeDot color={item.wasteType.color} />
          <span className={`font-semibold text-slate-900 ${cancelled ? 'line-through decoration-red-400' : ''}`}>
            {item.wasteType.name}
          </span>
          {item.wasteType.recyclable && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              <Recycle className="size-3" /> Recyclable
            </span>
          )}
          {cancelled && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Cancelled</span>
          )}
          {item.status === 'RESCHEDULED' && item.originalDate && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              Moved from {formatShortDate(item.originalDate)}
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
          <Clock className="size-4 text-slate-400" />
          {formatTimeRange(item.startTime, item.endTime)}
        </p>
        {item.note && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-slate-500">
            <Info className="mt-0.5 size-4 shrink-0 text-slate-400" />
            {item.note}
          </p>
        )}
      </div>
    </div>
  );
}