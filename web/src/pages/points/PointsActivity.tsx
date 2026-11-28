import { useState } from 'react';
import { History, Receipt, Ticket } from 'lucide-react';
import { DropOffStatusBadge, RedemptionStatusBadge } from '../../components/recycling/RecyclingBadges';
import { ReceiptModal } from '../../components/recycling/ReceiptModal';
import type { DropOff, PointTransaction, Redemption } from '../../types/recycling';
import { formatDateTime } from '../../utils/complaint';
import { formatKg, formatPoints } from '../../utils/recycling';

type Tab = 'history' | 'receipts' | 'vouchers';

interface Props {
  history: PointTransaction[];
  receipts: DropOff[];
  vouchers: Redemption[];
}

const EMPTY_TEXT: Record<Tab, string> = {
  history: 'No points yet. Bring your recyclables to a centre to start earning.',
  receipts: 'Your drop-off receipts will show here.',
  vouchers: 'Rewards you redeem will show here.',
};

// Household: points history, receipts and vouchers
export function PointsActivity({ history, receipts, vouchers }: Readonly<Props>) {
  const [tab, setTab] = useState<Tab>('history');
  const [openId, setOpenId] = useState<number | null>(null);
  const openReceipt = receipts.find((r) => r.id === openId) ?? null;

  const tabs: { value: Tab; label: string; icon: typeof History; count: number }[] = [
    { value: 'history', label: 'History', icon: History, count: history.length },
    { value: 'receipts', label: 'Receipts', icon: Receipt, count: receipts.length },
    { value: 'vouchers', label: 'Vouchers', icon: Ticket, count: vouchers.length },
  ];
  const count = tabs.find((t) => t.value === tab)?.count ?? 0;

  return (
    <section>
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {tabs.map(({ value, label, icon: Icon, count: tabCount }) => (
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
            <span className={`rounded-full px-1.5 text-xs ${tab === value ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
              {tabCount}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {count === 0 && <p className="p-6 text-center text-sm text-slate-500">{EMPTY_TEXT[tab]}</p>}

        {tab === 'history' && (
          <ul className="divide-y divide-slate-100">
            {history.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{t.description}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(t.createdAt)}
                    {t.voucherCode && <span className="font-mono"> · {t.voucherCode}</span>}
                  </p>
                </div>
                <span className={`shrink-0 font-semibold ${t.points > 0 ? 'text-brand-700' : 'text-slate-700'}`}>
                  {t.points > 0 ? '+' : ''}
                  {formatPoints(t.points)}
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'receipts' && (
          <ul className="divide-y divide-slate-100">
            {receipts.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setOpenId(r.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {formatKg(r.totalWeightKg)} at {r.centreName}
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-mono">{r.receiptNumber}</span> · {formatDateTime(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-semibold text-slate-900">{formatPoints(r.totalPoints)} pts</span>
                    <DropOffStatusBadge status={r.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        {tab === 'vouchers' && (
          <ul className="divide-y divide-slate-100">
            {vouchers.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{v.rewardName}</p>
                  <p className="text-xs text-slate-500">
                    {formatPoints(v.points)} points · {formatDateTime(v.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-sm font-semibold tracking-wider text-slate-900">{v.voucherCode}</span>
                  <RedemptionStatusBadge status={v.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {openReceipt && <ReceiptModal dropOff={openReceipt} onClose={() => setOpenId(null)} />}
    </section>
  );
}