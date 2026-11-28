import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { pointsApi } from '../../api/pointsApi';
import { Spinner } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useApiData } from '../../hooks/useApiData';
import type { RecyclingCard } from '../../types/recycling';

const NO_CARD: RecyclingCard | null = null;

// Household: the QR code the centre operator scans
export function RecyclingCardPanel() {
  const { data: card, setData: setCard, loading } = useApiData(pointsApi.getCard, NO_CARD);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  async function regenerate() {
    setBusy(true);
    try {
      setCard(await pointsApi.regenerateCard());
      toast.success('New QR code made. The old one no longer works.');
      setConfirming(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {loading || !card ? (
        <div className="flex h-40 w-full items-center justify-center">
          <Spinner className="size-6 text-brand-600" />
        </div>
      ) : (
        <>
          <div className="shrink-0 rounded-xl border border-slate-200 p-2">
            <QRCodeSVG value={card.code} size={136} level="M" title={`Recycling QR code ${card.code}`} />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="font-semibold text-slate-900">My recycling QR code</p>
            <p className="text-sm text-slate-600">Show this at a collection centre. The operator scans it to add your points.</p>
            <p className="font-mono text-sm font-semibold tracking-wider text-slate-800" data-testid="card-code">
              {card.code}
            </p>
            <Button variant="ghost" className="-ml-3 px-3 py-1.5" onClick={() => setConfirming(true)}>
              <RefreshCw className="size-4" /> Get a new code
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirming}
        title="Get a new QR code?"
        message="Do this if someone else has your code. Your old QR code will stop working. Your points stay the same."
        confirmLabel="Get new code"
        loading={busy}
        onConfirm={regenerate}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}