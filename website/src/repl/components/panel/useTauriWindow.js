import { useState, useEffect } from 'react';

const IS_TAURI = typeof window !== 'undefined' && (window.__TAURI__ || window.__TAURI_INTERNALS__);

export function useTauriWindow() {
  const [appWindow, setAppWindow] = useState(null);

  useEffect(() => {
    if (IS_TAURI) {
      import('@tauri-apps/api/window').then((mod) => {
        setAppWindow(mod.getCurrentWindow());
      });
    }
  }, []);

  const handleDrag = (e) => {
    if (e.button === 0 && !e.target.closest('button, input, a, select, [role="button"]')) { 
      appWindow?.startDragging();
    }
  };

  return { appWindow, handleDrag };
}
