import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { scheduleApi } from '../../api/scheduleApi';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { ChangeType } from '../../types/schedule';
import { todayIso } from '../../utils/schedule';

interface Props {
  councilId: number;
  councilName: string;
  onClose: () => void;
  onSaved: () => void;
}

const TYPE_OPTIONS = [
  { value: 'CANCELLED', label: 'No collection on this day' },
  { value: 'RESCHEDULED', label: 'Move collection to another day' },
];

// Holiday change (e.g. Poya day) for every ward of the council
export function ScheduleChangeModal({ councilId, councilName, onClose, onSaved }: Readonly<Props>) {
  const today = todayIso();
  const [changeDate, setChangeDate] = useState('');
  const [changeType, setChangeType] = useState<ChangeType>('CANCELLED');
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const rescheduling = changeType === 'RESCHEDULED';

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await scheduleApi.createChange(councilId, {
        changeDate,
        changeType,
        newDate: rescheduling ? newDate : null,
        reason,
      });
      toast.success('Holiday change added');
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
      title="Add holiday change"
      description={`Applies to every ward in ${councilName}.`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectInput
          id="change-type"
          label="What happens?"
          options={TYPE_OPTIONS}
          value={changeType}
          onChange={(e) => setChangeType(e.target.value as ChangeType)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="change-date"
            label={rescheduling ? 'Usual collection date' : 'Date'}
            type="date"
            min={today}
            value={changeDate}
            onChange={(e) => setChangeDate(e.target.value)}
            required
          />
          {rescheduling && (
            <TextInput
              id="change-new-date"
              label="Move to"
              type="date"
              min={today}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              required
            />
          )}
        </div>
        <TextInput
          id="change-reason"
          label="Reason"
          placeholder="Poya day"
          maxLength={255}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Add change
          </Button>
        </div>
      </form>
    </Modal>
  );
}