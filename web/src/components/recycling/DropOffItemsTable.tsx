import { WasteTypeDot } from '../schedule/WasteTypeDot';
import type { DropOffItem } from '../../types/recycling';
import { formatKg, formatMultiplier, formatPoints } from '../../utils/recycling';

interface Props {
  items: DropOffItem[];
  totalWeightKg: number;
  totalPoints: number;
}

// Material, weight, rate x campaign = points. Used on receipts and before the operator confirms.
export function DropOffItemsTable({ items, totalWeightKg, totalPoints }: Readonly<Props>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-104 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          <tr>
            <th className="px-3 py-2">Material</th>
            <th className="px-3 py-2 text-right">Weight</th>
            <th className="px-3 py-2">Rate</th>
            <th className="px-3 py-2 text-right">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.wasteTypeId}>
              <td className="px-3 py-2">
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  <WasteTypeDot color={item.color} /> {item.wasteTypeName}
                </span>
              </td>
              <td className="px-3 py-2 text-right text-slate-600">{formatKg(item.weightKg)}</td>
              <td className="px-3 py-2 text-slate-600">
                {item.pointsPerKg} / kg
                {item.campaignName && (
                  <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                    {formatMultiplier(item.multiplier)} {item.campaignName}
                  </span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatPoints(item.points)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
          <tr>
            <td className="px-3 py-2">Total</td>
            <td className="px-3 py-2 text-right">{formatKg(totalWeightKg)}</td>
            <td />
            <td className="px-3 py-2 text-right text-brand-700">{formatPoints(totalPoints)} pts</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}