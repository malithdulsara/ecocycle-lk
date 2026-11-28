import { useRef, useState } from 'react';
import { CircleCheck, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { dropOffApi } from '../../api/dropOffApi';
import { DropOffItemsTable } from '../../components/recycling/DropOffItemsTable';
import { Button } from '../../components/ui/Button';
import { SelectInput, TextInput } from '../../components/ui/form';
import type { DropOff, DropOffPreview, DropOffRequest, HouseholdLookup, MaterialRate } from '../../types/recycling';

interface Row {
  key: number;
  wasteTypeId: string;
  weightKg: string;
}

interface Props {
  household: HouseholdLookup;
  centreId: number;
  rates: MaterialRate[]; // materials that earn points
  onSaved: (dropOff: DropOff) => void;
}

// Step 2: weigh each material, check the points, then confirm
export function MaterialsStep({ household, centreId, rates, onSaved }: Readonly<Props>) {
  const nextKey = useRef(1);
  const [rows, setRows] = useState<Row[]>([{ key: 0, wasteTypeId: String(rates[0]?.wasteTypeId ?? ''), weightKg: '' }]);
  const [preview, setPreview] = useState<DropOffPreview | null>(null);
  const [busy, setBusy] = useState(false);

  const options = rates.map((r) => ({ value: String(r.wasteTypeId), label: `${r.wasteTypeName} (${r.pointsPerKg} / kg)` }));
  const usedIds = new Set(rows.map((r) => r.wasteTypeId));
  const filled = rows.every((r) => r.wasteTypeId && Number(r.weightKg) > 0);

  // Any change means the points must be checked again
  function changeRow(key: number, change: Partial<Row>) {
    setRows((list) => list.map((r) => (r.key === key ? { ...r, ...change } : r)));
    setPreview(null);
  }

  function addRow() {
    const unused = rates.find((r) => !usedIds.has(String(r.wasteTypeId)));
    setRows((list) => [...list, { key: nextKey.current++, wasteTypeId: String(unused?.wasteTypeId ?? ''), weightKg: '' }]);
    setPreview(null);
  }

  function removeRow(key: number) {
    setRows((list) => list.filter((r) => r.key !== key));
    setPreview(null);
  }

  function request(): DropOffRequest {
    return {
      cardCode: household.cardCode,
      centreId,
      items: rows.map((r) => ({ wasteTypeId: Number(r.wasteTypeId), weightKg: Number(r.weightKg) })),
    };
  }

  async function checkPoints() {
    setBusy(true);
    try {
      setPreview(await dropOffApi.preview(request()));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    try {
      const saved = await dropOffApi.create(request());
      toast.success(
        saved.status === 'CREDITED'
          ? `${saved.totalPoints} points added for ${saved.householdName}`
          : 'Saved. A recycler manager will check it before the points are added.',
      );
      onSaved(saved);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white">2</span>
        Materials
      </h3>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.key} className="flex items-end gap-2">
            <div className="flex-1">
              <SelectInput
                id={`material-${row.key}`}
                label={`Material ${index + 1}`}
                options={options}
                value={row.wasteTypeId}
                onChange={(e) => changeRow(row.key, { wasteTypeId: e.target.value })}
              />
            </div>
            <div className="w-32">
              <TextInput
                id={`weight-${row.key}`}
                label="Weight (kg)"
                type="number"
                inputMode="decimal"
                min={0.1}
                max={500}
                step={0.01}
                placeholder="0.00"
                value={row.weightKg}
                onChange={(e) => changeRow(row.key, { weightKg: e.target.value })}
              />
            </div>
            <button
              onClick={() => removeRow(row.key)}
              disabled={rows.length === 1}
              className="mb-1 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:invisible"
              aria-label="Remove material"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>

      {rows.length < rates.length && (
        <Button variant="ghost" className="mt-2 -ml-3" onClick={addRow}>
          <Plus className="size-4" /> Add material
        </Button>
      )}

      {preview && (
        <div className="mt-5 space-y-3">
          <DropOffItemsTable
            items={preview.items}
            totalWeightKg={preview.totalWeightKg}
            totalPoints={preview.totalPoints}
          />
          {preview.needsReview && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <ShieldAlert className="mt-0.5 size-4 shrink-0" />
              {preview.reviewReason}. A recycler manager will check this drop-off before the points are added.
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-3">
        {preview ? (
          <Button loading={busy} onClick={confirm}>
            <CircleCheck className="size-4" /> Confirm drop-off
          </Button>
        ) : (
          <Button loading={busy} disabled={!filled} onClick={checkPoints}>
            Check points
          </Button>
        )}
      </div>
    </section>
  );
}