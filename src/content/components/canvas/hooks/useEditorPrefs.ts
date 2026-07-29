import { useEffect } from 'react';
import { bindEditorPrefsPersistence, hydrateEditorPrefs } from '../../../../store/editorPrefs';

/** Load + persist tool/border prefs for the editor session. */
export function useEditorPrefs() {
  useEffect(() => {
    let unbind = () => {};
    hydrateEditorPrefs().then(() => {
      unbind = bindEditorPrefsPersistence();
    });
    return () => unbind();
  }, []);
}
