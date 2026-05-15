import React from 'react';
import cx from '@src/cx.mjs';
import { useViewingPatternData } from '@src/user_pattern_utils.mjs';
import { XMarkIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export function HistoryPanel({ context }) {
  const { handleRollback, setShowHistory } = context;
  const viewingPatternData = useViewingPatternData();
  const history = viewingPatternData?.history || [];
  
  // Sort history newest first
  const sortedHistory = [...history].reverse();

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 bg-surface-container-low/20">
      <div className="p-6 border-b border-outline-variant bg-surface-container-low/40">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-uppercase text-label-uppercase text-on-surface-variant/60 text-[10px] tracking-widest uppercase">STAGE TIMELINE</h3>
          <button 
            onClick={() => setShowHistory(false)}
            className="text-on-surface-variant/40 hover:text-primary transition-colors flex items-center gap-1 group"
          >
            <span className="text-[8px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">CLOSE</span>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <h4 className="font-label-uppercase text-[9px] text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
            <ClockIcon className="w-3 h-3" />
            Snapshots
          </h4>
          <span className="font-mono text-[9px] text-primary/60">{history.length} versions</span>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col min-h-0 p-6">
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-3 scroll-hide">
          {sortedHistory.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-outline-variant/30 rounded-lg bg-surface-container-low/20">
              <ClockIcon className="w-8 h-8 text-on-surface-variant/10 mb-2" />
              <span className="text-[10px] text-on-surface-variant/30 font-mono text-center px-4">No snapshots yet.<br/>Press Play to save your first state.</span>
            </div>
          ) : (
            sortedHistory.map((entry, idx) => (
              <div 
                key={entry.timestamp} 
                className="p-3 bg-surface-container-high/20 border border-outline-variant/50 rounded-lg hover:border-primary/30 transition-all duration-200 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                
                <div className="flex justify-between items-start mb-2 pl-1">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-on-surface font-bold">
                      {idx === 0 ? 'LATEST VERSION' : `VERSION ${sortedHistory.length - idx}`}
                    </span>
                    <span className="text-[9px] text-on-surface-variant/50 font-mono">
                      {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRollback(entry)}
                    className="bg-primary/10 hover:bg-primary text-primary hover:text-on-primary px-2 py-1 rounded text-[9px] font-mono uppercase tracking-tighter transition-all duration-200"
                  >
                    Rollback
                  </button>
                </div>
                
                <div className="pl-1">
                  <div className="text-[8px] font-mono text-on-surface-variant/40 bg-black/20 p-1.5 rounded line-clamp-2 italic">
                    {entry.code.substring(0, 100)}...
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-6 border-t border-outline-variant/20 bg-surface-container-low/40">
        <p className="text-[8px] text-on-surface-variant/40 leading-relaxed uppercase tracking-tight">
          Snapshots are automatically captured on every Play or Update action if the code has changed. 
          Limited to the last 100 entries per stage.
        </p>
      </div>
    </div>
  );
}
