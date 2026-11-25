import { useState, type SubmitEvent } from 'react';
import { LocateFixed } from 'lucide-react';
import { toast } from 'sonner';
import { addressApi } from '../../api/addressApi';
import { getErrorMessage } from '../../api/client';
import { LocationMap, type LatLng } from '../../components/map/LocationMap';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export function AddAddressModal({ onClose, onSaved }: Readonly<Props>) {
  const [label, setLabel] = useState('Home');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [point, setPoint] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Ask the browser for the current GPS location
  function locateMe() {
    if (!('geolocation' in navigator)) {
      toast.error('Your browser cannot share its location. Click on the map instead.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPoint({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
        setLocating(false);
      },
      () => {
        toast.error('Could not get your location. Click on the map instead.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!point) {
      toast.error('Click on the map to show where the place is');
      return;
    }
    setSaving(true);
    try {
      const saved = await addressApi.create({ label, addressLine, city, ...point });
      if (saved.wardId) {
        toast.success(`Address saved. Your area: ${saved.wardName}`);
      } else {
        toast.warning('Address saved, but it is outside the wards we serve right now');
      }
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open title="Add address" description="We use the map point to find your ward." onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <TextInput
            id="address-label"
            label="Name"
            placeholder="Home"
            maxLength={50}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
          <div className="sm:col-span-2">
            <TextInput
              id="address-city"
              label="City"
              placeholder="Colombo 03"
              maxLength={100}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
        </div>
        <TextInput
          id="address-line"
          label="Address"
          placeholder="No. 12, Galle Road"
          maxLength={255}
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          required
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Location on the map</span>
            <Button variant="ghost" className="px-2 py-1" onClick={locateMe} loading={locating}>
              <LocateFixed className="size-4" /> Use my location
            </Button>
          </div>
          <LocationMap value={point} onChange={setPoint} />
          <p className="text-xs text-slate-500">
            {point
              ? `Selected: ${point.latitude}, ${point.longitude}`
              : 'Click on the map where the place is.'}
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Save address
          </Button>
        </div>
      </form>
    </Modal>
  );
}