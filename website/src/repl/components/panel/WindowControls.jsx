import React from 'react';
import { XMarkIcon, MinusIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/16/solid';
import { useState, useEffect } from 'react';
import { useTauriWindow } from './useTauriWindow';

const IS_TAURI = typeof window !== 'undefined' && (window.__TAURI__ || window.__TAURI_INTERNALS__);

export function WindowControls() {
  if (!IS_TAURI) return null;

  const [isMaximized, setIsMaximized] = useState(false);
  const { appWindow } = useTauriWindow();

  useEffect(() => {
    if (appWindow) {
      appWindow.isMaximized().then(setIsMaximized);
      const unlisten = appWindow.onResized(() => {
        appWindow.isMaximized().then(setIsMaximized);
      });
      return () => { unlisten.then(fn => fn()); };
    }
  }, [appWindow]);

  const handleMinimize = () => appWindow?.minimize();
  const handleMaximize = () => appWindow?.toggleMaximize();
  const handleClose = () => appWindow?.close();

  return (
    <div className="flex items-center h-full ml-2 overflow-hidden rounded-bl-lg">
      <button
        onClick={handleMinimize}
        className="h-full px-2.5 hover:bg-white/5 transition-colors text-[#f0d080]/60 hover:text-[#f0d080]"
        title="Minimize"
      >
        <MinusIcon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleMaximize}
        className="h-full px-2.5 hover:bg-white/5 transition-colors text-[#f0d080]/60 hover:text-[#f0d080]"
        title={isMaximized ? "Restore" : "Maximize"}
      >
        {isMaximized ? (
          <ArrowsPointingInIcon className="w-3.5 h-3.5" />
        ) : (
          <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
        )}
      </button>
      <button
        onClick={handleClose}
        className="h-full px-3 hover:bg-red-500/60 hover:text-white transition-colors text-[#f0d080]/60"
        title="Close"
      >
        <XMarkIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
