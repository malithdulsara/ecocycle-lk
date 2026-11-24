import { Pencil, Plus, Trash2 } from 'lucide-react';
import { WasteTypeDot } from '../../components/schedule/WasteTypeDot';
import type { DayOfWeek, Schedule } from '../../types/schedule';
import { DAYS } from '../../utils/schedule';

interface Props {
  schedules: Schedule[];
  onAdd: (day: DayOfWeek) => void;
  onEdit: (schedule: Schedule) => void;
  onDelete: (schedule: Schedule) => void;
}

// Monday to Sunday columns, each with the collections of that day
export function WeeklyTimetable({ schedules, onAdd, onEdit, onDelete }: Readonly<Props>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {DAYS.map((day) => {
        const daySchedules = schedules.filter((schedule) => schedule.dayOfWeek === day.value);
        return (
          <div key={day.value} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700">{day.label}</h4>
              <button
                onClick={() => onAdd(day.value)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-brand-600"
                aria-label={`Add collection on ${day.label}`}
              >
                <Plus className="size-4" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              {daySchedules.length === 0 && <p className="py-3 text-center text-xs text-slate-400">No collection</p>}
              {daySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="group rounded-xl border border-l-4 border-slate-200 bg-white p-2.5 shadow-sm"
                  style={{ borderLeftColor: schedule.wasteType.color }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <WasteTypeDot color={schedule.wasteType.color} className="size-2" />
                      {schedule.wasteType.name}
                    </p>
                    <div className="flex shrink-0">
                      <button
                        onClick={() => onEdit(schedule)}
                        className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Edit ${schedule.wasteType.name} on ${day.label}`}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(schedule)}
                        className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        aria-label={`Delete ${schedule.wasteType.name} on ${day.label}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  {/* 24-hour time keeps the narrow columns tidy: "06:30 - 09:00" */}
                  <p className="mt-1 text-xs font-medium text-slate-500 tabular-nums">
                    {schedule.startTime.slice(0, 5)} - {schedule.endTime.slice(0, 5)}
                  </p>
                  {schedule.notes && <p className="mt-1 text-xs text-slate-400">{schedule.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}