import { useState, type SubmitEvent } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { recyclingApi } from '../../api/recyclingApi';
import { WasteTypeDot } from '../../components/schedule/WasteTypeDot';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/form';
import { useApiData } from '../../hooks/useApiData';
import type { MaterialRate } from '../../types/recycling';

function RateRow({ rate, onChanged }: Readonly<{ rate: MaterialRate; onChanged: (rate: MaterialRate) => void }>) {
  const [value, setValue] = useState(rate.pointsPerKg === null ? '' : String(rate.pointsPerKg));
  const [busy, setBusy] = useState(false);
  const changed = value !== (rate.pointsPerKg === null ? '' : String(rate.pointsPerKg));

  async function save(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      onChanged(await recyclingApi.setRate(rate.wasteTypeId, Number(value)));
      toast.success(`${rate.wasteTypeName}: ${value} points per kg`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function stop() {
    setBusy(true);
    try {
      await recyclingApi.removeRate(rate.wasteTypeId);
      setValue('');
      onChanged({ ...rate, pointsPerKg: null });
      toast.success(`${rate.wasteTypeName} no longer earns points`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-wrap items-end gap-3 px-5 py-4">
      <div className="flex min-w-36 flex-1 items-center gap-2 pb-2.5">
        <WasteTypeDot color={rate.color} className="size-3" />
        <span className="font-medium text-slate-900">{rate.wasteTypeName}</span>
        {rate.pointsPerKg === null && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">No points</span>
        )}
      </div>
      <div className="w-36">
        <TextInput
          id={`rate-${rate.wasteTypeId}`}
          label="Points per kg"
          type="number"
          min={0.1}
          max={1000}
          step={0.01}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="submit" loading={busy} disabled={!changed || !value}>
        Save
      </Button>
      {rate.pointsPerKg !== null && (
        <Button variant="dangerGhost" disabled={busy} onClick={stop}>
          Stop points
        </Button>
      )}
    </form>
  );
}

// How many points 1 kg of each recyclable material is worth
export function RatesTab() {
  const { data: rates, setData: setRates, loading } = useApiData(recyclingApi.getRates, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-sm text-slate-600">
        Points = weight (kg) × points per kg × campaign multiplier, rounded down. Old receipts keep the rate of their day.
      </p>
      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rates.map((rate) => (
          <RateRow
            key={rate.wasteTypeId}
            rate={rate}
            onChanged={(updated) => setRates((list) => list.map((r) => (r.wasteTypeId === updated.wasteTypeId ? updated : r)))}
          />
        ))}
      </div>
    </div>
  );
}