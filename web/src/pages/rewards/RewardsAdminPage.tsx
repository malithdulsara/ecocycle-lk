import { useState } from 'react';
import { Gift, MapPin, Scale, ShieldCheck, Sparkles, Ticket, type LucideIcon } from 'lucide-react';
import { dropOffApi } from '../../api/dropOffApi';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApiData } from '../../hooks/useApiData';
import { CampaignsTab } from './CampaignsTab';
import { CentresTab } from './CentresTab';
import { RatesTab } from './RatesTab';
import { ReviewTab } from './ReviewTab';
import { RewardsTab } from './RewardsTab';
import { VouchersTab } from './VouchersTab';

type Tab = 'review' | 'rates' | 'campaigns' | 'centres' | 'rewards' | 'vouchers';

const TABS: { value: Tab; label: string; icon: LucideIcon }[] = [
  { value: 'review', label: 'To review', icon: ShieldCheck },
  { value: 'rates', label: 'Points per kg', icon: Scale },
  { value: 'campaigns', label: 'Campaigns', icon: Sparkles },
  { value: 'centres', label: 'Centres', icon: MapPin },
  { value: 'rewards', label: 'Rewards', icon: Gift },
  { value: 'vouchers', label: 'Vouchers', icon: Ticket },
];

// Recycler manager / admin: everything about recycling points in one place
export function RewardsAdminPage() {
  const [tab, setTab] = useState<Tab>('review');
  const { data: pending, setData: setPending, loading } = useApiData(dropOffApi.getPendingReview, []);

  return (
    <div>
      <PageHeader title="Recycling rewards" description="Check large drop-offs, set points, run campaigns and manage rewards." />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              tab === value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="size-4" /> {label}
            {value === 'review' && pending.length > 0 && (
              <span
                className={`rounded-full px-1.5 text-xs ${tab === value ? 'bg-white/20' : 'bg-amber-100 text-amber-800'}`}
              >
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'review' && (
        <ReviewTab
          dropOffs={pending}
          loading={loading}
          onReviewed={(id) => setPending((list) => list.filter((d) => d.id !== id))}
        />
      )}
      {tab === 'rates' && <RatesTab />}
      {tab === 'campaigns' && <CampaignsTab />}
      {tab === 'centres' && <CentresTab />}
      {tab === 'rewards' && <RewardsTab />}
      {tab === 'vouchers' && <VouchersTab />}
    </div>
  );
}