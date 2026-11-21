// Round avatar with the user's initials, e.g. "System Admin" -> "SA"
export function Avatar({ name }: Readonly<{ name: string }>) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
      {initials}
    </div>
  );
}