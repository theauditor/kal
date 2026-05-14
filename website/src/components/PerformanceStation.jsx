import React, { useState, useEffect } from 'react';
import { Repl } from '../repl/Repl';
import { AnimatedKaalLogo } from '@branding/AnimatedKaalLogo';
import { getActivePattern, getViewingPatternData, userPattern, setActivePattern, setViewingPatternData } from '../user_pattern_utils.mjs';

export function PerformanceStation() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we need to load a project from the hash
    const hash = window.location.hash.substring(1);
    if (hash && hash.length === 8) {
      const project = userPattern.getPatternData(hash);
      if (project) {
        setViewingPatternData(project);
        setActivePattern(hash);
      }
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToStages = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0a] z-[1000] flex flex-col items-center justify-center overflow-hidden">
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
      <button 
        onClick={handleBackToStages}
        className="fixed bottom-4 left-4 z-[100] px-4 py-2 bg-[#1a1a1a]/80 backdrop-blur-md border border-[#333] hover:border-[#c9a84c] text-white rounded-lg transition-all flex items-center gap-2 text-sm shadow-2xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        <span>EXIT TO STATION</span>
      </button>
    </div>
  );
}
