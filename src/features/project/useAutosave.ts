import { useEffect } from 'react';
import { useBuilder } from '@/features/document-model/store';
import { loadProjectById, saveAutosave, AUTOSAVE_ID } from './storage';
import { useT } from '@/shared/i18n';

export function useAutosave() {
  const { t } = useT();

  useEffect(() => {
    const stored = loadProjectById(AUTOSAVE_ID);
    if (stored?.root) {
      useBuilder.getState().loadProject(stored.root, stored.name, null, stored.theme);
    }
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const unsubscribe = useBuilder.subscribe((state, prev) => {
      if (
        state.root === prev.root &&
        state.projectMeta === prev.projectMeta &&
        state.theme === prev.theme
      ) {
        return;
      }
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const current = useBuilder.getState();
        saveAutosave(current.root, current.projectMeta.name, t('projects.untitled'), current.theme);
      }, 600);
    });
    return () => {
      unsubscribe();
      window.clearTimeout(timer);
    };
  }, [t]);
}
