import { useState } from 'react';
import { Pencil, Plus, Sparkles } from 'lucide-react';
import { recyclingApi } from '../../api/recyclingApi';
import { EmptyState } from '../../components/EmptyState';
import { PageLoader } from '../../components/Spinner';
import { Button } from '../../components/ui/Button';
import { useApiData } from '../../hooks/useApiData';
import type { Campaign } from '../../types/recycling';
import { formatMultiplier } from '../../utils/recycling';
import { formatShortDate, todayIso } from '../../utils/schedule';
import { CampaignFormModal } from './CampaignFormModal';

function campaignStatus(campaign: Campaign): { label: string; className: string } {
  if (campaign.running) {
    return { label: 'Running', className: 'bg-brand-100 text-brand-800' };
  }
  if (!campaign.active) {
    return { label: 'Stopped', className: 'bg-slate-100 text-slate-600' };
  }
  if (campaign.startDate > todayIso()) {
    return { label: 'Starts soon', className: 'bg-sky-100 text-sky-800' };
  }
  return { label: 'Ended', className: 'bg-slate-100 text-slate-600' };
}

// Bonus points for a while, e.g. "Double points for plastic in December"
export function CampaignsTab() {
  const { data: campaigns, loading, reload } = useApiData(recyclingApi.getCampaigns, []);
  const { data: rates } = useApiData(recyclingApi.getRates, []);
  const [editing, setEditing] = useState<Campaign | null | undefined>(undefined); // undefined = closed

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing(null)}>
          <Plus className="size-4" /> New campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState icon={Sparkles} title="No campaigns yet" message="Give extra points for a while to get more people recycling." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-160 text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Bonus</th>
                <th className="px-5 py-3">Dates</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((campaign) => {
                const status = campaignStatus(campaign);
                return (
                  <tr key={campaign.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{campaign.name}</p>
                      {campaign.description && <p className="text-xs text-slate-500">{campaign.description}</p>}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      <span className="font-semibold">{formatMultiplier(campaign.multiplier)}</span> on{' '}
                      {campaign.wasteTypeName ?? 'every material'}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {formatShortDate(campaign.startDate)} - {formatShortDate(campaign.endDate)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setEditing(campaign)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Edit ${campaign.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <CampaignFormModal
          campaign={editing}
          rates={rates}
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