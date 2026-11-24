import { MapPin, MapPinOff } from 'lucide-react';
import { getErrorMessage } from '../../api/client';
import { scheduleApi } from '../../api/scheduleApi';
import { EmptyState } from '../../components/EmptyState';
import { PageLoader } from '../../components/Spinner';
import { PageHeader } from '../../components/ui/PageHeader';
import { UpcomingCollections } from '../../components/schedule/UpcomingCollections';
import { useApiData } from '../../hooks/useApiData';
import type { WardCollections } from '../../types/schedule';

interface MySchedule {
  schedule: WardCollections | null;
  problem: string | null; // e.g. "Add your home address first..."
}

// The backend says 400 when the user has no address or it is outside every ward: show that on the page
async function loadMySchedule(): Promise<MySchedule> {
  try {
    return { schedule: await scheduleApi.getMine(14), problem: null };
  } catch (error) {
    return { schedule: null, problem: getErrorMessage(error) };
  }
}

const INITIAL: MySchedule = { schedule: null, problem: null };

// Household: next 2 weeks of collections for the ward of their home address
export function MySchedulePage() {
  const { data, loading } = useApiData(loadMySchedule, INITIAL);
  const { schedule, problem } = data;

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My collection schedule" description="When the truck comes to your area in the next 2 weeks." />

      {problem && <EmptyState icon={MapPinOff} title="We can't find your area" message={problem} />}

      {schedule && (
        <>
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
              <MapPin className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{schedule.wardName}</p>
              <p className="text-sm text-slate-600">{schedule.councilName}</p>
            </div>
          </div>
          <UpcomingCollections collections={schedule.collections} />
        </>
      )}
    </div>
  );
}