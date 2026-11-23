import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { toDataBindings, toJsonSchema, toUiSchema } from '@/features/document-model/serialize';
import type { LayoutNode, ThemeSettings } from '@/features/document-model/types';
import { slugify } from '@/shared/lib/slug';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';
import { copyText, downloadJson } from './exporters';

const itemCls =
  'cursor-pointer rounded px-2 py-1.5 text-xs text-zinc-700 outline-none hover:bg-zinc-100';

export function ExportMenu({
  root,
  meta,
  theme,
}: {
  root: LayoutNode;
  meta: { id: string | null; name: string };
  theme: ThemeSettings;
}) {
  const { t } = useT();
  const [notice, setNotice] = useState<string | null>(null);

  const baseName = slugify(meta.name || 'form');
  const schema = () => toJsonSchema(root);
  const uischema = () => toUiSchema(root);
  const bindings = () => toDataBindings(root);
  const project = () => ({
    schemaVersion: 1 as const,
    id: meta.id ?? '',
    name: meta.name || t('projects.untitled'),
    updatedAt: Date.now(),
    root: structuredClone(root),
    theme,
  });

  const flash = async (text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(null), 1500);
  };

  return (
    <div className="relative">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100">
            <Icon name="download" className="h-3.5 w-3.5" />
            {t('export.menu')}
            <Icon name="chevron-down" className="h-3 w-3" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-56 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
          >
            <DropdownMenu.Item className={itemCls} onSelect={() => downloadJson(`${baseName}.schema.json`, schema())}>
              {t('export.schemaDl')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={itemCls}
              onSelect={async () => flash((await copyText(JSON.stringify(schema(), null, 2))) ? t('export.copied') : t('export.copyFailed'))}
            >
              {t('export.schemaCopy')}
            </DropdownMenu.Item>
            <DropdownMenu.Item className={itemCls} onSelect={() => downloadJson(`${baseName}.uischema.json`, uischema())}>
              {t('export.uiDl')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={itemCls}
              onSelect={async () => flash((await copyText(JSON.stringify(uischema(), null, 2))) ? t('export.copied') : t('export.copyFailed'))}
            >
              {t('export.uiCopy')}
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-zinc-200" />
            <DropdownMenu.Item className={itemCls} onSelect={() => downloadJson(`${baseName}.bindings.json`, bindings())}>
              {t('export.bindingsDl')}
            </DropdownMenu.Item>
            <DropdownMenu.Item className={itemCls} onSelect={() => downloadJson(`${baseName}.project.json`, project())}>
              {t('export.projectDl')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {notice && (
        <div className="absolute right-0 top-full mt-1 z-50 rounded-md bg-zinc-800 px-2 py-1 text-[11px] text-white">
          {notice}
        </div>
      )}
    </div>
  );
}
