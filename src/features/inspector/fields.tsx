import type { ReactNode } from 'react';

const inputCls =
  'h-9 w-full rounded-md border border-zinc-300 px-2.5 text-sm text-zinc-700 outline-none focus:border-blue-400';
const labelCls = 'mb-1 block text-[11px] font-medium text-zinc-500';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  mono?: boolean;
}

export function TextField({ label, value, onChange, placeholder, hint, mono }: TextFieldProps) {
  return (
    <div className="mb-3">
      <label className={labelCls}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={mono ? `${inputCls} font-mono` : inputCls}
      />
      {hint && <div className="mt-1 text-[10px] text-zinc-400">{hint}</div>}
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function NumberField({ label, value, onChange }: NumberFieldProps) {
  return (
    <div className="mb-3">
      <label className={labelCls}>{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === '') {
            onChange(undefined);
            return;
          }
          const parsed = Number(raw);
          onChange(Number.isNaN(parsed) ? undefined : parsed);
        }}
        className={inputCls}
      />
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function SelectField({ label, value, onChange, options, allowEmpty, emptyLabel }: SelectFieldProps) {
  return (
    <div className="mb-3">
      <label className={labelCls}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      >
        {allowEmpty && <option value="">{emptyLabel ?? '—'}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <label className="mb-3 flex cursor-pointer items-center gap-2 text-xs text-zinc-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      {label}
    </label>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 mt-4 border-b border-zinc-200 pb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 first:mt-0">
      {children}
    </div>
  );
}
