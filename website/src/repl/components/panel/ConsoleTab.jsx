import cx from '@src/cx.mjs';
import { useSettings } from '../../../settings.mjs';
import { useStore } from '@nanostores/react';
import { $strudel_log_history } from '../useLogger';
import { useEffect, useRef } from 'react';

export function ConsoleTab() {
  const log = useStore($strudel_log_history);
  const { fontFamily } = useSettings();
  const scrollRef = useRef();
  // scroll to bottom when log changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);
  return (
    <div id="console-tab" className="break-all w-full h-full font-mono bg-surface-container-low/20" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <div className="h-full w-full overflow-auto space-y-1 p-4 scroll-hide" ref={scrollRef}>
        {' '}
        {/* bg-background */}
        {log.map((l, i) => {
          const message = linkify(l.message);
          const color = l.data?.hap?.value?.color;
          return (
            <div
              key={l.id}
              className={cx(
                'whitespace-nowrap text-[11px] py-0.5 border-b border-outline-variant/10',
                l.type === 'error' ? 'text-error bg-error-container/20 px-2 rounded' : 'text-on-surface-variant/80',
                l.type === 'highlight' && 'text-surface-tint font-bold',
              )}
              style={color ? { color } : {}}
            >
              <span className="opacity-40 mr-2 select-none">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span dangerouslySetInnerHTML={{ __html: message }} className="whitespace-nowrap" />
              {l.count ? <span className="ml-2 text-[9px] bg-outline-variant/20 px-1 rounded">×{l.count}</span> : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function linkify(inputText) {
  var replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(replacePattern1, '<a class="underline" href="$1" target="_blank">$1</a>');

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(
    replacePattern2,
    '$1<a class="underline" href="http://$2" target="_blank">$2</a>',
  );

  //Change email addresses to mailto:: links.
  replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  replacedText = replacedText.replace(replacePattern3, '<a class="underline" href="mailto:$1">$1</a>');

  return replacedText;
}
