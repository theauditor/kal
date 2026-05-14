import { tags as t } from '@lezer/highlight';
import { createTheme } from './theme-helper.mjs';

export const settings = {
  background: '#0a0a0a',
  lineBackground: '#1a1a1a',
  foreground: '#ffffff',
  muted: '#888888',
  caret: '#c9a84c',
  selection: '#c9a84c40',
  selectionMatch: '#c9a84c26',
  lineHighlight: '#c9a84c1a',
  gutterBackground: 'transparent',
  gutterForeground: '#666666',
};

export default createTheme({
  theme: 'dark',
  settings,
  styles: [
    { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#c9a84c' },
    { tag: t.labelName, color: '#c9a84c' },
    { tag: t.keyword, color: '#c9a84c' },
    { tag: t.operator, color: '#c9a84c' },
    { tag: t.special(t.variableName), color: '#e6d5a1' },
    { tag: t.typeName, color: '#e6d5a1' },
    { tag: t.atom, color: '#b59132' },
    { tag: t.number, color: '#e6d5a1' },
    { tag: t.definition(t.variableName), color: '#ffffff' },
    { tag: t.string, color: '#e6d5a1' },
    { tag: t.special(t.string), color: '#e6d5a1' },
    { tag: t.comment, color: '#888888' },
    { tag: t.variableName, color: '#ffffff' },
    { tag: t.tagName, color: '#c9a84c' },
    { tag: t.bracket, color: '#888888' },
    { tag: t.meta, color: '#c9a84c' },
    { tag: t.attributeName, color: '#e6d5a1' },
    { tag: t.propertyName, color: '#ffffff' },
    { tag: t.className, color: '#e6d5a1' },
    { tag: t.invalid, color: '#ffb4ab' },
    { tag: [t.unit, t.punctuation], color: '#888888' },
  ],
});
