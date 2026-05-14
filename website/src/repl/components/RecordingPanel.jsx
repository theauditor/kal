import React, { useState, useEffect } from 'react';
import cx from '@src/cx.mjs';

export function RecordingPanel({ context }) {
  const { toggleArm, isArmed, isRecording, startTime, recordings, currentProjectId } = context;
  const projectRecordings = recordings.filter(rec => rec.projectId === currentProjectId);
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    let interval;
    if (isRecording && startTime) {
      interval = setInterval(() => {
        const totalMs = new Date() - startTime;
        const units = Math.floor(totalMs / 50);
        const subSecond = (units % 20).toString().padStart(2, '0');
        const totalSeconds = Math.floor(totalMs / 1000);
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        setElapsed(`${m}:${s}:${subSecond}`);
      }, 50);
    } else {
      setElapsed('00:00:00');
    }
    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-label-uppercase text-label-uppercase text-on-surface-variant/60 mb-4 text-[10px] tracking-widest uppercase">RECORDING SESSION</h3>
      
      {/* Record Control */}
      <div className="mb-6">
        <button 
          onClick={toggleArm}
          className={cx(
            "w-full py-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 border group",
            isRecording 
              ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
              : isArmed 
                ? "bg-surface-tint/20 border-surface-tint text-surface-tint shadow-[0_0_15px_rgba(0,219,233,0.2)]"
                : "bg-surface-container-high/40 border-outline-variant text-on-surface-variant hover:border-surface-tint/50"
          )}
        >
          <div className={cx(
            "w-3 h-3 rounded-full transition-all duration-300",
            isRecording ? "bg-red-500 animate-pulse" : isArmed ? "bg-surface-tint shadow-[0_0_8px_rgba(0,219,233,0.8)]" : "bg-on-surface-variant/30 group-hover:bg-surface-tint/50"
          )}></div>
          <span className="font-label-uppercase text-[11px] tracking-[0.2em] font-bold">
            {isRecording ? `RECORDING ${elapsed}` : isArmed ? 'ARMED & READY' : 'ARM RECORDING'}
          </span>
        </button>
        <p className="text-[9px] text-on-surface-variant/40 mt-2 text-center uppercase tracking-tighter">
          {isRecording ? "Capturing snapshots and diffs..." : isArmed ? "Starts on next Play or Refresh" : "Capture your session as a .kal file"}
        </p>
      </div>

      {/* Recordings List */}
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-label-uppercase text-[9px] text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-2">
            <span className="material-symbols-outlined text-[12px]">history</span>
            Recent Takes
          </h4>
          <span className="font-mono text-[9px] text-on-surface-variant/30">{projectRecordings.length + (isRecording ? 1 : 0)} total</span>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-2 scroll-hide">
          {/* Active Recording Placeholder */}
          {isRecording && (
            <div className="p-3 bg-red-500/5 border border-red-500/30 rounded-lg relative overflow-hidden group animate-in fade-in slide-in-from-top-1 duration-300">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse"></div>
              <div className="flex justify-between items-start mb-1 pl-1">
                <span className="font-mono text-[10px] text-red-500 font-bold truncate pr-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Active Take...
                </span>
                <span className="font-mono text-[9px] text-red-500 bg-red-500/10 px-1 rounded">{elapsed}</span>
              </div>
              <div className="flex justify-between items-center pl-1">
                <span className="text-[9px] text-red-500/50 font-mono italic">Recording in progress...</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    <span className="w-0.5 h-2 bg-red-500/30 animate-[bounce_1s_infinite_0ms]"></span>
                    <span className="w-0.5 h-2 bg-red-500/30 animate-[bounce_1s_infinite_200ms]"></span>
                    <span className="w-0.5 h-2 bg-red-500/30 animate-[bounce_1s_infinite_400ms]"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {projectRecordings.length === 0 && !isRecording ? (
            <div className="h-32 flex flex-col items-center justify-center border border-dashed border-outline-variant/30 rounded-lg bg-surface-container-low/20">
              <span className="material-symbols-outlined text-on-surface-variant/10 text-[32px] mb-2">fiber_manual_record</span>
              <span className="text-[10px] text-on-surface-variant/30 font-mono">No recordings yet</span>
            </div>
          ) : (
            projectRecordings.map((rec) => (
              <div key={rec.id} className="p-3 bg-surface-container-high/20 border border-outline-variant/50 rounded-lg hover:border-surface-tint/30 transition-all duration-200 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-surface-tint/40 group-hover:bg-surface-tint transition-colors"></div>
                <div className="flex justify-between items-start mb-1 pl-1">
                  <span className="font-mono text-[10px] text-on-surface font-bold truncate pr-2">{rec.name}</span>
                  <span className="font-mono text-[9px] text-surface-tint bg-surface-tint/10 px-1 rounded">{rec.duration}</span>
                </div>
                <div className="flex justify-between items-center pl-1">
                  <span className="text-[9px] text-on-surface-variant/50 font-mono">{new Date(rec.date).toLocaleDateString()} {new Date(rec.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                          const blob = new Blob([rec.content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = rec.name;
                          a.click();
                          URL.revokeObjectURL(url);
                      }}
                      className="text-on-surface-variant hover:text-surface-tint transition-colors p-1"
                      title="Download Recording"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Storage Indicator */}
      <div className="mt-4 pt-4 border-t border-outline-variant/20">
        <div className="flex justify-between items-center mb-1">
          <span className="font-label-uppercase text-[8px] text-on-surface-variant/40 tracking-widest uppercase">Memory Usage</span>
          <span className="font-mono text-[8px] text-on-surface-variant/40">Local Persistence</span>
        </div>
        <div className="w-full h-[2px] bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-surface-tint/30 w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

