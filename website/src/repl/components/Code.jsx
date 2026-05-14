import cx from '@src/cx.mjs';

// type Props = {
//   containerRef:  React.MutableRefObject<HTMLElement | null>,
//   editorRef:  React.MutableRefObject<HTMLElement | null>,
//   init: () => void
// }
export function Code(Props) {
  const { editorRef, containerRef, init, isZen } = Props;

  return (
    <section
      className={cx(
        'code-container cursor-text pb-0 overflow-auto grow z-10 font-mono scroll-hide',
        isZen ? 'bg-transparent text-white drop-shadow-md' : 'bg-surface-container-lowest'
      )}
      ref={(el) => {
        containerRef.current = el;
        if (!editorRef.current) {
          init();
        }
      }}
    >
      <div className="absolute top-0 left-0 w-full h-[1.6em] code-glow-line mt-[1em] pointer-events-none opacity-50"></div>
    </section>
  );
}
