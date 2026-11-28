import { useState } from 'react';
import { Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/client';
import { rewardApi } from '../../api/rewardApi';
import { EmptyState } from '../../components/EmptyState';
import { RedemptionStatusBadge } from '../../components/recycling/RecyclingBadges';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { useApiData } from '../../hooks/useApiData';
import type { Redemption } from '../../types/recycling';
import { formatDateTime } from '../../utils/complaint';
import { formatPoints } from '../../utils/recycling';

// Latest vouchers households got with their points
export function VouchersTab() {
  const { data: vouchers, setData: setVouchers, loading } = useApiData(rewardApi.getAllRedemptions, []);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function collect(voucher: Redemption) {
    setBusyId(voucher.id);
    try {
      const updated = await rewardApi.collect(voucher.voucherCode);
      setVouchers((list) => list.map((v) => (v.id === updated.id ? updated : v)));
      toast.success('Marked as handed over');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <PageLoader />;
  }
  if (vouchers.length === 0) {
    return <EmptyState icon={Ticket} title="No vouchers yet" message="Rewards that households redeem will show here." />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-180 text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          <tr>
            <th className="px-5 py-3">Voucher</th>
            <th className="px-5 py-3">Reward</th>
            <th className="px-5 py-3">Household</th>
            <th className="px-5 py-3">Redeemed</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {vouchers.map((v) => (
            <tr key={v.id} className="hover:bg-slate-50/60">
              <td className="px-5 py-3 font-mono font-medium text-slate-900">{v.voucherCode}</td>
              <td className="px-5 py-3 text-slate-700">
                {v.rewardName}
                <span className="block text-xs text-slate-500">{formatPoints(v.points)} points</span>
              </td>
              <td className="px-5 py-3 text-slate-600">{v.householdName}</td>
              <td className="px-5 py-3 text-slate-600">{formatDateTime(v.createdAt)}</td>
              <td className="px-5 py-3">
                <RedemptionStatusBadge status={v.status} />
              </td>
              <td className="px-5 py-3 text-right">
                {v.status === 'ISSUED' && (
                  <Button variant="ghost" className="px-3 py-1.5" loading={busyId === v.id} onClick={() => collect(v)}>
                    Handed over
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}