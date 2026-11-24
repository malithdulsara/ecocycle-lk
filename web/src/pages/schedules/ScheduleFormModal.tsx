import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { scheduleApi } from '../../api/scheduleApi';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { DayOfWeek, Schedule, WasteType } from '../../types/schedule';
import { DAYS } from '../../utils/schedule';

interface Props {
  wardId: number;
  wardName: string;
  wasteTypes: WasteType[];
  // null = add a new collection, otherwise edit this one
  schedule: Schedule | null;
  // Day to pre-select when adding from a day column
  defaultDay: DayOfWeek;
  onClose: () => void;
  onSaved: () => void;
}

const DAY_OPTIONS = DAYS.map((day) => ({ value: day.value, label: day.label }));

export function ScheduleFormModal({
  wardId,
  wardName,
  wasteTypes,
  schedule,
  defaultDay,
  onClose,
  onSaved,
}: Readonly<Props>) {
  const [wasteTypeId, setWasteTypeId] = useState(String(schedule?.wasteType.id ?? wasteTypes[0]?.id ?? ''));
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(schedule?.dayOfWeek ?? defaultDay);
  // The backend sends "08:00:00", the time box wants "08:00"
  const [startTime, setStartTime] = useState(schedule?.startTime.slice(0, 5) ?? '07:00');
  const [endTime, setEndTime] = useState(schedule?.endTime.slice(0, 5) ?? '10:00');
  const [notes, setNotes] = useState(schedule?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const wasteTypeOptions = wasteTypes.map((type) => ({ value: String(type.id), label: type.name }));

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (startTime >= endTime) {
      toast.error('Start time must be before end time');
      return;
    }
    setSaving(true);
    const request = {
      wasteTypeId: Number(wasteTypeId),
      dayOfWeek,
      startTime,
      endTime,
      notes: notes.trim() || null,
    };
    try {
      if (schedule) {
        await scheduleApi.update(schedule.id, request);
        toast.success('Collection updated');
      } else {
        await scheduleApi.create(wardId, request);
        toast.success('Collection added');
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      title={schedule ? 'Edit collection' : 'Add collection'}
      description={`Weekly collection in ${wardName}.`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            id="schedule-type"
            label="Waste type"
            options={wasteTypeOptions}
            value={wasteTypeId}
            onChange={(e) => setWasteTypeId(e.target.value)}
            required
          />
          <SelectInput
            id="schedule-day"
            label="Day"
            options={DAY_OPTIONS}
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="schedule-start"
            label="From"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <TextInput
            id="schedule-end"
            label="To"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        <TextInput
          id="schedule-notes"
          label="Note for residents (optional)"
          placeholder="Keep bins outside by 6:30 AM"
          maxLength={255}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {schedule ? 'Save changes' : 'Add collection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}