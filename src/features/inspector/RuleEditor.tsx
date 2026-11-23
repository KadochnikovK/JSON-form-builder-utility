import { useT } from '@/shared/i18n';
import { useBuilder } from '@/features/document-model/store';
import type { ControlNode, RuleEffect, RuleOperator } from '@/features/document-model/types';
import { collectControlNames } from '@/features/document-model/ops';
import { SelectField, TextField } from './fields';

const EFFECT_OPTIONS: { value: RuleEffect; labelKey: string }[] = [
  { value: 'SHOW', labelKey: 'rule.effect.show' },
  { value: 'HIDE', labelKey: 'rule.effect.hide' },
  { value: 'ENABLE', labelKey: 'rule.effect.enable' },
  { value: 'DISABLE', labelKey: 'rule.effect.disable' },
];

const OPERATOR_OPTIONS: { value: RuleOperator; labelKey: string }[] = [
  { value: 'equals', labelKey: 'rule.operator.equals' },
  { value: 'notEquals', labelKey: 'rule.operator.notEquals' },
];

export function RuleEditor({ node, root }: { node: ControlNode; root: ReturnType<typeof useBuilder.getState>['root'] }) {
  const { t } = useT();
  const updateControl = useBuilder((s) => s.updateControl);

  const otherFields = Array.from(collectControlNames(root, node.id));

  const rule = node.rule;

  return (
    <details className="mb-2 rounded-md border border-zinc-200 bg-white">
      <summary className="flex cursor-pointer items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-zinc-700 select-none">
        {t('rule.title')}
        {rule && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
      </summary>
      <div className="border-t border-zinc-200 p-2.5">
        {!rule ? (
          <button
            onClick={() =>
              updateControl(node.id, {
                rule: { effect: 'SHOW', field: otherFields[0] ?? '', operator: 'equals', value: '' },
              })
            }
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-zinc-300 px-2 py-1.5 text-[11px] text-zinc-500 hover:bg-zinc-50"
          >
            {t('rule.add')}
          </button>
        ) : (
          <>
            <SelectField
              label={t('rule.effect')}
              value={rule.effect}
              onChange={(effect) => updateControl(node.id, { rule: { ...rule, effect: effect as RuleEffect } })}
              options={EFFECT_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
            <SelectField
              label={t('rule.field')}
              value={rule.field}
              onChange={(field) => updateControl(node.id, { rule: { ...rule, field } })}
              options={otherFields.map((name) => ({ value: name, label: name }))}
              allowEmpty
              emptyLabel={t('rule.fieldNone')}
            />
            <SelectField
              label={t('rule.operator')}
              value={rule.operator}
              onChange={(operator) => updateControl(node.id, { rule: { ...rule, operator: operator as RuleOperator } })}
              options={OPERATOR_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
            <TextField
              label={t('rule.value')}
              value={rule.value}
              onChange={(value) => updateControl(node.id, { rule: { ...rule, value } })}
            />
            <button
              onClick={() => updateControl(node.id, { rule: undefined })}
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1 text-[11px] font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600"
            >
              {t('rule.remove')}
            </button>
          </>
        )}
      </div>
    </details>
  );
}
