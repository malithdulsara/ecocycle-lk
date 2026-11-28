import { useState } from 'react';
import { Store } from 'lucide-react';
import { dropOffApi } from '../../api/dropOffApi';
import { recyclingApi } from '../../api/recyclingApi';
import { EmptyState } from '../../components/EmptyState';
import { ReceiptModal } from '../../components/recycling/ReceiptModal';
import { PageLoader } from '../../components/Spinner';
import { SelectInput } from '../../components/ui/form';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { DropOff, HouseholdLookup } from '../../types/recycling';
import { getSavedCentreId, saveCentreId } from '../../utils/recycling';
import { HouseholdStep } from './HouseholdStep';
import { MaterialsStep } from './MaterialsStep';
import { RecentDropOffs } from './RecentDropOffs';
import { VoucherBox } from './VoucherBox';

// Centre operator: scan a household's QR code, weigh their recyclables and give points
export function DropOffsPage() {
  const { data: centres, loading } = useApiData(recyclingApi.getCentres, []);
  const { data: rates, loading: loadingRates } = useApiData(recyclingApi.getRates, []);
  const { data: recent, reload: reloadRecent } = useApiData(dropOffApi.getRecent, []);

  const [chosenCentreId, setChosenCentreId] = useState<number | null>(getSavedCentreId());
  const [household, setHousehold] = useState<HouseholdLookup | null>(null);
  const [receipt, setReceipt] = useState<DropOff | null>(null);

  // The saved centre may be closed now: then use the first open one
  const centreId = centres.some((c) => c.id === chosenCentreId) ? chosenCentreId : (centres[0]?.id ?? null);
  const acceptedRates = rates.filter((r) => r.pointsPerKg !== null);

  function chooseCentre(id: number) {
    setChosenCentreId(id);
    saveCentreId(id);
  }

  function handleSaved(dropOff: DropOff) {
    setReceipt(dropOff);
    setHousehold(null);
    reloadRecent();
  }

  if (loading || loadingRates) {
    return <PageLoader />;
  }

  if (centreId === null) {
    return (
      <EmptyState icon={Store} title="No open centres" message="Ask a recycler manager to add your collection centre." />
    );
  }

  return (
    <div>
      <PageHeader title="Drop-offs" description="Scan the household's QR code, weigh each material and confirm." />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <HouseholdStep household={household} onFound={setHousehold} onClear={() => setHousehold(null)} />
          {household && (
            <MaterialsStep
              key={household.cardCode}
              household={household}
              centreId={centreId}
              rates={acceptedRates}
              onSaved={handleSaved}
            />
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SelectInput
              id="centre"
              label="My centre"
              options={centres.map((c) => ({ value: String(c.id), label: c.name }))}
              value={String(centreId)}
              onChange={(e) => chooseCentre(Number(e.target.value))}
            />
          </div>
          <VoucherBox />
          <RecentDropOffs dropOffs={recent} onOpen={setReceipt} />
        </aside>
      </div>

      {receipt && <ReceiptModal dropOff={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}