import { LoaderCircle } from 'lucide-react';

export function Spinner({ className = 'size-5' }: Readonly<{ className?: string }>) {
  return <LoaderCircle className={`animate-spin ${className}`} />;
}

// Full page loading screen
export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-brand-600">
      <Spinner className="size-8" />
    </div>
  );
}