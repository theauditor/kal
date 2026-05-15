import NumberInput from '@src/repl/components/NumberInput';
import { WindowControls } from '@src/repl/components/panel/WindowControls';
import { useTauriWindow } from '@src/repl/components/panel/useTauriWindow';

export default function UdelsHeader(Props) {
  const { numWindows, setNumWindows } = Props;
  const { handleDrag } = useTauriWindow();

  return (
    <header id="header" data-tauri-drag-region onMouseDown={handleDrag} className="flex text-white z-[100] text-lg select-none bg-neutral-800 justify-between items-center">
      <div className="px-4 items-center gap-2 flex space-x-2 md:pt-0 select-none h-full">
        <h1 onClick={() => {}} className={'text-l cursor-pointer flex gap-4'}>
          <div className={'mt-[1px] cursor-pointer'}>🌀</div>

          <div className={'animate-pulse'}>
            <span className="">strudel</span> <span className="text-sm">-UDELS</span>
          </div>
        </h1>
        <NumberInput value={numWindows} setValue={setNumWindows} />
      </div>
      <WindowControls />
    </header>
  );
}
