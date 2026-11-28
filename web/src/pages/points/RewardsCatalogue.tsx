import { useState } from 'react';
import { CircleCheck, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { rewardApi } from '../../api/rewardApi';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { Redemption, Reward } from '../../types/recycling';
import { formatPoints } from '../../utils/recycling';

interface Props {
  rewards: Reward[];
  balance: number;
  onRedeemed: () => void;
}

function buttonLabel(reward: Reward, balance: number): string {
  if (reward.stock === 0) {
    return 'Out of stock';
  }
  if (balance < reward.pointsCost) {
    return `${formatPoints(reward.pointsCost - balance)} more points needed`;
  }
  return 'Redeem';
}

// Household: swap points for rewards
export function RewardsCatalogue({ rewards, balance, onRedeemed }: Readonly<Props>) {
  const [chosen, setChosen] = useState<Reward | null>(null);
  const [issued, setIssued] = useState<Redemption | null>(null);
  const [busy, setBusy] = useState(false);

  async function redeem() {
    if (!chosen) {
      return;
    }
    setBusy(true);
    try {
      setIssued(await rewardApi.redeem(chosen.id));
      onRedeemed();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function close() {
    setChosen(null);
    setIssued(null);
  }

  return (
    <section>
      <h3 className="mb-3 text-lg font-semibold text-slate-900">Rewards</h3>
      {rewards.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No rewards yet. Keep collecting points!
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((reward) => {
            const canRedeem = reward.stock !== 0 && balance >= reward.pointsCost;
            return (
              <div key={reward.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Gift className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{reward.name}</p>
                    {reward.description && <p className="text-sm text-slate-500">{reward.description}</p>}
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between gap-2">
                  <p className="text-xl font-bold text-brand-700">
                    {formatPoints(reward.pointsCost)} <span className="text-sm font-medium text-slate-500">pts</span>
                  </p>
                  {reward.stock !== null && <p className="text-xs text-slate-500">{reward.stock} left</p>}
                </div>
                <Button
                  className="mt-3"
                  variant={canRedeem ? 'primary' : 'secondary'}
                  disabled={!canRedeem}
                  onClick={() => setChosen(reward)}
                >
                  {buttonLabel(reward, balance)}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {chosen && (
        <Modal open title={issued ? 'Reward redeemed' : 'Redeem this reward?'} onClose={close}>
          {issued ? (
            <div className="space-y-4 text-center">
              <CircleCheck className="mx-auto size-12 text-brand-600" />
              <p className="text-sm text-slate-600">Show this voucher code at a collection centre to get your reward.</p>
              <p className="rounded-xl bg-slate-100 py-3 font-mono text-2xl font-bold tracking-widest text-slate-900">
                {issued.voucherCode}
              </p>
              <Button className="w-full" onClick={close}>
                Done
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{chosen.name}</span> costs{' '}
                {formatPoints(chosen.pointsCost)} points. You will have{' '}
                {formatPoints(balance - chosen.pointsCost)} points left.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={close}>
                  Cancel
                </Button>
                <Button loading={busy} onClick={redeem}>
                  Redeem
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </section>
  );
}