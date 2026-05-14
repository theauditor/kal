import { code2hash, errorLogger, evalScope, hash2code, logger } from '@strudel/core';
export { code2hash, hash2code };
import { settingPatterns } from '../settings.mjs';
import { setVersionDefaults } from '@strudel/webaudio';
import { getMetadata } from '../metadata_parser';
import { isTauri } from '../tauri.mjs';
import './Repl.css';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { $featuredPatterns /* , loadDBPatterns */ } from '@src/user_pattern_utils.mjs';

export async function initCode() {
  // load code from url hash (either project ID or decode long hash)
  try {
    const initialUrl = window.location.href;
    const codeParam = initialUrl.split('#')[1] || '';
    if (codeParam) {
      // If it's a base64 encoded string, decode it
      if (codeParam.length > 20) {
        return hash2code(codeParam);
      }
      // Project ID detection handled in LandingPage.jsx
    }
  } catch (err) {
    console.warn('failed to decode', err);
  }
}

export const parseJSON = (json) => {
  json = json != null && json.length ? json : '{}';
  try {
    return JSON.parse(json);
  } catch {
    return '{}';
  }
};

export async function getRandomTune() {
  await dbLoaded;
  const featuredTunes = Object.entries($featuredPatterns.get());
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const [_, data] = randomItem(featuredTunes);
  return data;
}

export function loadModules() {
  let modules = [
    import('@strudel/core'),
    import('@strudel/draw'),
    import('@strudel/edo'),
    import('@strudel/tonal'),
    import('@strudel/mini'),
    import('@strudel/xen'),
    import('@strudel/webaudio'),
    import('@strudel/codemirror'),
    import('@strudel/hydra'),
    import('@strudel/serial'),
    import('@strudel/soundfonts'),
    import('@strudel/csound'),
    import('@strudel/tidal'),
    import('@strudel/gamepad'),
    import('@strudel/motion'),
    import('@strudel/mqtt'),
    import('@strudel/mondo'),
  ];
  if (isTauri()) {
    modules = modules.concat([
      import('@strudel/desktopbridge/loggerbridge.mjs'),
      import('@strudel/desktopbridge/midibridge.mjs'),
      import('@strudel/desktopbridge/oscbridge.mjs'),
    ]);
  } else {
    modules = modules.concat([import('@strudel/midi'), import('@strudel/osc')]);
  }

  return evalScope(settingPatterns, ...modules);
}
// confirm dialog is a promise in webkit and a boolean in other browsers... normalize it to be a promise everywhere
export function confirmDialog(msg) {
  const confirmed = confirm(msg);
  if (confirmed instanceof Promise) {
    return confirmed;
  }
  return new Promise((resolve) => {
    resolve(confirmed);
  });
}
export const SETTING_CHANGE_RELOAD_MSG = 'Changing this setting requires the window to reload itself. OK?';

export function confirmAndReloadPage(onSuccess) {
  confirmDialog(SETTING_CHANGE_RELOAD_MSG).then((r) => {
    if (r == true) {
      try {
        onSuccess();
        return window.location.reload();
      } catch (e) {
        errorLogger(e);
      }
    }
  });
}
//RIP due to SPAM
// let lastShared;
// export async function shareCode(codeToShare) {
//   // const codeToShare = activeCode || code;
//   if (lastShared === codeToShare) {
//     logger(`Link already generated!`, 'error');
//     return;
//   }

//   confirmDialog(
//     'Do you want your pattern to be public? If no, press cancel and you will get just a private link.',
//   ).then(async (isPublic) => {
//     const hash = nanoid(12);
//     const shareUrl = window.location.origin + window.location.pathname + '?' + hash;
//     const { error } = await supabase.from('code_v1').insert([{ code: codeToShare, hash, ['public']: isPublic }]);
//     if (!error) {
//       lastShared = codeToShare;
//       // copy shareUrl to clipboard
//       if (isTauri()) {
//         await writeText(shareUrl);
//       } else {
//         await navigator.clipboard.writeText(shareUrl);
//       }
//       const message = `Link copied to clipboard: ${shareUrl}`;
//       alert(message);
//       // alert(message);
//       logger(message, 'highlight');
//     } else {
//       console.log('error', error);
//       const message = `Error: ${error.message}`;
//       // alert(message);
//       logger(message);
//     }
//   });
// }

export async function shareCode(codeToShare) {
  try {
    const hash = '#' + code2hash(codeToShare);
    const shareUrl = window.location.origin + window.location.pathname + hash;
    if (isTauri()) {
      await writeText(shareUrl);
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
    const message = `Link copied to clipboard!`;
    alert(message);
    logger(message, 'highlight');
  } catch (e) {
    console.error(e);
  }
}

export const isIframe = () => window.location !== window.parent.location;
function isCrossOriginFrame() {
  try {
    return !window.top.location.hostname;
  } catch (e) {
    return true;
  }
}

export const isUdels = () => {
  if (isCrossOriginFrame()) {
    return false;
  }
  return window.top?.location?.pathname.includes('udels');
};

export function setVersionDefaultsFrom(code) {
  try {
    const metadata = getMetadata(code);
    setVersionDefaults(metadata.version);
  } catch (err) {
    console.error('Error parsing metadata..');
    console.error(err);
  }
}
