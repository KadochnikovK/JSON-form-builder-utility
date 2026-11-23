import type { ReactNode } from 'react';
import type { ControlNode } from '@/features/document-model/types';
import { useT } from '@/shared/i18n';
import { cx } from '@/shared/lib/cx';
import { Icon } from '@/shared/ui/Icon';

const inputCls = 'h-10 w-full rounded-md border border-zinc-300 bg-zinc-50 px-2.5 text-sm text-zinc-600';

export function ControlPreview({ node }: { node: ControlNode }) {
  const { t } = useT();
  const labelText = node.label || node.name;
  const description: ReactNode = node.description ? (
    <div className="text-[11px] text-zinc-400">{node.description}</div>
  ) : null;

  switch (node.controlType) {
    case 'checkbox':
      return (
        <div className="pointer-events-none">
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" className="h-4 w-4" checked={node.schema.default === true} readOnly />
            {labelText}
            {node.required && <span className="text-red-500">*</span>}
          </label>
          {description}
        </div>
      );
    case 'select':
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <div className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 bg-zinc-50 px-2.5 text-sm text-zinc-500">
            <span className="truncate">{t('canvas.emptySelect')}</span>
            <Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </div>
        </FieldShell>
      );
    case 'radio':
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {(node.schema.enum ?? []).map((option, i) => (
              <label key={i} className="flex items-center gap-1.5 text-sm text-zinc-600">
                <input type="radio" className="h-3.5 w-3.5" readOnly checked={i === 0} />
                {String(option)}
              </label>
            ))}
          </div>
        </FieldShell>
      );
    case 'slider':
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <input
            type="range"
            className="w-full accent-blue-500"
            min={node.schema.minimum}
            max={node.schema.maximum}
            readOnly
          />
        </FieldShell>
      );
    case 'date':
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <input type="date" placeholder={node.placeholder} className={inputCls} readOnly />
        </FieldShell>
      );
    case 'time':
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <input type="time" placeholder={node.placeholder} className={inputCls} readOnly />
        </FieldShell>
      );
    case 'datetime':
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <input type="datetime-local" placeholder={node.placeholder} className={inputCls} readOnly />
        </FieldShell>
      );
    case 'textarea':
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <textarea
            rows={3}
            placeholder={node.placeholder}
            className={cx(inputCls, 'resize-none py-1.5')}
            readOnly
          />
        </FieldShell>
      );
    case 'number':
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <input type="number" placeholder={node.placeholder} className={inputCls} readOnly />
        </FieldShell>
      );
    default:
      return (
        <FieldShell label={labelText} required={node.required} description={description}>
          <input
            type="text"
            placeholder={node.placeholder ?? t('canvas.emptyField')}
            className={inputCls}
            readOnly
          />
        </FieldShell>
      );
  }
}

function FieldShell({
  label,
  required,
  description,
  children,
}: {
  label: string;
  required: boolean;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="pointer-events-none flex flex-col gap-1">
      <div className="text-xs font-medium text-zinc-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </div>
      {children}
      {description}
    </div>
  );
}
