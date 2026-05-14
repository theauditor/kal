import { tags as t } from '@lezer/highlight';
import { createTheme } from './theme-helper.mjs';

export const settings = {
  background: '#0b141e',
  lineBackground: '#131c2699',
  foreground: '#dae3f1',
  muted: '#849495',
  caret: '#00dbe9',
  selection: 'rgba(0, 219, 233, 0.3)',
  selectionMatch: '#00dbe926',
  lineHighlight: '#222b3550',
  gutterBackground: 'transparent',
  gutterForeground: '#849495',
};

export default createTheme({
  theme: 'dark',
  settings,
  styles: [
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#00dbe9' },
    { tag: t.labelName, color: '#00dbe9' },
    { tag: t.keyword, color: '#c4c6ce' },
    { tag: t.operator, color: '#00dbe9' },
    { tag: t.special(t.variableName), color: '#dbfcff' },
    { tag: t.typeName, color: '#b9cacb' },
    { tag: t.atom, color: '#00f0ff' },
    { tag: t.number, color: '#00f0ff' },
    { tag: t.definition(t.variableName), color: '#7df4ff' },
    { tag: t.string, color: '#dbfcff' },
    { tag: t.special(t.string), color: '#dbfcff' },
    { tag: t.comment, color: '#849495' },
    { tag: t.variableName, color: '#dae3f1' },
    { tag: t.tagName, color: '#00dbe9' },
    { tag: t.bracket, color: '#3b494b' },
    { tag: t.meta, color: '#00dbe9' },
    { tag: t.attributeName, color: '#c4c6ce' },
    { tag: t.propertyName, color: '#c4c6ce' },
    { tag: t.className, color: '#dbfcff' },
    { tag: t.invalid, color: '#ffb4ab' },
    { tag: [t.unit, t.punctuation], color: '#849495' },
  ],
});
