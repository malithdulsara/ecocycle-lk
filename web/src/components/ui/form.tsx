import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

const FIELD_CLASSES =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 disabled:bg-slate-50 disabled:text-slate-500';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  icon?: LucideIcon; // optional icon inside the box, on the left
}

// Label + text box. Use it like a normal input: <TextInput id="name" label="Name" value=... onChange=... />
export function TextInput({ id, label, hint, icon: Icon, className = '', ...inputProps }: Readonly<TextInputProps>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
        )}
        <input id={id} className={`${FIELD_CLASSES} ${Icon ? 'pl-10' : ''} ${className}`} {...inputProps} />
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label?: string;
  options: SelectOption[];
}

// Label + dropdown. Leave "label" empty for a dropdown without a label (e.g. inside a table)
export function SelectInput({ id, label, options, className = '', ...selectProps }: Readonly<SelectInputProps>) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select id={id} className={`${FIELD_CLASSES} ${className}`} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextAreaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  hint?: string;
}

// Label + multi-line text box
export function TextAreaInput({ id, label, hint, className = '', ...textAreaProps }: Readonly<TextAreaInputProps>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea id={id} className={`${FIELD_CLASSES} resize-none ${className}`} {...textAreaProps} />
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}