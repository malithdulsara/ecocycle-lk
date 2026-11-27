import { useCallback, useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { truckApi } from '../../api/truckApi';
import { wardApi } from '../../api/wardApi';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import { useApiData } from '../../hooks/useApiData';
import type { User } from '../../types/api';
import type { Truck } from '../../types/tracking';
import { todayIso } from '../../utils/schedule';

interface Props {
  date: string;
  trucks: Truck[]; // active trucks only
  drivers: User[];
  onClose: () => void;
  onSaved: () => void;
}

// Officer / admin: plan which truck and driver collects in which ward on a day
export function RouteFormModal({ date, trucks, drivers, onClose, onSaved }: Readonly<Props>) {
  const [routeDate, setRouteDate] = useState(date);
  const [truckId, setTruckId] = useState(String(trucks[0]?.id ?? ''));
  const [driverId, setDriverId] = useState(String(drivers[0]?.id ?? ''));
  const [wardId, setWardId] = useState('');
  const [saving, setSaving] = useState(false);

  // A truck can only work in the wards of its own council
  const councilId = trucks.find((t) => t.id === Number(truckId))?.councilId ?? null;
  const loadWards = useCallback(
    () => (councilId ? wardApi.getByCouncil(councilId) : Promise.resolve([])),
    [councilId],
  );
  const { data: wards } = useApiData(loadWards, []);
  const selectedWardId = wards.some((w) => w.id === Number(wardId)) ? wardId : String(wards[0]?.id ?? '');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await truckApi.createRoute({
        routeDate,
        truckId: Number(truckId),
        driverId: Number(driverId),
        wardId: Number(selectedWardId),
      });
      toast.success('Route planned');
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const truckOptions = trucks.map((t) => ({ value: String(t.id), label: `${t.registrationNumber} (${t.councilName})` }));
  const driverOptions = drivers.map((d) => ({ value: String(d.id), label: d.fullName }));
  const wardOptions = wards.map((w) => ({ value: String(w.id), label: w.name }));
  const canSave = trucks.length > 0 && drivers.length > 0 && wards.length > 0;

  return (
    <Modal open title="Plan a route" description="Which truck and driver collects in which ward." onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="route-date"
          label="Date"
          type="date"
          min={todayIso()}
          value={routeDate}
          onChange={(e) => setRouteDate(e.target.value)}
          required
        />
        <SelectInput
          id="route-truck"
          label="Truck"
          options={truckOptions}
          value={truckId}
          onChange={(e) => setTruckId(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            id="route-ward"
            label="Ward"
            options={wardOptions}
            value={selectedWardId}
            onChange={(e) => setWardId(e.target.value)}
          />
          <SelectInput
            id="route-driver"
            label="Driver"
            options={driverOptions}
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
          />
        </div>
        {!canSave && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
            You need an active truck, an active driver and a ward in the truck's council.
          </p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!canSave}>
            Plan route
          </Button>
        </div>
      </form>
    </Modal>
  );
}