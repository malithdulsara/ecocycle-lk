import { Clock, MapPin, Phone, Sparkles } from 'lucide-react';
import { recyclingApi } from '../../api/recyclingApi';
import { WasteTypeDot } from '../../components/schedule/WasteTypeDot';
import { useApiData } from '../../hooks/useApiData';
import { formatShortDate } from '../../utils/schedule';
import { formatMultiplier } from '../../utils/recycling';

// Household: running campaigns, points per kg and the centres
export function WhereToRecycle() {
  const { data: rates } = useApiData(recyclingApi.getRates, []);
  const { data: centres } = useApiData(recyclingApi.getCentres, []);
  const { data: campaigns } = useApiData(recyclingApi.getRunningCampaigns, []);

  const accepted = rates.filter((r) => r.pointsPerKg !== null);

  return (
    <section className="space-y-4">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold text-amber-900">
              {campaign.name}: {formatMultiplier(campaign.multiplier)} points on{' '}
              {campaign.wasteTypeName ?? 'every material'}
            </p>
            <p className="text-amber-800">
              {campaign.description ? `${campaign.description} · ` : ''}until {formatShortDate(campaign.endDate)}
            </p>
          </div>
        </div>
      ))}

      <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Points per kg</h3>
          <ul className="space-y-2 text-sm">
            {accepted.map((rate) => (
              <li key={rate.wasteTypeId} className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-slate-700">
                  <WasteTypeDot color={rate.color} /> {rate.wasteTypeName}
                </span>
                <span className="font-semibold text-slate-900">{rate.pointsPerKg}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Clean and dry materials only.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">Collection centres</h3>
          {centres.length === 0 ? (
            <p className="text-sm text-slate-500">No centres are open yet.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {centres.map((centre) => (
                <li key={centre.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="font-medium text-slate-900">{centre.name}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-slate-600">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" /> {centre.address}
                  </p>
                  {centre.openingHours && (
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="size-3.5 shrink-0" /> {centre.openingHours}
                    </p>
                  )}
                  {centre.phone && (
                    <p className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="size-3.5 shrink-0" /> {centre.phone}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}