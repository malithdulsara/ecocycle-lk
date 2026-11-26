import { useEffect, useMemo, type ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  id: string;
  label: string;
  hint: string;
  value: File | null;
  onChange: (file: File | null) => void;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Choose one photo (JPG / PNG / WEBP, max 5 MB) and see a preview before uploading
export function PhotoPicker({ id, label, hint, value, onChange }: Readonly<Props>) {
  // A temporary browser link for the preview, removed when the photo changes
  const previewUrl = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function choose(event: ChangeEvent<HTMLInputElement>) {
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
    onChange(file);
  }

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {previewUrl ? (
        <div className="relative w-fit">
          <img src={previewUrl} alt="Selected" className="h-32 rounded-xl border border-slate-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 rounded-full bg-slate-900 p-1 text-white shadow"
            aria-label="Remove photo"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 transition hover:border-brand-400 hover:bg-brand-50"
        >
          <ImagePlus className="size-5 shrink-0 text-brand-600" />
          {hint}
        </label>
      )}
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={choose} />
    </div>
  );
}
