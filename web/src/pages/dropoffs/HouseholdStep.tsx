import { useState, type SubmitEvent } from 'react';
import { QrCode, TriangleAlert, UserRound, X } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { dropOffApi } from '../../api/dropOffApi';
import { QrScannerBox } from '../../components/recycling/QrScannerBox';
import { Button } from '../../components/ui/Button';
import { TextInput } from '../../components/ui/form';
import type { HouseholdLookup } from '../../types/recycling';

interface Props {
  household: HouseholdLookup | null;
  onFound: (household: HouseholdLookup) => void;
  onClear: () => void;
}

// Step 1: find the household from their QR code (camera, USB scanner or typed)
export function HouseholdStep({ household, onFound, onClear }: Readonly<Props>) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  async function find(value: string) {
    if (!value.trim()) {
      return;
    }
    setBusy(true);
    try {
      onFound(await dropOffApi.lookup(value.trim()));
      setCode('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    await find(code);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
        <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white">1</span>
        Household
      </h3>

      {household ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <UserRound className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-slate-900" data-testid="household-name">
                  {household.householdName}
                </p>
                <p className="font-mono text-xs text-slate-500">{household.cardCode}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClear} aria-label="Change household">
              <X className="size-4" /> Change
            </Button>
          </div>
          {household.dropOffsToday > 0 && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              Already {household.dropOffsToday} drop-off{household.dropOffsToday > 1 ? 's' : ''} today.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <QrScannerBox onScan={find} />
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <TextInput
                id="card-code"
                label="Or type the code"
                placeholder="ECO-XXXXXXXX"
                icon={QrCode}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>
            <Button type="submit" loading={busy} disabled={!code.trim()}>
              Find
            </Button>
          </form>
          <p className="text-xs text-slate-500">A USB QR scanner also works: click the box above and scan.</p>
        </div>
      )}
    </section>
  );
}