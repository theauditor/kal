import React, { useState, useEffect, useRef } from 'react';
import cx from '@src/cx.mjs';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon, MicrophoneIcon, PauseIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { CircleStackIcon } from '@heroicons/react/24/solid';
import { usePlayback } from './usePlayback';

function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  const frames = Math.floor((ms % 1000) / 50).toString().padStart(2, '0');
  return `${m}:${s}:${frames}`;
}

export function RecordingPanel({ context }) {
  const { toggleArm, isArmed, isRecording, startTime, recordings, currentProjectId, editorRef, importRecording } = context;
  const projectRecordings = recordings.filter(rec => rec.projectId === currentProjectId);
  const [elapsed, setElapsed] = useState('00:00:00');
  const importInputRef = useRef(null);

  const {
    playingRecordingId,
    isPlaying,
    isPaused,
    currentTimeMs,
    totalDurationMs,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    seekTo,
  } = usePlayback(editorRef);

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

  const progressPercent = totalDurationMs > 0 ? Math.min(100, (currentTimeMs / totalDurationMs) * 100) : 0;

  return (
    <div className="flex flex-col flex-grow min-h-0 overflow-hidden">
      {/* Compact Controls — fixed at top */}
      <div className="shrink-0 mb-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleArm}
            disabled={isPlaying}
            className={cx(
              "flex-grow py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 border group text-[10px] font-label-uppercase tracking-[0.15em] font-bold",
              isPlaying
                ? "opacity-40 cursor-not-allowed bg-surface-container-high/40 border-outline-variant text-on-surface-variant"
                : isRecording 
                  ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                  : isArmed 
                    ? "bg-surface-tint/20 border-surface-tint text-surface-tint shadow-[0_0_15px_rgba(0,219,233,0.2)]"
                    : "bg-surface-container-high/40 border-outline-variant text-on-surface-variant hover:border-surface-tint/50"
            )}
          >
            <div className={cx(
              "w-2 h-2 rounded-full transition-all duration-300",
              isRecording ? "bg-red-500 animate-pulse" : isArmed ? "bg-surface-tint shadow-[0_0_8px_rgba(0,219,233,0.8)]" : "bg-on-surface-variant/30 group-hover:bg-surface-tint/50"
            )}></div>
            {isRecording ? `REC ${elapsed}` : isArmed ? 'ARMED' : 'ARM REC'}
          </button>

          {/* Load .kalr button — compact icon */}
          <input 
            type="file" 
            ref={importInputRef} 
            accept=".kalr" 
            className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importRecording(file);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => importInputRef.current?.click()}
            disabled={isRecording || isPlaying}
            className={cx(
              "py-2.5 px-3 rounded-lg border transition-all duration-200",
              (isRecording || isPlaying)
                ? "opacity-30 cursor-not-allowed border-outline-variant text-on-surface-variant/30"
                : "border-outline-variant text-on-surface-variant/50 hover:text-surface-tint hover:border-surface-tint/30 hover:bg-surface-tint/5"
            )}
            title="Load .kalr file"
          >
            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[8px] text-on-surface-variant/40 mt-1.5 text-center uppercase tracking-tighter">
          {isPlaying ? "Playback in progress..." : isRecording ? "Capturing diffs..." : isArmed ? "Starts on next Play" : "Arm to capture a .kalr session"}
        </p>
      </div>

      {/* Recordings List Header */}
      <div className="shrink-0 flex items-center justify-between mb-1.5">
        <h4 className="font-label-uppercase text-[8px] text-on-surface-variant/40 uppercase tracking-widest flex items-center gap-1.5">
          <ClockIcon className="w-2.5 h-2.5" />
          Takes
        </h4>
        <span className="font-mono text-[8px] text-on-surface-variant/30">{projectRecordings.length + (isRecording ? 1 : 0)}</span>
      </div>
      
      {/* Scrollable Recordings List */}
      <div className="flex-grow overflow-y-auto pr-1 -mr-1 space-y-1.5 scroll-hide min-h-0">
        {/* Active Recording Placeholder */}
        {isRecording && (
          <div className="p-2.5 bg-red-500/5 border border-red-500/30 rounded-lg relative overflow-hidden group animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="absolute top-0 left-0 w-0.5 h-full bg-red-500 animate-pulse"></div>
            <div className="flex justify-between items-center pl-1">
              <span className="font-mono text-[9px] text-red-500 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Recording...
              </span>
              <span className="font-mono text-[8px] text-red-500 bg-red-500/10 px-1 rounded">{elapsed}</span>
            </div>
          </div>
        )}

        {projectRecordings.length === 0 && !isRecording ? (
          <div className="h-20 flex flex-col items-center justify-center border border-dashed border-outline-variant/30 rounded-lg bg-surface-container-low/20">
            <MicrophoneIcon className="w-5 h-5 text-on-surface-variant/10 mb-1" />
            <span className="text-[9px] text-on-surface-variant/30 font-mono">No recordings yet</span>
          </div>
        ) : (
          projectRecordings.map((rec) => {
            const isThisPlaying = playingRecordingId === rec.id;
            
            return (
              <div 
                key={rec.id} 
                className={cx(
                  "p-2.5 rounded-lg transition-all duration-300 group relative overflow-hidden",
                  isThisPlaying
                    ? "bg-primary/5 border border-primary/50 shadow-[0_0_20px_rgba(201,168,76,0.15)]"
                    : "bg-surface-container-high/20 border border-outline-variant/50 hover:border-surface-tint/30"
                )}
              >
                {/* Left accent bar */}
                <div className={cx(
                  "absolute top-0 left-0 w-0.5 h-full transition-colors duration-300",
                  isThisPlaying ? "bg-primary animate-pulse" : "bg-surface-tint/40 group-hover:bg-surface-tint"
                )}></div>
                
                {/* Header row: name + duration */}
                <div className="flex justify-between items-start mb-0.5 pl-1">
                  <span className={cx(
                    "font-mono text-[9px] font-bold truncate pr-2",
                    isThisPlaying ? "text-primary" : "text-on-surface"
                  )}>{rec.name}</span>
                  <span className={cx(
                    "font-mono text-[8px] px-1 rounded shrink-0",
                    isThisPlaying ? "text-primary bg-primary/10" : "text-surface-tint bg-surface-tint/10"
                  )}>{rec.duration}</span>
                </div>
                
                {/* Playback progress bar — only visible during playback, clickable for seek */}
                {isThisPlaying && (
                  <div className="pl-1 mb-1.5 mt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[8px] text-primary/70">{formatMs(currentTimeMs)}</span>
                      <div 
                        className="flex-grow h-[6px] bg-primary/10 rounded-full overflow-hidden cursor-pointer group/seek relative hover:h-[8px] transition-all duration-150"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          seekTo(ratio * totalDurationMs);
                        }}
                        title="Click to seek"
                      >
                        <div 
                          className="h-full bg-primary rounded-full transition-[width] duration-100 ease-linear relative"
                          style={{ width: `${progressPercent}%` }}
                        >
                          {/* Seek head */}
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_rgba(201,168,76,0.6)] opacity-0 group-hover/seek:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                      <span className="font-mono text-[8px] text-primary/40">{formatMs(totalDurationMs)}</span>
                    </div>
                  </div>
                )}
                
                {/* Footer row: date + controls */}
                <div className="flex justify-between items-center pl-1">
                  <span className="text-[8px] text-on-surface-variant/50 font-mono">{new Date(rec.date).toLocaleDateString()}</span>
                  <div className="flex items-center gap-0.5">
                    {isThisPlaying ? (
                      <>
                        {/* Pause / Resume */}
                        <button
                          onClick={() => isPaused ? resumePlayback() : pausePlayback()}
                          className="text-primary hover:text-primary/80 transition-colors p-0.5"
                          title={isPaused ? "Resume Playback" : "Pause Playback"}
                        >
                          {isPaused ? (
                            <PlayIcon className="w-3.5 h-3.5" />
                          ) : (
                            <PauseIcon className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {/* Stop */}
                        <button
                          onClick={stopPlayback}
                          className="text-red-400 hover:text-red-300 transition-colors p-0.5"
                          title="Stop Playback"
                        >
                          <StopIcon className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Play */}
                        <button
                          onClick={() => startPlayback(rec)}
                          disabled={isPlaying || isRecording}
                          className={cx(
                            "transition-colors p-0.5",
                            (isPlaying || isRecording)
                              ? "text-on-surface-variant/20 cursor-not-allowed"
                              : "text-on-surface-variant hover:text-primary"
                          )}
                          title="Play Recording"
                        >
                          <PlayIcon className="w-3.5 h-3.5" />
                        </button>
                        {/* Download */}
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
                          className="text-on-surface-variant hover:text-surface-tint transition-colors p-0.5"
                          title="Download Recording"
                        >
                          <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Storage Indicator — pinned at bottom */}
      <div className="shrink-0 mt-3 pt-3 border-t border-outline-variant/20">
        <div className="flex justify-between items-center mb-1">
          <span className="font-label-uppercase text-[7px] text-on-surface-variant/40 tracking-widest uppercase">Memory</span>
          <span className="font-mono text-[7px] text-on-surface-variant/40">IndexedDB</span>
        </div>
        <div className="w-full h-[2px] bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-surface-tint/30 w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

