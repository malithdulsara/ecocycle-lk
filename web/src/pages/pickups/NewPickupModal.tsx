import { useEffect, useMemo, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { fileApi } from '../../api/fileApi';
import { pickupApi } from '../../api/pickupApi';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextAreaInput, TextInput } from '../../components/ui/form';
import { Modal } from '../../components/ui/Modal';
import type { Address } from '../../types/address';
import type { WasteType } from '../../types/schedule';
import { addDaysIso } from '../../utils/schedule';

interface Props {
  addresses: Address[]; // only addresses inside a ward
  wasteTypes: WasteType[];
  onClose: () => void;
  onSaved: () => void;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function NewPickupModal({ addresses, wasteTypes, onClose, onSaved }: Readonly<Props>) {
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [addressId, setAddressId] = useState(String(defaultAddress?.id ?? ''));
  const [wasteTypeId, setWasteTypeId] = useState(String(wasteTypes[0]?.id ?? ''));
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState(addDaysIso(2));
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Preview of the chosen photo (a temporary browser link, removed when the photo changes)
  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = ''; // lets the user choose the same file again later
    if (!file) {
      return;
    }
    if (!PHOTO_TYPES.has(file.type)) {
      toast.error('Only JPG, PNG or WEBP photos are allowed');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Photo must be 5 MB or smaller');
      return;
    }
    setPhoto(file);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      // 1) upload the photo (if any), 2) send the request with the photo's file name
      const photoFileName = photo ? await fileApi.uploadImage(photo) : null;
      await pickupApi.create({
        addressId: Number(addressId),
        wasteTypeId: Number(wasteTypeId),
        description,
        preferredDate,
        photoFileName,
      });
      toast.success('Pickup request sent. The council will review it soon.');
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const addressOptions = addresses.map((a) => ({ value: String(a.id), label: `${a.label}: ${a.addressLine}` }));
  const wasteTypeOptions = wasteTypes.map((t) => ({ value: String(t.id), label: t.name }));

  return (
    <Modal
      open
      title="Request a pickup"
      description="For bulky items or waste that is not part of the weekly collection."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <SelectInput
          id="pickup-address"
          label="Pickup address"
          options={addressOptions}
          value={addressId}
          onChange={(e) => setAddressId(e.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectInput
            id="pickup-type"
            label="Waste type"
            options={wasteTypeOptions}
            value={wasteTypeId}
            onChange={(e) => setWasteTypeId(e.target.value)}
          />
          <TextInput
            id="pickup-date"
            label="Preferred date"
            type="date"
            min={addDaysIso(1)}
            max={addDaysIso(60)}
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            required
          />
        </div>
        <TextAreaInput
          id="pickup-description"
          label="What needs to be collected?"
          placeholder="Old sofa, 2 mattresses and a broken cupboard"
          rows={3}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Photo (optional)</span>
          {previewUrl ? (
            <div className="relative w-fit">
              <img src={previewUrl} alt="Selected" className="h-32 rounded-xl border border-slate-200 object-cover" />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute -top-2 -right-2 rounded-full bg-slate-900 p-1 text-white shadow"
                aria-label="Remove photo"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="pickup-photo"
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 transition hover:border-brand-400 hover:bg-brand-50"
            >
              <ImagePlus className="size-5 text-brand-600" />
              Add a photo so the council knows what to bring (JPG / PNG, max 5 MB)
            </label>
          )}
          <input id="pickup-photo" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={choosePhoto} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Send request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
