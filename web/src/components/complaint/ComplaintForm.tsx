import { useState, type SubmitEvent } from 'react';
import {
  CircleHelp,
  Flame,
  LocateFixed,
  Trash2,
  TriangleAlert,
  Truck,
  UserRoundX,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { complaintApi } from '../../api/complaintApi';
import { fileApi } from '../../api/fileApi';
import type { ComplaintCategory } from '../../types/complaint';
import { COMPLAINT_CATEGORIES, COMPLAINT_CATEGORY_LABELS } from '../../utils/complaint';
import { getCurrentLocation } from '../../utils/geo';
import { LocationMap, type LatLng } from '../map/LocationMap';
import { Button } from '../ui/Button';
import { PhotoPicker } from '../ui/PhotoPicker';
import { TextAreaInput, TextInput } from '../ui/form';

const CATEGORY_ICONS: Record<ComplaintCategory, LucideIcon> = {
  MISSED_PICKUP: Truck,
  ILLEGAL_DUMPING: TriangleAlert,
  OVERFLOWING_BIN: Trash2,
  BURNING_WASTE: Flame,
  DAMAGED_BIN: Wrench,
  STAFF_BEHAVIOUR: UserRoundX,
  OTHER: CircleHelp,
};

interface Props {
  // true = used without logging in (shows optional name / phone, uses the guest API)
  guest?: boolean;
  // Called with the tracking code after the complaint is sent
  onDone: (trackingCode: string) => void;
  onCancel?: () => void;
}

// The complaint form, used by the household page and the public "Report a problem" page
export function ComplaintForm({ guest = false, onDone, onCancel }: Readonly<Props>) {
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [description, setDescription] = useState('');
  const [point, setPoint] = useState<LatLng | null>(null);
  const [landmark, setLandmark] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function locateMe() {
    setLocating(true);
    try {
      setPoint(await getCurrentLocation());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not get your location');
    } finally {
      setLocating(false);
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!category) {
      toast.error('Choose what the problem is');
      return;
    }
    if (!point) {
      toast.error('Click on the map to show where the problem is');
      return;
    }
    setSaving(true);
    try {
      // 1) upload the photo (if any), 2) send the complaint with the photo's file name
      const photoFileName = photo ? await fileApi.uploadImage(photo, guest) : null;
      const request = {
        category,
        description,
        latitude: point.latitude,
        longitude: point.longitude,
        landmark: landmark.trim() || null,
        photoFileName,
      };
      const created = guest
        ? await complaintApi.createAsGuest({ ...request, reporterName: name.trim() || null, reporterPhone: phone.trim() || null })
        : await complaintApi.create(request);
      onDone(created.trackingCode);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. What */}
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium text-slate-700">What is the problem?</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {COMPLAINT_CATEGORIES.map((value) => {
            const Icon = CATEGORY_ICONS[value];
            const selected = category === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition ${
                  selected
                    ? 'border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50/50'
                }`}
              >
                <Icon className={`size-5 ${selected ? 'text-brand-600' : 'text-slate-400'}`} />
                {COMPLAINT_CATEGORY_LABELS[value]}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* 2. Where */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-700">Where is it?</span>
          <Button variant="secondary" className="px-3 py-1.5" loading={locating} onClick={locateMe}>
            <LocateFixed className="size-4" /> Use my location
          </Button>
        </div>
        <LocationMap value={point} onChange={setPoint} className="h-56" />
        <p className="text-xs text-slate-500">
          {point
            ? `Selected: ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`
            : 'Click on the map to mark the exact place.'}
        </p>
        <TextInput
          id="complaint-landmark"
          label="Nearby landmark (optional)"
          placeholder="Near the bus stop, behind the temple"
          maxLength={200}
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
        />
      </div>

      {/* 3. Details */}
      <TextAreaInput
        id="complaint-description"
        label="Describe the problem"
        placeholder="The truck did not come on Monday. Bags have been on the road for 3 days."
        rows={3}
        maxLength={1000}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <PhotoPicker
        id="complaint-photo"
        label="Photo (optional)"
        hint="Add a photo of the problem (JPG / PNG, max 5 MB)"
        value={photo}
        onChange={setPhoto}
      />

      {/* Guests can leave contact details so the council can call back */}
      {guest && (
        <div className="space-y-3 rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Your name and phone are optional. Leave them empty to report anonymously.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              id="complaint-name"
              label="Your name"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextInput
              id="complaint-phone"
              label="Mobile number"
              placeholder="0771234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-1">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={saving}>
          Send complaint
        </Button>
      </div>
    </form>
  );
}