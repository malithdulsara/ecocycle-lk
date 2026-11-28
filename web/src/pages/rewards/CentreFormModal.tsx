import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { recyclingApi } from '../../api/recyclingApi';
import { LocationMap, type LatLng } from '../../components/map/LocationMap';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { Centre } from '../../types/recycling';

interface Props {
  centre: Centre | null; // null = new centre
  onClose: () => void;
  onSaved: () => void;
}

export function CentreFormModal({ centre, onClose, onSaved }: Readonly<Props>) {
  const [name, setName] = useState(centre?.name ?? '');
  const [address, setAddress] = useState(centre?.address ?? '');
  const [phone, setPhone] = useState(centre?.phone ?? '');
  const [openingHours, setOpeningHours] = useState(centre?.openingHours ?? '');
  const [location, setLocation] = useState<LatLng | null>(
    centre ? { latitude: centre.latitude, longitude: centre.longitude } : null,
  );
  const [active, setActive] = useState(centre?.active ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!location) {
      toast.error('Click the map to mark the centre');
      return;
    }
    setSaving(true);
    try {
      const request = {
        name,
        address,
        phone: phone.trim() || null,
        openingHours: openingHours.trim() || null,
        latitude: location.latitude,
        longitude: location.longitude,
        active,
      };
      if (centre) {
        await recyclingApi.updateCentre(centre.id, request);
        toast.success('Centre updated');
      } else {
        await recyclingApi.createCentre(request);
        toast.success('Centre added');
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open title={centre ? 'Edit centre' : 'Add a centre'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <TextInput
          id="centre-name"
          label="Name"
          placeholder="Kollupitiya Recycling Centre"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextInput
          id="centre-address"
          label="Address"
          placeholder="12 Galle Road, Colombo 3"
          maxLength={255}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            id="centre-phone"
            label="Phone (optional)"
            placeholder="0112345678"
            inputMode="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextInput
            id="centre-hours"
            label="Opening hours (optional)"
            placeholder="Mon-Sat 8 AM - 5 PM"
            maxLength={100}
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-slate-700">Location (click the map)</p>
          <LocationMap value={location} onChange={setLocation} className="h-56" />
        </div>
        {centre && (
          <SelectInput
            id="centre-active"
            label="Status"
            options={[
              { value: 'yes', label: 'Open' },
              { value: 'no', label: 'Closed' },
            ]}
            value={active ? 'yes' : 'no'}
            onChange={(e) => setActive(e.target.value === 'yes')}
          />
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {centre ? 'Save' : 'Add centre'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}