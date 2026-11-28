import { useState } from 'react';
import { Gift, Pencil, Plus } from 'lucide-react';
import { rewardApi } from '../../api/rewardApi';
import { EmptyState } from '../../components/EmptyState';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { useApiData } from '../../hooks/useApiData';
import type { Reward } from '../../types/recycling';
import { formatPoints } from '../../utils/recycling';
import { RewardFormModal } from './RewardFormModal';

// The rewards catalogue households choose from
export function RewardsTab() {
  const { data: rewards, loading, reload } = useApiData(rewardApi.getAll, []);
  const [editing, setEditing] = useState<Reward | null | undefined>(undefined); // undefined = closed

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing(null)}>
          <Plus className="size-4" /> Add reward
        </Button>
      </div>

      {rewards.length === 0 ? (
        <EmptyState icon={Gift} title="No rewards yet" message="Add vouchers or gifts that households can get with points." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-140 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Reward</th>
                <th className="px-5 py-3">Points</th>
                <th className="px-5 py-3">Left</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rewards.map((reward) => (
                <tr key={reward.id} className={`hover:bg-slate-50/60 ${reward.active ? '' : 'opacity-60'}`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900">
                      {reward.name}
                      {!reward.active && <span className="ml-2 text-xs font-normal text-slate-500">hidden</span>}
                    </p>
                    {reward.description && <p className="text-xs text-slate-500">{reward.description}</p>}
                  </td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{formatPoints(reward.pointsCost)}</td>
                  <td className="px-5 py-3 text-slate-600">{reward.stock ?? 'No limit'}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setEditing(reward)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={`Edit ${reward.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <RewardFormModal
          reward={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      )}
    </div>
  );
}