import { Recycle } from 'lucide-react';

interface Props {
  // "light" for dark backgrounds
  variant?: 'dark' | 'light';
}

export function Logo({ variant = 'dark' }: Readonly<Props>) {
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/30">
        <Recycle className="size-5" />
      </div>
      <span className={`text-lg font-bold tracking-tight ${textColor}`}>
        EcoCycle <span className="text-brand-500">LK</span>
      </span>
    </div>
  );
}