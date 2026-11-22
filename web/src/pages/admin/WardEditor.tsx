import { Eraser, MousePointerClick, Undo2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/form';
import type { LngLat } from '../../types/admin';

export interface WardDraft {
  wardId: number | null; // null = new ward
  name: string;
  wardCode: string;
  points: LngLat[];
}

interface Props {
  draft: WardDraft;
  saving: boolean;
  onChange: (draft: WardDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

// Left panel shown while adding or editing a ward. The boundary is drawn by clicking on the map.
export function WardEditor({ draft, saving, onChange, onSave, onCancel }: Readonly<Props>) {
  const pointCount = draft.points.length;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-slate-900">{draft.wardId ? 'Edit ward' : 'New ward'}</h3>
        <p className="mt-1 text-sm text-slate-500">Fill in the details and draw the ward area on the map.</p>
      </div>

      <TextInput
        id="ward-name"
        label="Ward name"
        placeholder="Kollupitiya"
        value={draft.name}
        onChange={(e) => onChange({ ...draft, name: e.target.value })}
      />
      <TextInput
        id="ward-code"
        label="Ward code"
        placeholder="CMC-02"
        value={draft.wardCode}
        onChange={(e) => onChange({ ...draft, wardCode: e.target.value })}
      />

      {/* Drawing help */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <MousePointerClick className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-900">
            <p className="font-medium">Click on the map to draw the boundary</p>
            <p className="mt-1 text-amber-800">
              Click each corner of the ward in order. You need at least 3 points. The shape closes by itself.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-amber-900">
            {pointCount} {pointCount === 1 ? 'point' : 'points'}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="px-3 py-1.5"
              disabled={pointCount === 0}
              onClick={() => onChange({ ...draft, points: draft.points.slice(0, -1) })}
            >
              <Undo2 className="size-4" /> Undo
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1.5"
              disabled={pointCount === 0}
              onClick={() => onChange({ ...draft, points: [] })}
            >
              <Eraser className="size-4" /> Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="flex-1" loading={saving} onClick={onSave}>
          Save ward
        </Button>
      </div>
    </div>
  );
}