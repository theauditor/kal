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

  return (
    <div className="h-full flex flex-col relative bg-background text-on-background selection:bg-surface-tint/30 font-body-standard overflow-hidden" {...editorProps}>
      <Loader active={pending} />
      
      {/* TopAppBar - Global Controls */}
      <MainPanel context={context} isEmbedded={isEmbedded} />
      
      {/* Main Workspace */}
      <main className="flex-grow grid grid-cols-1 md:grid-cols-[1fr_320px] gap-0 overflow-hidden relative">
        
        {/* Editor Section */}
        <section className="relative flex flex-col bg-surface-container-lowest overflow-hidden border-r border-outline-variant">
          

          <div className="flex overflow-hidden h-full relative">
            <Code containerRef={containerRef} editorRef={editorRef} init={init} />
            {/* The existing RightPanel (tabs) can be toggled and will slide over the editor or aside */}
            {!isZen && panelPosition === 'right' && <RightPanel context={context} />}
          </div>
        </section>

        {/* Kāl Sidebar / Performance Visualizer */}
        {!isZen && (
          <aside className="hidden md:flex flex-col bg-surface-container-low/30 overflow-y-auto scroll-hide border-l border-outline-variant">
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
              <div className="p-8 border-b border-outline-variant relative overflow-hidden group">
                {/* Subtle background texture/gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700"></div>
                
                <div className="relative z-10 flex flex-col gap-6">
                  {/* Minimalist Title */}
                  <div className="flex items-start gap-4">
                    {viewingPatternData?.coverArt && (
                      <div className="w-12 h-12 shrink-0 rounded border border-outline-variant/30 overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        <img src={viewingPatternData.coverArt} className="w-full h-full object-cover" alt="Cover" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-mono tracking-[0.3em] text-on-surface-variant/30 uppercase">WORK_TITLE</h3>
                      <div className="text-primary text-xl font-display-lg tracking-tight uppercase font-bold leading-tight border-l-2 border-primary/20 pl-4">
                        {viewingPatternData?.name || 'Untitled Composition'}
                      </div>
                      
                      {/* History Tag Button */}
                      {viewingPatternData?.id && viewingPatternData.id !== 'new' && (
                        <button 
                          onClick={() => setShowHistory(!showHistory)}
                          className={cx(
                            "mt-2 ml-4 px-2 py-0.5 rounded-full border text-[8px] font-mono uppercase tracking-[0.2em] transition-all duration-300",
                            showHistory 
                              ? "bg-primary text-on-primary border-primary" 
                              : "bg-transparent text-primary/60 border-primary/20 hover:border-primary/50 hover:text-primary"
                          )}
                        >
                          {showHistory ? 'Close History' : 'View History'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Typography Grid - Photograph Corner Style */}
                  <div className="space-y-4 font-mono text-[10px] tracking-wider text-on-surface-variant/60">
                    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-1">
                      <span className="text-[8px] opacity-40 uppercase">Artist</span>
                      <span className="text-on-surface uppercase">{viewingPatternData?.artist?.name || 'ANONYMOUS'}</span>
                    </div>
                    
                    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-1">
                      <span className="text-[8px] opacity-40 uppercase">Venue</span>
                      <span className="text-on-surface uppercase">{viewingPatternData?.venue || 'KĀL_STATION_01'}</span>
                    </div>

                    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-1">
                      <span className="text-[8px] opacity-40 uppercase">Medium</span>
                      <span className="text-on-surface uppercase">{viewingPatternData?.genre || 'EXPERIMENTAL'} / CODE</span>
                    </div>

                    <div className="flex justify-between items-end border-b border-outline-variant/30 pb-1">
                      <span className="text-[8px] opacity-40 uppercase">Created</span>
                      <span className="text-on-surface uppercase">{viewingPatternData?.date ? new Date(viewingPatternData.date).toLocaleDateString() : '2026.05.14'}</span>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-2 flex justify-between items-center opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                    <div className="text-[8px] font-mono uppercase tracking-widest">
                      ID // {viewingPatternData?.id || 'TEMP_SESSION'}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-[8px] font-mono uppercase tracking-tighter">Verified session</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Content: Recording or History */}
            <div className={cx(
              "flex-grow flex flex-col min-h-0",
              showHistory ? "p-0" : "p-6"
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
              <span className="font-mono text-[11px] text-primary font-bold">{started ? '420 CPM' : '0 CPM'}</span>
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
