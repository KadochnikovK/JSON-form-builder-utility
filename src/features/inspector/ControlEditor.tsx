import { useT } from '@/shared/i18n';
import { useBuilder } from '@/features/document-model/store';
import type { ControlNode } from '@/features/document-model/types';
import { Icon } from '@/shared/ui/Icon';
import { BindingEditor } from './BindingEditor';
import { EnumEditor } from './EnumEditor';
import { PatternField } from './PatternField';
import { RuleEditor } from './RuleEditor';
import { NumberField, SelectField, SectionTitle, TextField, ToggleRow } from './fields';

const TEXT_FORMATS = [
  { value: 'email', labelKey: 'inspector.format.email' },
  { value: 'password', labelKey: 'inspector.format.password' },
  { value: 'tel', labelKey: 'inspector.format.tel' },
  { value: 'url', labelKey: 'inspector.format.url' },
];

export function ControlEditor({ node }: { node: ControlNode }) {
  const { t } = useT();
  const root = useBuilder((s) => s.root);
  const updateControl = useBuilder((s) => s.updateControl);
  const updateSchema = useBuilder((s) => s.updateSchema);
  const renameControl = useBuilder((s) => s.renameControl);
  const duplicateNode = useBuilder((s) => s.duplicateNode);
  const removeNode = useBuilder((s) => s.removeNode);

  const isEnum = node.controlType === 'select' || node.controlType === 'radio';
  const isTextLike = ['text', 'textarea', 'number', 'date'].includes(node.controlType);
  const isNumeric = node.controlType === 'number' || node.controlType === 'slider';
  const isTextual = node.controlType === 'text' || node.controlType === 'textarea';

  const setDefault = (raw: unknown) => updateSchema(node.id, { default: raw === '' ? undefined : raw });

  return (
    <div>
      <SectionTitle>{t('inspector.basic')}</SectionTitle>
      <TextField label={t('inspector.label')} value={node.label} onChange={(label) => updateControl(node.id, { label })} />
      <TextField
        label={t('inspector.name')}
        value={node.name}
        onChange={(name) => renameControl(node.id, name)}
        hint={t('inspector.nameHint')}
        mono
      />
      <TextField
        label={t('inspector.description')}
        value={node.description ?? ''}
        onChange={(description) => updateControl(node.id, { description: description || undefined })}
      />
      {isTextLike && (
        <TextField
          label={t('inspector.placeholder')}
          value={node.placeholder ?? ''}
          onChange={(placeholder) => updateControl(node.id, { placeholder: placeholder || undefined })}
        />
      )}
      <ToggleRow label={t('inspector.required')} checked={node.required} onChange={(required) => updateControl(node.id, { required })} />

      {node.schema.type === 'boolean' && (
        <ToggleRow
          label={t('inspector.defaultValue')}
          checked={node.schema.default === true}
          onChange={(checked) => updateSchema(node.id, { default: checked })}
        />
      )}
      {node.schema.type === 'string' && !isEnum && (
        <TextField
          label={t('inspector.defaultValue')}
          value={typeof node.schema.default === 'string' ? node.schema.default : ''}
          onChange={setDefault}
        />
      )}
      {node.schema.type === 'number' && !isNumeric && (
        <NumberField label={t('inspector.defaultValue')} value={typeof node.schema.default === 'number' ? node.schema.default : undefined} onChange={setDefault} />
      )}
      {isEnum && (
        <>
          <EnumEditor values={node.schema.enum ?? []} onChange={(values) => updateSchema(node.id, { enum: values })} />
          {node.schema.type === 'string' && (
            <SelectField
              label={t('inspector.defaultValue')}
              value={typeof node.schema.default === 'string' ? node.schema.default : ''}
              onChange={setDefault}
              options={(node.schema.enum ?? []).map((value) => ({ value: String(value), label: String(value) }))}
              allowEmpty
              emptyLabel={t('inspector.defaultValueNone')}
            />
          )}
        </>
      )}
      {isNumeric && (
        <NumberField label={t('inspector.defaultValue')} value={typeof node.schema.default === 'number' ? node.schema.default : undefined} onChange={setDefault} />
      )}

      <SectionTitle>{t('inspector.advanced')}</SectionTitle>
      {node.controlType === 'text' && (
        <SelectField
          label={t('inspector.format')}
          value={node.schema.format ?? ''}
          onChange={(format) => updateSchema(node.id, { format: format || undefined })}
          options={TEXT_FORMATS.map((f) => ({ value: f.value, label: t(f.labelKey) }))}
          allowEmpty
          emptyLabel={t('inspector.format.none')}
        />
      )}
      {isTextual && <PatternField pattern={node.schema.pattern} onChange={(pattern) => updateSchema(node.id, { pattern })} />}
      {isTextual && (
        <>
          <NumberField label={t('inspector.minLength')} value={node.schema.minLength} onChange={(minLength) => updateSchema(node.id, { minLength })} />
          <NumberField label={t('inspector.maxLength')} value={node.schema.maxLength} onChange={(maxLength) => updateSchema(node.id, { maxLength })} />
        </>
      )}
      {isNumeric && (
        <>
          <NumberField label={t('inspector.minimum')} value={node.schema.minimum} onChange={(minimum) => updateSchema(node.id, { minimum })} />
          <NumberField label={t('inspector.maximum')} value={node.schema.maximum} onChange={(maximum) => updateSchema(node.id, { maximum })} />
          <NumberField label={t('inspector.step')} value={node.schema.multipleOf} onChange={(multipleOf) => updateSchema(node.id, { multipleOf })} />
        </>
      )}
      <ToggleRow label={t('inspector.readOnly')} checked={node.schema.readOnly === true} onChange={(readOnly) => updateSchema(node.id, { readOnly: readOnly || undefined })} />

      <RuleEditor node={node} root={root} />
      {isEnum && <BindingEditor node={node} />}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => duplicateNode(node.id)}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <Icon name="copy" className="h-3.5 w-3.5" />
          {t('inspector.duplicate')}
        </button>
        <button
          onClick={() => removeNode(node.id)}
          className="flex items-center gap-1.5 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
          {t('inspector.delete')}
        </button>
      </div>
    </div>
  );
}
