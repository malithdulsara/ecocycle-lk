// Placeholder for pages we build in later steps
export function ComingSoonPage({ title }: Readonly<{ title: string }>) {
  return (
    <div>
      <h1>{title}</h1>
      <div className="card muted">This page is coming in a later step.</div>
    </div>
  );
}