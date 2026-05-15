import React, { useState, useEffect } from 'react';
import { Repl } from '../repl/Repl';
import { AnimatedKaalLogo } from '@branding/AnimatedKaalLogo';
import { getActivePattern, getViewingPatternData, userPattern, setActivePattern, setViewingPatternData, migrateToDB } from '../user_pattern_utils.mjs';

export function PerformanceStation() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Migrate if needed
      await migrateToDB();

      // Check if we need to load a project from the hash
      const hash = window.location.hash.substring(1);
      if (hash && hash.length === 8) {
        const project = await userPattern.getPatternData(hash);
        if (project) {
          setViewingPatternData(project);
          setActivePattern(hash);
        }
      }
      setIsLoading(false);
    }
    init();
  }, []);

  if (isLoading) {
    return (
      <div data-tauri-drag-region className="fixed inset-0 bg-[#0a0a0a] z-[1000] flex flex-col items-center justify-center overflow-hidden cursor-move">
        <AnimatedKaalLogo size={300} />
        <div className="mt-8 flex flex-col items-center gap-2">
          <h1 className="text-[#c9a84c] text-3xl font-display-lg tracking-[0.4em] font-bold animate-pulse">KĀL</h1>
          <p className="text-[#c9a84c]/50 text-xs tracking-[0.2em] uppercase font-medium">Initializing Performance Station</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a]">
      <div className="flex-grow">
        <Repl />
      </div>
    </div>
  );
}
