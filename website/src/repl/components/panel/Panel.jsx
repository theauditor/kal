import { KaalLogoReact } from '@branding/KaalLogoReact';
import { Bars3Icon, PlayIcon, StopIcon, XMarkIcon } from '@heroicons/react/16/solid';
import cx from '@src/cx.mjs';
import { StrudelIcon } from '@src/repl/components/icons/StrudelIcon';
import { useSettings, setIsZen, setIsPanelOpened, setActiveFooter as setTab } from '../../../settings.mjs';
import { useViewingPatternData } from '../../../user_pattern_utils.mjs';
import '../../Repl.css';
import { useLogger } from '../useLogger';
import { ConsoleTab } from './ConsoleTab';
import ExportTab from './ExportTab';
import { FilesTab } from './FilesTab';
import { PatternsTab } from './PatternsTab';
import { Reference } from './Reference';
import { SettingsTab } from './SettingsTab';
import { SoundsTab } from './SoundsTab';
import { WelcomeTab } from './WelcomeTab';

const TAURI = typeof window !== 'undefined' && window.__TAURI__;

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export function LogoButton({ context, isEmbedded }) {
  const { started } = context;
  const { isZen, isCSSAnimationDisabled } = useSettings();
  const isPerformanceMode = typeof window !== 'undefined' && window.location.pathname.includes('/p');
  return (
    <div
      className={cx(
        'flex items-center justify-center transition-all duration-700',
        started && !isCSSAnimationDisabled && 'scale-110',
        'cursor-pointer z-[200]',
        isZen ? 'fixed top-2 left-4' : 'relative'
      )}
      onClick={() => {
        if (!isEmbedded) {
          setIsZen(!isZen);
        }
      }}
    >
      <div className={cx(
        "absolute inset-0 bg-primary opacity-0 blur-2xl transition-opacity duration-1000",
        started && "opacity-20"
      )}></div>
      <KaalLogoReact 
        size={32} 
        className={cx(
          "relative z-10 transition-all duration-700",
          started && !isCSSAnimationDisabled && "drop-shadow-[0_0_15px_rgba(201,168,76,0.6)]"
        )} 
      />
    </div>
  );
}

export function MainPanel({ context, isEmbedded = false, className }) {
  const { isZen, isButtonRowHidden, fontFamily } = useSettings();
  const viewingPattern = useViewingPatternData();
  const projectName = viewingPattern?.name || 'Untitled Project';
  const isPerformanceMode = typeof window !== 'undefined' && window.location.pathname.includes('/p');

  return (
    <nav
      id="header"
      className={cx(
        'flex-none z-[100] select-none h-11',
        !isZen && isPerformanceMode && 'bg-surface-container-low border-b-[1px] border-primary/40 shadow-lg',
        !isZen && !isPerformanceMode && 'bg-surface-container-low border-b border-outline-variant shadow-lg',
        isZen ? 'fixed top-0 left-0 w-8' : 'w-full relative',
        'flex items-center',
        className,
      )}
      style={{ fontFamily: 'Sora, sans-serif' }}
    >
      <div className={cx('flex w-full justify-between h-full')}>
        <div className="px-margin-desktop flex items-center gap-6 select-none relative h-full">
          <LogoButton context={context} isEmbedded={isEmbedded} />
          {!isZen && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-sm font-bold tracking-[0.2em] uppercase text-primary drop-shadow-[0_0_12px_rgba(255,242,204,0.3)] truncate max-w-[300px]">
                  {projectName}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-outline-variant/60"></div>
              <nav className="hidden sm:flex items-center gap-6">
                <a className="font-label-uppercase text-[9px] tracking-[0.2em] text-primary border-b border-primary pb-0.5" href="#">REPL</a>
                <a className="font-label-uppercase text-[9px] tracking-[0.2em] text-primary/70 hover:text-primary transition-all duration-300" href="/">STATION</a>
              </nav>
            </div>
          )}
        </div>
        {!isZen && (
          <div className="flex grow justify-end">
            {!isButtonRowHidden && <MainMenu isEmbedded={isEmbedded} context={context} />}
            <PanelToggle isEmbedded={isEmbedded} isZen={isZen} />
          </div>
        )}
      </div>
    </nav>
  );
}

export function Footer({ context, isEmbedded = false }) {
  return (
    <div className="border-t border-muted bg-lineHighlight block lg:hidden">
      <MainMenu context={context} isEmbedded={isEmbedded} />
    </div>
  );
}

