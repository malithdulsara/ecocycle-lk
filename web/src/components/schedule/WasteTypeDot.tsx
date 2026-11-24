interface Props {
  color: string;
  className?: string;
}

// Small round dot in the waste type's color
export function WasteTypeDot({ color, className = 'size-2.5' }: Readonly<Props>) {
  return <span className={`inline-block shrink-0 rounded-full ${className}`} style={{ backgroundColor: color }} />;
}