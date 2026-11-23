import { Icon } from '@/shared/ui/Icon';
import { useT } from '@/shared/i18n';
import { useRef, useState } from 'react';
import { useBuilder } from '@/features/document-model/store';
import { ExportMenu } from '@/features/export/ExportMenu';
import { parseImportedFile } from '@/features/project/importFile';
import { ProjectsMenu } from '@/features/project/ProjectsMenu';
import { saveProjectNow } from '@/features/project/storage';
import type { Lang } from '@/shared/i18n';

const btnCls = 'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent';

export function Toolbar() {
  const { t, lang, setLang } = useT();
  const root = useBuilder((s) => s.root);
  const projectMeta = useBuilder((s) => s.projectMeta);
  const setProjectMeta = useBuilder((s) => s.setProjectMeta);
  const past = useBuilder((s) => s.past.length);
  const future = useBuilder((s) => s.future.length);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const mode = useBuilder((s) => s.mode);
  const setMode = useBuilder((s) => s.setMode);
  const codePanelOpen = useBuilder((s) => s.codePanelOpen);
  const toggleCodePanel = useBuilder((s) => s.toggleCodePanel);
  const newProject = useBuilder((s) => s.newProject);
  const theme = useBuilder((s) => s.theme);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const importFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseImportedFile(text);
    if (!parsed) {
      setNotice(t('import.failed'));
      window.setTimeout(() => setNotice(null), 2000);
      return;
    }
    const store = useBuilder.getState();
    store.loadProject(parsed.root, parsed.name || file.name.replace(/\.json$/i, ''), parsed.id, parsed.theme);
    setNotice(null);
  };

  const save = () => {
    setProjectMeta(
      saveProjectNow(
        useBuilder.getState().root,
        useBuilder.getState().projectMeta,
        t('projects.untitled'),
        useBuilder.getState().theme,
      ),
    );
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3">
      <div className="flex items-center gap-1.5 pr-2 text-sm font-semibold text-zinc-800">
        <Icon name="select" className="h-4 w-4 text-blue-600" />
        {t('app.title')}
      </div>
      <input
        value={projectMeta.name}
        onChange={(e) => setProjectMeta({ ...projectMeta, name: e.target.value })}
        placeholder={t('toolbar.projectName')}
        className="w-52 rounded-md border border-zinc-300 px-2 py-1 text-xs outline-none focus:border-blue-400"
      />
      <button onClick={save} className={btnCls}>
        <Icon name="save" className="h-3.5 w-3.5" />
        {t('toolbar.save')}
      </button>
      <ProjectsMenu />
      <button onClick={newProject} className={btnCls}>
        <Icon name="plus" className="h-3.5 w-3.5" />
        {t('toolbar.new')}
      </button>
      <button onClick={() => fileInputRef.current?.click()} className={btnCls}>
        <Icon name="folder" className="h-3.5 w-3.5" />
        {t('import.button')}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void importFile(file);
          e.target.value = '';
        }}
      />
      {notice && (
        <span className="rounded-md bg-red-100 px-2 py-1 text-[11px] font-medium text-red-700">{notice}</span>
      )}

      <div className="mx-1 h-6 w-px bg-zinc-200" />

      <button onClick={undo} disabled={past === 0} className={btnCls} title={t('toolbar.undo')}>
        <Icon name="undo" className="h-3.5 w-3.5" />
      </button>
      <button onClick={redo} disabled={future === 0} className={btnCls} title={t('toolbar.redo')}>
        <Icon name="redo" className="h-3.5 w-3.5" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <ExportMenu root={root} meta={projectMeta} theme={theme} />
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          className="rounded-md border border-zinc-300 px-1.5 py-1 text-xs outline-none"
        >
          <option value="ru">RU</option>
          <option value="en">EN</option>
        </select>
        <div className="flex items-center rounded-md border border-zinc-300 p-0.5">
          {(
            [
              ['edit', 'toolbar.edit', 'pencil'],
              ['preview', 'toolbar.preview', 'play'],
            ] as [mode: 'edit' | 'preview', key: string, icon: string][]
          ).map(([value, key, icon]) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={
                mode === value
                  ? 'flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white'
                  : 'flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100'
              }
            >
              <Icon name={icon as 'pencil'} className="h-3 w-3" />
              {t(key)}
            </button>
          ))}
        </div>
        <button
          onClick={toggleCodePanel}
          title={t('toolbar.codePanel')}
          className={
            codePanelOpen
              ? 'flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
              : 'flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100'
          }
        >
          <Icon name="clipboard" className="h-3.5 w-3.5" />
          {t('toolbar.codePanel')}
        </button>
      </div>
    </header>
  );
}
