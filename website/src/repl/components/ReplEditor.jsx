import { Code } from '@src/repl/components/Code';
import Loader from '@src/repl/components/Loader';
import { BottomPanel, MainPanel, RightPanel } from '@src/repl/components/panel/Panel';
import UserFacingErrorMessage from '@src/repl/components/UserFacingErrorMessage';
import { useSettings } from '@src/settings.mjs';
import cx from '@src/cx.mjs';
import { VisualizerSuite } from '@src/repl/components/VisualizerSuite';
import { RecordingPanel } from '@src/repl/components/RecordingPanel';
import { HistoryPanel } from '@src/repl/components/HistoryPanel';
import { useViewingPatternData } from '@src/user_pattern_utils.mjs';
import { useEffect, useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

// type Props = {
//  context: replcontext,
// }

export default function ReplEditor(Props) {
  const { context, ...editorProps } = Props;
  const { containerRef, editorRef, error, init, pending, started, isDirty, activeCode, handleTogglePlay, handleEvaluate, showHistory, setShowHistory } = context;
  const settings = useSettings();
  const viewingPatternData = useViewingPatternData();
  const { panelPosition, isZen } = settings;
  const isEmbedded = typeof window !== 'undefined' && window.location !== window.parent.location;
  const isPerformanceMode = typeof window !== 'undefined' && window.location.pathname.includes('/p');

  const [cps, setCps] = useState(0);

  useEffect(() => {
    if (!started || !editorRef?.current?.repl?.scheduler) return;
    
    setCps(editorRef.current.repl.scheduler.cps);
    
    const interval = setInterval(() => {
      const currentCps = editorRef.current.repl.scheduler.cps;
      if (currentCps !== undefined) {
         setCps(currentCps);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [started, editorRef]);

  const cpm = Math.round(cps * 60);
  const bpm = Math.round(cpm * 4);

  return (
    <div className={cx(
      "h-full flex flex-col relative text-on-background selection:bg-surface-tint/30 font-body-standard overflow-hidden",
      isZen ? "bg-black" : "bg-background"
    )} {...editorProps}>
      {isZen && (
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-80">
          <VisualizerSuite started={started} />
        </div>
      )}
      <Loader active={pending} />
      
      {/* TopAppBar - Global Controls */}
      <MainPanel context={context} isEmbedded={isEmbedded} />
      
      {/* Main Workspace */}
      <main className={cx(
        "flex-grow grid grid-cols-1 gap-0 overflow-hidden relative z-10",
        !isZen && "md:grid-cols-[1fr_320px]"
      )}>
        
        {/* Editor Section */}
        <section className={cx(
          "relative flex flex-col overflow-hidden",
          isZen ? "bg-transparent" : "bg-surface-container-lowest border-r border-outline-variant"
        )}>
          

          <div className="flex overflow-hidden h-full relative">
            <Code containerRef={containerRef} editorRef={editorRef} init={init} isZen={isZen} />
            {/* The existing RightPanel (tabs) can be toggled and will slide over the editor or aside */}
            {!isZen && panelPosition === 'right' && <RightPanel context={context} />}
          </div>
        </section>

        {/* Kāl Sidebar / Performance Visualizer */}
        {!isZen && (
          <aside className="hidden md:flex flex-col h-full min-h-0 bg-surface-container-low/30 overflow-hidden border-l border-outline-variant">
            {/* Signal Flow Visualizer */}
            <div className="relative h-[300px] border-b border-outline-variant group/viz overflow-hidden">
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <div className="absolute inset-0 opacity-10 group-hover/viz:opacity-20 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface-tint/20 via-transparent to-transparent"></div>
                <div className="relative z-10 w-full h-full">
                  <VisualizerSuite started={started} />
                </div>
              </div>
            </div>

            {/* Artist / Stage Plaque Section - Hidden when history is open to give more space */}
            {!showHistory && (
              <div className="border-b border-outline-variant relative overflow-hidden group flex flex-col shrink-0">
                {/* Cover Art Background */}
                <div className="relative h-64 w-full overflow-hidden bg-surface-container-high">
                  {viewingPatternData?.coverArt ? (
                    <img 
                      src={viewingPatternData.coverArt} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      alt="Cover Art" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <span className="material-symbols-outlined text-[120px]">music_note</span>
                    </div>
                  )}
                  
                  {/* Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
                  
                  {/* Top Work Label */}
                  <div className="absolute top-6 left-6 flex flex-col gap-1">
                    <h3 className="text-[10px] font-mono tracking-[0.4em] text-white/50 uppercase">COLLECTION :: {viewingPatternData?.genre || 'EXPERIMENTAL'}</h3>
                  </div>
                </div>

                <div className="px-8 pb-8 -mt-20 relative z-10 flex flex-col gap-6">
                  {/* Title & History Button */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-white text-3xl font-display-lg tracking-tight uppercase font-bold leading-tight drop-shadow-2xl">
                        {viewingPatternData?.name || 'Untitled Composition'}
                      </div>
                      
                      {viewingPatternData?.id && viewingPatternData.id !== 'new' && (
                        <button 
                          onClick={() => setShowHistory(!showHistory)}
                          className={cx(
                            "px-3 py-1 rounded-full border text-[9px] font-mono uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2",
                            showHistory 
                              ? "bg-primary text-on-primary border-primary" 
                              : "bg-black/20 backdrop-blur-md text-primary border-primary/40 hover:bg-primary hover:text-on-primary hover:border-primary shadow-lg"
                          )}
                        >
                          <ClockIcon className="w-3 h-3" />
                          {showHistory ? 'Close History' : 'View History'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Typography Grid - Photograph Corner Style */}
                  <div className="space-y-4 font-mono text-[10px] tracking-wider text-on-surface-variant/60">
                    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-1">
                      <span className="text-[8px] opacity-40 uppercase">Artist</span>
                      <span className="text-on-surface uppercase font-bold">{viewingPatternData?.artist?.name || 'ANONYMOUS'}</span>
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-1">
                      <span className="text-[8px] opacity-40 uppercase">Venue</span>
                      <span className="text-on-surface uppercase">{viewingPatternData?.venue || 'KĀL_STATION_01'}</span>
                    </div>

                    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-1">
                      <span className="text-[8px] opacity-40 uppercase">Session Date</span>
                      <span className="text-on-surface uppercase">{viewingPatternData?.date ? new Date(viewingPatternData.date).toLocaleDateString() : '2026.05.14'}</span>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-2 flex justify-between items-center opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                    <div className="text-[8px] font-mono uppercase tracking-widest">
                      ID // {viewingPatternData?.id || 'TEMP_SESSION'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(201,168,76,0.8)]"></div>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-primary">Live Signal Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Content: Recording or History */}
            <div className={cx(
              "flex-grow flex flex-col min-h-0 overflow-hidden",
              showHistory ? "p-0" : "p-4"
            )}>
              {showHistory ? (
                <HistoryPanel context={context} />
              ) : (
                <RecordingPanel context={context} />
              )}
            </div>
          </aside>
        )}
      </main>

      <UserFacingErrorMessage error={error} />
      {!isZen && panelPosition === 'bottom' && <BottomPanel context={context} />}

      {/* Kāl Footer / Status Bar */}
      {!isZen && (
        <footer className="h-10 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between px-margin-desktop z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className={cx(
                "w-2 h-2 rounded-full transition-all duration-300",
                started ? "bg-primary shadow-[0_0_12px_rgba(201,168,76,0.8)] animate-pulse" : "bg-outline-variant opacity-50"
              )}></span>
              <span className="font-cinzel text-[10px] text-on-surface tracking-[0.3em] font-bold">
                {started ? 'LIVE SESSION ACTIVE' : 'ENGINE STANDBY'}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 border-l border-outline-variant/30 pl-8">
              <span className="font-label-uppercase text-[9px] text-on-surface-variant/50">PERFORMANCE DENSITY</span>
              <span className="font-mono text-[11px] text-primary font-bold">{started ? `${cpm} CPM | ${bpm} BPM` : '0 CPM | 0 BPM'}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <span className="font-mono text-[10px] text-on-surface-variant/40 select-none">Ln 1, Col 1</span>
             <div className="h-3 w-[1px] bg-outline-variant/30"></div>
             <span className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-tighter">STRUDEL_CORE :: V1.2.6</span>
          </div>
        </footer>
      )}
    </div>
  );
}
