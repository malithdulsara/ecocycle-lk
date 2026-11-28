import { useCallback } from 'react';
import { Clock, Coins, TrendingUp } from 'lucide-react';
import { dropOffApi } from '../../api/dropOffApi';
import { pointsApi } from '../../api/pointsApi';
import { rewardApi } from '../../api/rewardApi';
import { PageLoader } from '../../components/Spinner';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import type { PointsSummary } from '../../types/recycling';
import { formatPoints } from '../../utils/recycling';
import { PointsActivity } from './PointsActivity';
import { RecyclingCardPanel } from './RecyclingCardPanel';
import { RewardsCatalogue } from './RewardsCatalogue';
import { WhereToRecycle } from './WhereToRecycle';

const NO_POINTS: PointsSummary = { balance: 0, pendingPoints: 0, totalEarned: 0 };

// Household: QR card, points balance, rewards and history
export function MyPointsPage() {
  const { data: summary, loading, reload: reloadSummary } = useApiData(pointsApi.getSummary, NO_POINTS);
  const { data: history, reload: reloadHistory } = useApiData(pointsApi.getHistory, []);
  const { data: receipts } = useApiData(dropOffApi.getMine, []);
  const { data: vouchers, reload: reloadVouchers } = useApiData(rewardApi.getMyRedemptions, []);
  const { data: rewards, reload: reloadRewards } = useApiData(rewardApi.getActive, []);

  // After a reward is redeemed: balance, history, vouchers and stock all change
  const refresh = useCallback(() => {
    reloadSummary();
    reloadHistory();
    reloadVouchers();
    reloadRewards();
  }, [reloadSummary, reloadHistory, reloadVouchers, reloadRewards]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader title="My points" description="Bring clean recyclables to a centre, earn points and swap them for rewards." />

      <div className="grid gap-4 md:grid-cols-2">
        {/* Balance */}
        <div className="flex flex-col justify-between rounded-2xl bg-linear-to-br from-brand-600 to-brand-800 p-6 text-white shadow-sm">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-brand-100">
              <Coins className="size-4" /> Your balance
            </p>
            <p className="mt-2 text-5xl font-bold tracking-tight" data-testid="points-balance">
              {formatPoints(summary.balance)}
              <span className="ml-2 text-lg font-semibold text-brand-100">points</span>
            </p>
          </div>
          <div className="mt-6 space-y-1.5 text-sm text-brand-50">
            <p className="flex items-center gap-2">
              <TrendingUp className="size-4" /> {formatPoints(summary.totalEarned)} points earned so far
            </p>
            {summary.pendingPoints > 0 && (
              <p className="flex items-center gap-2">
                <Clock className="size-4" /> {formatPoints(summary.pendingPoints)} points are being checked
              </p>
            )}
          </div>
        </div>

        <RecyclingCardPanel />
      </div>

      <WhereToRecycle />

      <RewardsCatalogue rewards={rewards} balance={summary.balance} onRedeemed={refresh} />

      <PointsActivity history={history} receipts={receipts} vouchers={vouchers} />
    </div>
  );
}