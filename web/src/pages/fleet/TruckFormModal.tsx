import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { truckApi } from '../../api/truckApi';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { Council } from '../../types/admin';
import type { Truck } from '../../types/tracking';

interface Props {
  truck: Truck | null; // null = add a new truck
  councils: Council[];
  onClose: () => void;
  onSaved: () => void;
}

// Admin: add or edit a truck
export function TruckFormModal({ truck, councils, onClose, onSaved }: Readonly<Props>) {
  const [registrationNumber, setRegistrationNumber] = useState(truck?.registrationNumber ?? '');
  const [model, setModel] = useState(truck?.model ?? '');
  const [capacityKg, setCapacityKg] = useState(String(truck?.capacityKg ?? 5000));
  const [councilId, setCouncilId] = useState(String(truck?.councilId ?? councils[0]?.id ?? ''));
  const [active, setActive] = useState(truck?.active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const request = {
        registrationNumber,
        model: model.trim() || null,
        capacityKg: Number(capacityKg),
        councilId: Number(councilId),
        active,
      };
      if (truck) {
        await truckApi.update(truck.id, request);
        toast.success('Truck updated');
      } else {
        await truckApi.create(request);
        toast.success('Truck added');
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const councilOptions = councils.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <Modal open title={truck ? 'Edit truck' : 'Add a truck'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="truck-plate"
            label="Registration number"
            placeholder="WP LB-1234"
            maxLength={20}
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
          <TextInput
            id="truck-capacity"
            label="Capacity (kg)"
            type="number"
            min={100}
            max={50000}
            step={100}
            value={capacityKg}
            onChange={(e) => setCapacityKg(e.target.value)}
            required
          />
        </div>
        <TextInput
          id="truck-model"
          label="Model (optional)"
          placeholder="Isuzu compactor"
          maxLength={100}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            id="truck-council"
            label="Council"
            options={councilOptions}
            value={councilId}
            onChange={(e) => setCouncilId(e.target.value)}
          />
          <SelectInput
            id="truck-active"
            label="Status"
            options={[
              { value: 'yes', label: 'In use' },
              { value: 'no', label: 'Not in use' },
            ]}
            value={active ? 'yes' : 'no'}
            onChange={(e) => setActive(e.target.value === 'yes')}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {truck ? 'Save' : 'Add truck'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}