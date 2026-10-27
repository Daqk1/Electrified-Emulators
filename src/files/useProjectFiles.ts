import { useEffect, useRef, useState } from 'react';
import { useEditor } from '../state/EditorProvider';
import { downloadJson, downloadPng, downloadSvg } from './downloads';
import { readProjectFile } from './loadProject';

export function useProjectFiles() {
  const { dispatch, getSnapshot } = useEditor();
  const request = useRef(0);
  const mounted = useRef(true);
  const pngPending = useRef(false);
  const [exportingPng, setExportingPng] = useState(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; request.current++; }; }, []);
  const showError = (error: unknown) => {
    if (mounted.current) dispatch({ type: 'showModal', title: 'CircuitEDU notice', message: error instanceof Error ? error.message : 'The operation could not be completed.' });
  };
  const run = (operation: () => void) => { try { operation(); } catch (error) { showError(error); } };
  return {
    exportingPng,
    cancelPendingLoad: () => { request.current++; },
    exportSvg: () => run(() => downloadSvg(getSnapshot().circuit)),
    saveJson: () => run(() => downloadJson(getSnapshot().circuit)),
    exportPng: async () => {
      if (pngPending.current) return;
      pngPending.current = true;
      setExportingPng(true);
      try { await downloadPng(getSnapshot().circuit); }
      catch (error) { showError(error); }
      finally { pngPending.current = false; if (mounted.current) setExportingPng(false); }
    },
    load: async (file: File) => {
      const ticket = ++request.current;
      try {
        const circuit = await readProjectFile(file);
        if (mounted.current && ticket === request.current) dispatch({ type: 'loadCircuit', circuit });
      } catch (error) { if (ticket === request.current) showError(error); }
    },
  };
}
