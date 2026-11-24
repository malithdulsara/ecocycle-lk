import { useCallback, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, LogIn, MapPin } from 'lucide-react';
import { councilApi } from '../api/councilApi';
import { scheduleApi } from '../api/scheduleApi';
import { wardApi } from '../api/wardApi';
import { Logo } from '../components/Logo';
import { UpcomingCollections } from '../components/schedule/UpcomingCollections';
import { Spinner } from '../components/Spinner';
import { SelectInput } from '../components/ui/form';
import { useApiData } from '../hooks/useApiData';
import type { WardCollections } from '../types/schedule';

const NO_COLLECTIONS: WardCollections | null = null;

// No login needed: anyone can pick their council + ward and see the next collections
export function PublicSchedulePage() {
  const { data: councils, loading } = useApiData(councilApi.getAll, []);
  const [selectedCouncilId, setSelectedCouncilId] = useState<number | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);

  const council = councils.find((c) => c.id === selectedCouncilId) ?? councils[0] ?? null;
  const councilId = council?.id ?? null;

  const loadWards = useCallback(
    () => (councilId ? wardApi.getByCouncil(councilId) : Promise.resolve([])),
    [councilId],
  );
  const { data: wards } = useApiData(loadWards, []);
  const ward = wards.find((w) => w.id === selectedWardId) ?? wards[0] ?? null;
  const wardId = ward?.id ?? null;

  const loadUpcoming = useCallback(
    () => (wardId ? scheduleApi.getUpcoming(wardId, 14) : Promise.resolve(NO_COLLECTIONS)),
    [wardId],
  );
  const { data: upcoming } = useApiData(loadUpcoming, NO_COLLECTIONS);

  const councilOptions = councils.map((c) => ({ value: String(c.id), label: c.name }));
  const wardOptions = wards.map((w) => ({ value: String(w.id), label: w.name }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Logo />
          <NavLink
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            <LogIn className="size-4" /> Sign in
          </NavLink>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <CalendarDays className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Garbage collection schedule</h1>
            <p className="mt-1 text-sm text-slate-500">
              Pick your area to see when each type of waste is collected in the next 2 weeks.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Spinner className="size-8 text-brand-600" />
          </div>
        )}

        {!loading && council && (
          <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
            <SelectInput
              id="public-council"
              label="Council"
              options={councilOptions}
              value={String(council.id)}
              onChange={(e) => {
                setSelectedCouncilId(Number(e.target.value));
                setSelectedWardId(null);
              }}
            />
            {ward && (
              <SelectInput
                id="public-ward"
                label="Your area (ward)"
                options={wardOptions}
                value={String(ward.id)}
                onChange={(e) => setSelectedWardId(Number(e.target.value))}
              />
            )}
          </div>
        )}

        {upcoming && upcoming.wardId === wardId && (
          <>
            <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-slate-600">
              <MapPin className="size-4 text-brand-600" />
              {upcoming.wardName}, {upcoming.councilName}
            </p>
            <UpcomingCollections collections={upcoming.collections} />
          </>
        )}
      </main>
    </div>
  );
}