function MainMenu({ context, isEmbedded = false, className }) {
  const { started, pending, isDirty, activeCode, handleTogglePlay, handleEvaluate, handleExportKals } = context;
  const { isCSSAnimationDisabled } = useSettings();
  const btnClass = 'px-3 py-1 font-label-uppercase text-label-uppercase transition-all duration-200 flex items-center gap-2';
  
  return (
    <div className={cx('flex items-center gap-4 px-margin-desktop h-full', className)}>
      <button
        onClick={handleTogglePlay}
        title={started ? 'stop' : 'play'}
        className={cx(btnClass, 'text-on-surface hover:text-surface-tint', !started && !isCSSAnimationDisabled && 'animate-pulse')}
      >
        {started ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        {!isEmbedded && <span>{pending ? '...' : started ? 'STOP' : 'PLAY'}</span>}
      </button>
      
      <button
        onClick={handleEvaluate}
        title="update"
        className={cx(btnClass, !isDirty || !activeCode ? 'opacity-30 cursor-not-allowed' : 'text-surface-tint hover:opacity-80')}
      >
        {!isEmbedded && <span>UPDATE</span>}
      </button>

      {!isEmbedded && (
        <button
          title="export"
          className={cx(btnClass, 'text-on-surface-variant hover:text-surface-tint')}
          onClick={handleExportKals}
        >
          <span>EXPORT</span>
        </button>
      )}

      {!isEmbedded && (
        <a
          title="learn"
          href={`${baseNoTrailing}/workshop/getting-started/`}
          className={cx(btnClass, 'text-on-surface-variant hover:text-surface-tint')}
        >
          <span>LEARN</span>
        </a>
      )}
    </div>
  );
}

function PanelCloseButton() {
  const { isPanelOpen } = useSettings();
  return (
    isPanelOpen && (
      <button
        onClick={() => setIsPanelOpened(false)}
        className={cx('px-2 py-0 text-foreground hover:opacity-50')}
        aria-label="Close Menu"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    )
  );
}

export function BottomPanel({ context }) {
  const { isPanelOpen, activeFooter: tab } = useSettings();
  return (
    <PanelNav
      className={cx(
        isPanelOpen ? `min-h-[360px] max-h-[360px]` : 'min-h-10 max-h-10',
        'overflow-hidden flex flex-col relative glass-panel rounded-t-xl',
      )}
    >
      <div className="flex justify-between min-h-10 max-h-10 grid-cols-2 items-center border-t border-outline-variant">
        <PanelCloseButton />
        <Tabs setTab={setTab} tab={tab} className={cx(isPanelOpen && 'border-l border-outline-variant')} />
      </div>
      {isPanelOpen && (
        <div className="w-full h-full overflow-auto border-t border-outline-variant p-4">
          <PanelContent context={context} tab={tab} />
        </div>
      )}
    </PanelNav>
  );
}

export function RightPanel({ context }) {
  const settings = useSettings();
  const { activeFooter: tab, isPanelOpen } = settings;
  if (!isPanelOpen) {
    return;
  }
  return (
    <PanelNav
      settings={settings}
      className={cx(
        'shrink-0 h-full overflow-hidden glass-panel rounded-l-xl',
        isPanelOpen ? `min-w-[min(600px,100vw)] max-w-[min(600px,80vw)]` : 'min-w-12 max-w-12',
      )}
    >
      <div className={cx('flex flex-col h-full')}>
        <div className="flex justify-between w-full overflow-hidden border-b border-outline-variant min-h-10 max-h-10">
          <PanelCloseButton />
          <Tabs setTab={setTab} tab={tab} className="border-l border-outline-variant" />
        </div>
        <div className="overflow-auto h-full p-6">
          <PanelContent context={context} tab={tab} />
        </div>
      </div>
    </PanelNav>
  );
}

const tabNames = {
  welcome: 'intro',
  patterns: 'patterns',
  sounds: 'sounds',
  reference: 'reference',
  export: 'export',
  console: 'console',
  settings: 'settings',
};
if (TAURI) {
  tabNames.files = 'files';
}

function PanelNav({ children, className, ...props }) {
  const settings = useSettings();
  return (
    <nav
      onClick={() => {
        if (!settings.isPanelOpen) {
          setIsPanelOpened(true);
        }
      }}
      aria-label="Menu Panel"
      className={cx('h-full bg-surface-container-low/40 group overflow-x-auto', className)}
      {...props}
    >
      {children}
    </nav>
  );
}

function PanelContent({ context, tab }) {
  useLogger();
  switch (tab) {
    case tabNames.patterns:
      return <PatternsTab context={context} />;
    case tabNames.console:
      return <ConsoleTab />;
    case tabNames.sounds:
      return <SoundsTab />;
    case tabNames.reference:
      return <Reference />;
    case tabNames.export:
      return <ExportTab handleExport={context.handleExport} />;
    case tabNames.settings:
      return <SettingsTab started={context.started} />;
    case tabNames.files:
      return <FilesTab />;
    default:
      return <WelcomeTab context={context} />;
  }
}

function PanelTab({ label, isSelected, onClick }) {
  return (
    <>
      <button
        onClick={onClick}
        className={cx(
          'h-10 px-2 text-sm border-t-2 border-t-transparent text-foreground cursor-pointer hover:opacity-50 flex items-center space-x-1 border-b-2',
          isSelected ? 'border-foreground' : 'border-transparent',
        )}
      >
        {label}
      </button>
    </>
  );
}
function Tabs({ className }) {
  const { isPanelOpen, activeFooter: tab } = useSettings();
  return (
    <div
      className={cx(
        'px-2 w-full flex select-none max-w-full h-10 max-h-10 min-h-10 overflow-auto items-center',
        className,
      )}
    >
      {Object.keys(tabNames).map((key) => {
        const val = tabNames[key];
        return <PanelTab key={key} isSelected={tab === val && isPanelOpen} label={key} onClick={() => setTab(val)} />;
      })}
    </div>
  );
}

export function PanelToggle({ isEmbedded, isZen }) {
  const { panelPosition, isPanelOpen } = useSettings();
  return (
    !isEmbedded &&
    !isZen &&
    panelPosition === 'right' && (
      <button
        title="menu"
        className={cx('border-l border-muted px-2 py-0 text-foreground hover:opacity-50')}
        onClick={() => setIsPanelOpened(!isPanelOpen)}
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
    )
  );
}
