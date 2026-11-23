import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';

interface EnumEditorProps {
  values: (string | number)[];
  onChange: (values: (string | number)[]) => void;
}

export function EnumEditor({ values, onChange }: EnumEditorProps) {
  const { t } = useT();

  const move = (index: number, delta: number) => {
    const next = [...values];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="mb-3">
      <div className="mb-1 text-[11px] font-medium text-zinc-500">{t('inspector.options')}</div>
      <div className="flex flex-col gap-1">
        {values.map((value, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              value={String(value)}
              onChange={(e) => {
                const next = [...values];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="h-9 w-full rounded-md border border-zinc-300 px-2.5 text-sm outline-none focus:border-blue-400"
            />
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-300 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
              title="↑"
            >
              <Icon name="chevron-down" className="h-3.5 w-3.5 rotate-180" />
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === values.length - 1}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-300 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"
              title="↓"
            >
              <Icon name="chevron-down" className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-300 text-zinc-500 hover:bg-red-50 hover:text-red-600"
              title={t('inspector.delete')}
            >
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...values, `${t('default.option1')} ${values.length + 1}`])}
        className="mt-1.5 flex items-center gap-1 rounded-md border border-dashed border-zinc-300 px-2 py-1 text-[11px] text-zinc-500 hover:bg-zinc-50"
      >
        <Icon name="plus" className="h-3 w-3" />
        {t('inspector.addOption')}
      </button>
    </div>
  );
}
