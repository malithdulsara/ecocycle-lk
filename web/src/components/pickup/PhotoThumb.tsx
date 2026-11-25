import { fileUrl } from '../../api/fileApi';

interface Props {
  fileName: string;
  className?: string;
}

// Small photo that opens the full size photo in a new tab
export function PhotoThumb({ fileName, className = 'size-20' }: Readonly<Props>) {
  return (
    <a
      href={fileUrl(fileName)}
      target="_blank"
      rel="noreferrer"
      className={`block shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${className}`}
    >
      <img src={fileUrl(fileName)} alt="Uploaded by the household" className="size-full object-cover" />
    </a>
  );
}
