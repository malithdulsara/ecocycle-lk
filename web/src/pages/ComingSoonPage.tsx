import { Hammer } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

// Placeholder for pages we build in later steps
export function ComingSoonPage({ title }: Readonly<{ title: string }>) {
  return (
    <EmptyState
      icon={Hammer}
      title={`${title} is on the way`}
      message="This page is being built and will be ready in a later step."
    />
  );
}