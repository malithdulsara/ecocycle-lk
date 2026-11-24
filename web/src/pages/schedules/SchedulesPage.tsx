import { useCallback, useState } from 'react';
import { CalendarPlus, MapPinned, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { councilApi } from '../../api/councilApi';
import { scheduleApi } from '../../api/scheduleApi';
import { wardApi } from '../../api/wardApi';
import { EmptyState } from '../../components/EmptyState';
import { WasteTypeDot } from '../../components/schedule/WasteTypeDot';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SelectInput } from '../../components/ui/form';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { DayOfWeek, Schedule, ScheduleChange } from '../../types/schedule';
import { DAYS } from '../../utils/schedule';
import { HolidayChanges } from './HolidayChanges';
import { ScheduleChangeModal } from './ScheduleChangeModal';
import { ScheduleFormModal } from './ScheduleFormModal';
import { WeeklyTimetable } from './WeeklyTimetable';

// What the add/edit popup is showing. null = closed
type FormState = { schedule: Schedule | null; day: DayOfWeek } | null;

// Council officer / admin: weekly collection timetable of each ward + holiday changes
export function SchedulesPage() {
  const { data: councils, loading } = useApiData(councilApi.getAll, []);
  const { data: wasteTypes } = useApiData(scheduleApi.getWasteTypes, []);

  const [selectedCouncilId, setSelectedCouncilId] = useState<number | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);

  // Until the user picks one, use the first council / ward in the list
  const council = councils.find((c) => c.id === selectedCouncilId) ?? councils[0] ?? null;
  const councilId = council?.id ?? null;

  const loadWards = useCallback(
    () => (councilId ? wardApi.getByCouncil(councilId) : Promise.resolve([])),
    [councilId],
  );
  const { data: wards } = useApiData(loadWards, []);
  const ward = wards.find((w) => w.id === selectedWardId) ?? wards[0] ?? null;
  const wardId = ward?.id ?? null;

  const loadSchedules = useCallback(
    () => (wardId ? scheduleApi.getByWard(wardId) : Promise.resolve([])),
    [wardId],
  );
  const { data: schedules, reload: reloadSchedules } = useApiData(loadSchedules, []);

  const loadChanges = useCallback(
    () => (councilId ? scheduleApi.getChanges(councilId) : Promise.resolve([])),
    [councilId],
  );
  const { data: changes, reload: reloadChanges } = useApiData(loadChanges, []);

  const [form, setForm] = useState<FormState>(null);
  const [changeFormOpen, setChangeFormOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<Schedule | null>(null);
  const [deletingChange, setDeletingChange] = useState<ScheduleChange | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function deleteSchedule() {
    if (!deletingSchedule) {
      return;
    }
    setDeleting(true);
    try {
      await scheduleApi.remove(deletingSchedule.id);
      toast.success('Collection deleted');
      setDeletingSchedule(null);
      reloadSchedules();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  async function deleteChange() {
    if (!deletingChange) {
      return;
    }
    setDeleting(true);
    try {
      await scheduleApi.removeChange(deletingChange.id);
      toast.success('Holiday change deleted');
      setDeletingChange(null);
      reloadChanges();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  if (!council) {
    return (
      <EmptyState icon={MapPinned} title="No councils yet" message="An admin must add a council and its wards first." />
    );
  }

  const councilOptions = councils.map((c) => ({ value: String(c.id), label: c.name }));
  const wardOptions = wards.map((w) => ({ value: String(w.id), label: `${w.name} (${w.wardCode})` }));

  return (
    <div className="space-y-6">
      <PageHeader title="Collection schedules" description="Weekly collection days for each ward, and holiday changes." />

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <SelectInput
          id="schedule-council"
          label="Council"
          options={councilOptions}
          value={String(council.id)}
          onChange={(e) => {
            setSelectedCouncilId(Number(e.target.value));
            setSelectedWardId(null);
          }}
        />
        {wards.length > 0 && ward && (
          <SelectInput
            id="schedule-ward"
            label="Ward"
            options={wardOptions}
            value={String(ward.id)}
            onChange={(e) => setSelectedWardId(Number(e.target.value))}
          />
        )}
      </div>

      {ward ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Weekly timetable: {ward.name}</h3>
              <p className="text-sm text-slate-500">Repeats every week.</p>
            </div>
            <Button onClick={() => setForm({ schedule: null, day: DAYS[0].value })}>
              <Plus className="size-4" /> Add collection
            </Button>
          </div>

          <WeeklyTimetable
            schedules={schedules}
            onAdd={(day) => setForm({ schedule: null, day })}
            onEdit={(schedule) => setForm({ schedule, day: schedule.dayOfWeek })}
            onDelete={setDeletingSchedule}
          />

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4">
            {wasteTypes.map((type) => (
              <span key={type.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                <WasteTypeDot color={type.color} />
                {type.name}
              </span>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={MapPinned}
          title="No wards in this council"
          message="An admin must draw the wards on the map first (Admin > Councils)."
        />
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Holiday changes</h3>
            <p className="text-sm text-slate-500">Applies to every ward in {council.name}.</p>
          </div>
          <Button variant="secondary" onClick={() => setChangeFormOpen(true)}>
            <CalendarPlus className="size-4" /> Add change
          </Button>
        </div>
        <HolidayChanges changes={changes} onDelete={setDeletingChange} />
      </section>

      {form && ward && (
        <ScheduleFormModal
          wardId={ward.id}
          wardName={ward.name}
          wasteTypes={wasteTypes}
          schedule={form.schedule}
          defaultDay={form.day}
          onClose={() => setForm(null)}
          onSaved={() => {
            setForm(null);
            reloadSchedules();
          }}
        />
      )}

      {changeFormOpen && (
        <ScheduleChangeModal
          councilId={council.id}
          councilName={council.name}
          onClose={() => setChangeFormOpen(false)}
          onSaved={() => {
            setChangeFormOpen(false);
            reloadChanges();
          }}
        />
      )}

      <ConfirmDialog
        open={deletingSchedule !== null}
        title="Delete collection?"
        message={`${deletingSchedule?.wasteType.name ?? ''} collection on ${deletingSchedule?.dayOfWeek.toLowerCase() ?? ''} will be removed.`}
        loading={deleting}
        onConfirm={deleteSchedule}
        onClose={() => setDeletingSchedule(null)}
      />

      <ConfirmDialog
        open={deletingChange !== null}
        title="Delete holiday change?"
        message="Collections will go back to the normal weekly timetable for that day."
        loading={deleting}
        onConfirm={deleteChange}
        onClose={() => setDeletingChange(null)}
      />
    </div>
  );
}