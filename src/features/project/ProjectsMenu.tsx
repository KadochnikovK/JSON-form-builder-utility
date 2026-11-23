import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { useBuilder } from '@/features/document-model/store';
import { deleteUserProject, listUserProjects, loadProjectById, type ProjectMeta } from './storage';
import { useT } from '@/shared/i18n';
import { Icon } from '@/shared/ui/Icon';

const itemCls =
  'cursor-pointer rounded px-2 py-1.5 text-xs text-zinc-700 outline-none hover:bg-zinc-100';

export function ProjectsMenu() {
  const { t } = useT();
  const [projects, setProjects] = useState<ProjectMeta[]>([]);

  const refresh = () => setProjects(listUserProjects());

  const load = (id: string) => {
    const file = loadProjectById(id);
    if (file?.root) {
      useBuilder.getState().loadProject(file.root, file.name, file.id);
    }
  };

  const remove = (meta: ProjectMeta) => {
    if (!window.confirm(`${t('projects.deleteTitle')}: "${meta.name}"?`)) return;
    deleteUserProject(meta.id);
    refresh();
  };

  return (
    <DropdownMenu.Root onOpenChange={(open) => open && refresh()}>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100">
          <Icon name="folder" className="h-3.5 w-3.5" />
          {t('projects.menu')}
          <Icon name="chevron-down" className="h-3 w-3" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-64 max-w-80 rounded-lg border border-zinc-200 bg-white p-1 shadow-lg"
        >
          {projects.length === 0 ? (
            <div className="px-2 py-3 text-center text-xs text-zinc-400">{t('projects.empty')}</div>
          ) : (
            projects.map((meta) => (
              <div key={meta.id} className="flex items-center gap-1 rounded px-1 hover:bg-zinc-50">
                <button onClick={() => load(meta.id)} className="min-w-0 flex-1 cursor-pointer rounded px-1.5 py-1.5 text-left">
                  <div className="truncate text-xs font-medium text-zinc-700">{meta.name}</div>
                  <div className="text-[10px] text-zinc-400">
                    {new Date(meta.updatedAt).toLocaleString()}
                  </div>
                </button>
                <button
                  onClick={() => remove(meta)}
                  title={t('projects.deleteTitle')}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="trash" className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
