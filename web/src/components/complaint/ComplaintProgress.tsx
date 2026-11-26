import { Check } from 'lucide-react';
import type { ComplaintStatus } from '../../types/complaint';

const STEPS = ['Received', 'Assigned', 'Working', 'Resolved'];

// How far each status has reached in STEPS
const STEP_INDEX: Record<ComplaintStatus, number> = {
  OPEN: 0,
  ASSIGNED: 1,
  IN_PROGRESS: 2,
  RESOLVED: 3,
  REJECTED: -1,
};

// Received -> Assigned (to an officer) -> Working -> Resolved
export function ComplaintProgress({ status }: Readonly<{ status: ComplaintStatus }>) {
  const current = STEP_INDEX[status];
  if (current < 0) {
    return null; // rejected complaints do not show the steps
  }

  return (
    <ol className="flex items-center">
      {STEPS.map((step, position) => {
        const done = position <= current;
        const isLast = position === STEPS.length - 1;
        return (
          <li key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${done ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}
              >
                {done ? <Check className="size-3.5" /> : position + 1}
              </span>
              <span className={`text-xs whitespace-nowrap ${done ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className={`mx-2 mb-5 h-0.5 flex-1 rounded ${position < current ? 'bg-brand-600' : 'bg-slate-200'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}